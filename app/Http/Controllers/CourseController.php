<?php
namespace App\Http\Controllers;

use App\Models\CurriculumTable;

class TestController extends Controller
{
	public function getMandatoryFromBCC($curriculumCode)
	{
		$baseCurriculum = CurriculumTable::where("id_curriculum", "like", $curriculumCode + "%")
			->where("mandatory", "O")
			->get();
		$baseCurriculum = $baseCurriculum->groupBy('id_subject') 
			->map(function ($group) { 
				return $group->sortBy('created_at')->last(); 
			});
		return $baseCurriculum;
	}
}