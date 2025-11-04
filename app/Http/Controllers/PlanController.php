<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Plan;
use App\Models\Replicado\ReplicadoAcademicRecord;
use App\Models\SuggestedPlan;
use App\Models\Group;
use App\Models\GroupSubject;
use Illuminate\Support\Facades\Log;
use function Spatie\LaravelPdf\Support\pdf;

class PlanController extends Controller
{
    public function index()
    {
        $plans = $this->getPlans(Auth::user() == null);
        $plannedSubjects = [];
        foreach ($plans as $plan) {
            if (isset($plan['subjects']) && is_array($plan['subjects'])) {
                foreach ($plan['subjects'] as $subject) {
                    if (!in_array($subject['code'], $plannedSubjects)) {
                        $plannedSubjects[] = $subject['code'];
                    }
                }
            }
        }
        return [$plans, $plannedSubjects];
    }

    public function getSuggestedPlans()
    {
        return $this->getPlans(True);
    }

    public function getPlansWithDefaultGroup()
    {
        $user = Auth::user();
        if ($user == null) {
            return [];
        }

        $plans = Plan::where('user_id', $user->id)
            ->select('subject_code')
            ->get();

        $defaultGroup = Group::where('title', 'Optativas Livres')->first();
        if (!$defaultGroup) {
            return [];
        }

        $result = [];

        foreach ($plans as $plan) {
            $subjectCode = $plan->subject_code;

            $belongsToGroup = GroupSubject::where('subject_code', $subjectCode)->exists();

            if (!$belongsToGroup) {
                $result[] = [
                    'subjectCode' => $subjectCode,
                    'groupId' => $defaultGroup->id
                ];
            }
        }

        return $result;
    }

    public function export()
    {
        $user = Auth::user();
        if ($user == null) {
            return response()->json(['error' => 'User not authenticated.'], 401);
        }

        $allPlans = Plan::where('user_id', $user->id)->get();

        if ($allPlans->isEmpty()) {
            return response()->json(['error' => 'No plans available to export.'], 400);
        }

        $allPlansGroupedBySemester = $allPlans->groupBy('semester')->map(function ($semester) {
            $formattedSemester = $semester->map(function ($plan) {
                return [
                    'name' => $plan->subject->name,
                    'code' => $plan->subject->code,
                    'lecture_credits' => $plan->subject->lecture_credits,
                    'work_credits' => $plan->subject->work_credits,
                ];
            });
            $formattedSemester['total_credits'] = $formattedSemester->sum('lecture_credits') + $formattedSemester->sum('work_credits');
            $formattedSemester['completed'] = $semester[0]->completed;
            return $formattedSemester;
        });

        $completedSemesters = $allPlansGroupedBySemester->filter(function ($semester) {
            return $semester['completed'];
        });
        $plannedSemesters   = $allPlansGroupedBySemester->filter(function ($semester) {
            return !$semester['completed'];
        });

        return pdf()->view('exportTemplate', [
            'user_name' => $user->name,
            'user_code' => $user->codpes,
            'completed_semesters' => $completedSemesters,
            'planned_semesters' => $plannedSemesters
        ])->name('export.pdf');
    }

    public function sync(Request $request)
    {
        $userId = Auth::user()->id;
        $changes = $request->json()->all();
        $userPlans = Plan::where('user_id', $userId)->get();
        $changedPlans = [];

        try {
            foreach ($changes as $change) {
                $existingPlan = $userPlans->where('subject_code', $change['subject_code'])->first();
                if ($existingPlan && isset($change['semester'])) {
                    $this->update($change['subject_code'], $change['semester'], $existingPlan['id']);

                    $changedPlans[] = [
                        'id' => $existingPlan['id'],
                        'subject_code' => $change['subject_code'],
                        'action' => 'updated',
                    ];
                } elseif (!$existingPlan && isset($change['semester'])) {
                    $this->store($change['subject_code'], $change['semester']);

                    $newPlan = Plan::where('user_id', $userId)
                        ->where('subject_code', $change['subject_code'])
                        ->where('semester', $change['semester'])
                        ->latest()
                        ->first();

                    $changedPlans[] = [
                        'id' => $newPlan->id,
                        'subject_code' => $newPlan->subject_code,
                        'action' => 'created',
                    ];
                } elseif ($existingPlan && !isset($change['semester'])) {
                    $this->destroy($existingPlan['id']);

                    $changedPlans[] = [
                        'id' => $existingPlan['id'],
                        'subject_code' => $change['subject_code'],
                        'action' => 'deleted',
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'changedPlans' => $changedPlans,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error synchronizing plans:', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function getPlans($suggestedPlans)
    {
        if ($suggestedPlans) {
            $plans = SuggestedPlan::all();
        } else {
            $this->syncWithReplication();
            $plans = Plan::where('user_id', Auth::user()->id)->get();
        }

        $groupedPlans = [];

        $minSemester = $plans->min('semester') ?? 1;
        $maxSemester = $plans->max('semester') ?? 8;
        for ($semester = min($minSemester, 1); $semester <= max($maxSemester, 8); $semester++) {
            $semesterPlans = $plans->filter(fn($plan) => $plan->semester == $semester);

            $groupedPlans[] = [
                'semesterId' => $semester,
                'subjects' => $semesterPlans->map(function ($plan) {
                    return [
                        'plan' => $plan->id,
                        'code' => $plan->subject_code,
                        'completed' => $plan->completed,
                    ];
                })->values()->all(),
            ];
        }

        return $groupedPlans;
    }


    private function syncWithReplication()
    {
        $user = Auth::user();
        $completedSemesters = $this->completed($user->codpes);

        DB::transaction(function () use ($completedSemesters, $user) {
            foreach ($completedSemesters as $semesterId => $semesterData) {
                foreach ($semesterData as $subject) {
                    $savedPlan = Plan::where('subject_code', $subject['subject_code'])
                        ->where('user_id', $user->id)
                        ->first();
                    if ($savedPlan == null) {
                        $validatedPlan = $this->store($subject['subject_code'], $semesterId, true);
                        $validatedPlan->save();
                    } else {
                        $savedPlan->semester = $semesterId;
                        $savedPlan->completed = true;
                        $savedPlan->save();
                    }
                }

                Plan::where('semester', $semesterId)
                    ->where('completed', false)
                    ->where('user_id', $user->id)
                    ->delete();
            }
        });
    }

    private function completed($nusp)
    {
        $records = ReplicadoAcademicRecord::where("nusp", $nusp)->get();
        $currentProgram = $records->max('program_code');
        $records = $records->where('program_code', $currentProgram)->values();

        $completedSemesters = [];

        $transferRecords = $records
            ->where('status', "D")->values();

        if (!$transferRecords->isEmpty()) {
            $transferKey = "0000.0";
            $completedSemesters = [$transferKey => []];
            foreach ($transferRecords as $record) {
                $completedSemesters[$transferKey][] = [
                    'subject_code' => $record->subject_code,
                ];
            }
        }

        $takenRecords = $records
            ->where('status', "A")->values();

        foreach ($takenRecords as $record) {
            // class_code => year + semester + class number
            $classCode = $record->class_code;
            $year = substr($classCode, 0, 4);
            $semester = substr($classCode, 4, 1);

            $semesterKey = $year . "." . $semester;

            if (!isset($completedSemesters[$semesterKey])) {
                $completedSemesters[$semesterKey] = [];
            }

            $completedSemesters[$semesterKey][] = [
                'subject_code' => $record->subject_code,
            ];
        }

        ksort($completedSemesters);

        // Remap array keys to sequential integers starting from 1
        $remappedSemesters = [];

        if ($transferRecords->isEmpty()) {
            $counter = 1;
        } else {
            $counter = 0;
        }

        foreach ($completedSemesters as $semesterKey => $subjects) {
            $remappedSemesters[$counter] = $subjects;
            $counter++;
        }

        return $remappedSemesters;
    }

    private function store($subject_code, $semester, $completed = false)
    {
        try {
            $plan = Plan::create([
                'user_id' => Auth::user()->id,
                'subject_code' => $subject_code,
                'semester' => $semester,
                'completed' => $completed
            ]);

            return $plan;
        } catch (\Exception $e) {
            Log::error('Error creating plan:', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function update($subject_code, $semester, $plan_id)
    {
        try {
            $plan = Plan::findOrFail($plan_id);

            $plan->update([
                'subject_code' => $subject_code,
                'semester' => $semester,
            ]);

            return $plan;
        } catch (\Exception $e) {
            Log::error('Error updating plan:', ['plan_id' => $plan_id, 'error' => $e->getMessage()]);
            return null;
        }
    }

    private function destroy($id)
    {
        $validated = validator(compact('id'), [
            'id' => 'required|exists:plans,id',
        ])->validate();

        try {
            $plan = Plan::findOrFail($id);
            $plan->delete();
            return true;
        } catch (\Exception $e) {
            Log::error('Error deleting plan:', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
