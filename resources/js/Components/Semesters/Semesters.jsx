import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import CardContentCourse from '../Atoms/CardContentCourse';
import Card from '../Atoms/Card';
import StyledButton from '../Atoms/StyledButton';
import {slideIn, slideOut, bounce, bounceBack} from '../Atoms/Animations';

const SemestersContainer = styled.div`
  flex-grow: 1;
  padding: 20px;
`;

const SemestersContainerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2%;
`;

const SemestersContainerHeaderPages = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 10%;
`;

const SemestersContainerHeaderView = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 10%;
`;

const SemesterContainer = styled.div`
  // animation: ${props => props.isOpen ? bounceBack : bounce} 2s ease-in-out -0.5s;
  // animation-fill-mode: both;
  width: 100%;
  padding: 2%;
  margin-bottom: 2%;

  background-color: #E4EEFA;

  clip-path: polygon(
    0px calc(100% - 8px),
    4px calc(100% - 8px),
    4px calc(100% - 4px),
    8px calc(100% - 4px),
    8px 100%,
    calc(100% - 8px) 100%,
    calc(100% - 8px) calc(100% - 4px),
    calc(100% - 4px) calc(100% - 4px),
    calc(100% - 4px) calc(100% - 8px),
    100% calc(100% - 8px),
    100% 8px,
    calc(100% - 4px) 8px,
    calc(100% - 4px) 4px,
    calc(100% - 8px) 4px,
    calc(100% - 8px) 0px,
    8px 0px,
    8px 4px,
    4px 4px,
    4px 8px,
    0px 8px
  );
`;

const SemesterHeader = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const SemesterInfos = styled.div`
  flex: 85;
  display: flex;
  justify-content: align-left;
  align-items: center;  
`;

const SemesterWarnings = styled.div`
  margin-left: 1%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SemesterCreditsAndIcon = styled.div`
  flex: 15;  
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CoursesList = styled.ul`
  margin-top: ${props => (props.expanded ? '1%' : '0')};
  list-style: none;
  padding: 0;
  overflow: hidden;  /* Importante para esconder o conteúdo quando fechado */
  display: flex;
  max-height: ${props => (props.expanded ? '500px' : '0')}; /* Define o limite de altura */
  animation: ${props => (props.expanded ? slideIn : slideOut)} 1s ease-in-out ${props => (props.expanded ? '-0.1s' : '-0.6s')};
  flex-wrap: wrap;
  gap: 10px;
`;


const CourseContainer = styled.li`
  width: 100px;
  height: 100px;
  background-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NewCard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 136px;
  height: 136px;

  background-color: #C2DCF5;

  clip-path: polygon(
    0px calc(100% - 8px),
    4px calc(100% - 8px),
    4px calc(100% - 4px),
    8px calc(100% - 4px),
    8px 100%,
    calc(100% - 8px) 100%,
    calc(100% - 8px) calc(100% - 4px),
    calc(100% - 4px) calc(100% - 4px),
    calc(100% - 4px) calc(100% - 8px),
    100% calc(100% - 8px),
    100% 8px,
    calc(100% - 4px) 8px,
    calc(100% - 4px) 4px,
    calc(100% - 8px) 4px,
    calc(100% - 8px) 0px,
    8px 0px,
    8px 4px,
    4px 4px,
    4px 8px,
    0px 8px
  );
`;

const NewSemester = styled.div`
  width: 100%;
  height: 136px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: #17538D;
  cursor: pointer;
`;

const Semesters = ({ plans }) => {
  const [courses] = useState(plans.map(plan => ({
    ...plan,  // Inclui os outros campos do plano original
    colors: {
      background: "#FFFFFF",
      innerLine: "#51A1E0",
      outerLine: "#17538D",
    },
    pokeball: "#C2DCF5"
  })));

  const semesters = [
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4},
    {id: 5},
    {id: 6},
    {id: 7},
    {id: 8},
  ];

  const [semestersCredits, setSemestersCredits] = useState(
    semesters.reduce((credits, semester) => {
      credits[semester.id] = {
        classCredits: 0,
        workCredits: 0
      }
      return credits;
    }, {})
  );

  const addCreditsToSemester = (semesterId, classCredits, workCredits) => {
    setSemestersCredits((prev) => ({
      ...prev,
      [semesterId]: {
        classCredits: prev[semesterId].classCredits + classCredits,
        workCredits: prev[semesterId].workCredits + workCredits
      },
    }));
  } 

  const [expandedSemesters, setExpandedSemesters] = useState(
    semesters.reduce((acc, semester) => {
      acc[semester.id] = false;
      return acc;
    }, {})
  );

  const toggleSemester = (semesterId) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }));
  };

  return (
    <SemestersContainer>
      <SemestersContainerHeader>
        <SemestersContainerHeaderPages>
          <StyledButton background_image={"/assets/a2.png"}>
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.65481 10.8578L2.56056 7.37673L1.25 5.90235V7.875V18V18.75H2H11H12.6701L11.5606 17.5017L8.44785 13.9999C9.61477 13.0933 11.0014 12.5625 12.5 12.5625C15.6482 12.5625 18.4061 14.8814 19.3802 18.2106L19.6061 18.9826L20.3604 18.7033L22.7304 17.8258L23.3876 17.5825L23.1894 16.9104C21.7238 11.9402 17.5434 8.25 12.5 8.25C9.90353 8.25 7.54201 9.23892 5.65481 10.8578Z" fill="white" stroke="#1B68AE" stroke-width="1.5"/>
            </svg>
          </StyledButton>
          <StyledButton background_image={"/assets/a2.png"}>
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.8052 11.9828C16.918 10.3639 14.5565 9.375 11.96 9.375C6.91672 9.375 2.7357 13.0652 1.28021 18.0368L1.08398 18.7071L1.73862 18.9505L4.09862 19.828L4.85363 20.1087L5.07982 19.3356C6.05405 16.0058 8.80234 13.6875 11.96 13.6875C13.4505 13.6875 14.8434 14.2187 16.0119 15.1252L12.8994 18.6267L11.7899 19.875H13.46H22.46H23.21V19.125V9V7.02735L21.8994 8.50173L18.8052 11.9828Z" fill="white" stroke="#1B68AE" stroke-width="1.5"/>
            </svg>
          </StyledButton>
        </SemestersContainerHeaderPages>
        <p style={{color: "#9E9E9E", fontSize: 12}}>Arraste uma disciplina para adicioná-la ou removê-la do período desejado.</p>
        <SemestersContainerHeaderView>
          <StyledButton background_image={"/assets/a2.png"}>
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.30223 9.22502L1.19386 9.5L1.30223 9.77498C3.14092 14.4408 7.68046 17.75 13 17.75C18.3195 17.75 22.8591 14.4408 24.6978 9.77498L24.8061 9.5L24.6978 9.22502C22.8591 4.55921 18.3195 1.25 13 1.25C7.68046 1.25 3.14092 4.55921 1.30223 9.22502ZM13 4.75C16.377 4.75 19.398 6.57762 20.9767 9.50003C19.3985 12.4228 16.3862 14.25 13 14.25C9.61377 14.25 6.6015 12.4228 5.0233 9.50004C6.60196 6.57762 9.62298 4.75 13 4.75ZM16.25 9.5C16.25 7.70579 14.7942 6.25 13 6.25C11.2058 6.25 9.75 7.70579 9.75 9.5C9.75 11.2942 11.2058 12.75 13 12.75C14.7942 12.75 16.25 11.2942 16.25 9.5Z" fill="white" stroke="#1B68AE" stroke-width="1.5"/>
            </svg>
          </StyledButton>
          <StyledButton background_image={"/assets/botao_azulClaro.png"}>
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.4 0C3.768 0 0 3.454 0 7.7C0 10.318 1.428 12.617 3.6 14.014V16.5C3.6 17.105 4.14 17.6 4.8 17.6H12C12.66 17.6 13.2 17.105 13.2 16.5V14.014C15.372 12.617 16.8 10.318 16.8 7.7C16.8 3.454 13.032 0 8.4 0ZM11.82 12.21L10.8 12.87V15.4H6V12.87L4.98 12.21C3.36 11.176 2.4 9.493 2.4 7.7C2.4 4.664 5.088 2.2 8.4 2.2C11.712 2.2 14.4 4.664 14.4 7.7C14.4 9.493 13.44 11.176 11.82 12.21Z" fill="#8DC0EC"/>
              <path d="M11.82 12.21L10.8 12.87V15.4H6V12.87L4.98 12.21C3.36 11.176 2.4 9.493 2.4 7.7C2.4 4.664 5.088 2.2 8.4 2.2C11.712 2.2 14.4 4.664 14.4 7.7C14.4 9.493 13.44 11.176 11.82 12.21Z" fill="white"/>
            </svg>
          </StyledButton>
        </SemestersContainerHeaderView>
      </SemestersContainerHeader>

      {semesters.map(semester => (
        <SemesterContainer key={semester.id} isOpen={expandedSemesters[semester.id]}>
          <SemesterHeader onClick={() => {toggleSemester(semester.id)}}>
            <SemesterInfos>
              <h1 style={{marginRight: "20px"}}>{semester.id}º Período</h1>
              <SemesterWarnings>
                <img style={{paddingRight: '5px'}} src='/icons/warning_yellow.png' />
                <p style={{color: "#ECA706"}}>Provável conflito de horário.</p>
              </SemesterWarnings>
              {
                semestersCredits[semester.id].classCredits + semestersCredits[semester.id].workCredits > 40 ?
                <SemesterWarnings>
                  <img style={{paddingRight: '5px'}} src='/icons/warning.png'/>
                  <p style={{color: "#C11414"}}>Máximo de 40 créditos por período.</p>
                </SemesterWarnings>
                : null
              }
            </SemesterInfos>
            <SemesterCreditsAndIcon>
              <p style={{color: "#757575"}}>{semestersCredits[semester.id].classCredits ? semestersCredits[semester.id].classCredits : ''} {semestersCredits[semester.id].workCredits ? '+' : ''} {semestersCredits[semester.id].workCredits ? semestersCredits[semester.id].workCredits : ''} {semestersCredits[semester.id].classCredits || semestersCredits[semester.id].workCredits ? 'créditos' : ''}</p>
              <span>{expandedSemesters[semester.id] ? '▼' : '▶'}</span>
            </SemesterCreditsAndIcon>
          </SemesterHeader>
          <CoursesList expanded={expandedSemesters[semester.id]}>
            {courses
              .filter(course => course.semester === semester.id)
              .map(course => (
                <Card colors={course.colors} onCreate={() => addCreditsToSemester(semester.id, course.credits[0], course.credits[1])} onClick={() => {
                  openCourse();
                  changeCourseDisplay(course.pokeball, "/pokemons/ditto.png", course.title, course.code, course.tags, course.credits, course.desc)
                }}>
                  <CardContentCourse pokeball={course.pokeball} courseCode={course.code} courseTitle={course.title} pokemonURL="/pokemons/ditto.png">
                  </CardContentCourse>
                </Card>
              ))}
            <NewCard>
              <p>Arraste uma disciplina</p>
            </NewCard>
          </CoursesList>
        </SemesterContainer>
      ))}
      <Card colors={{
        background: "#E4EEFA",
        innerLine: "#51A1E0",
        outerLine: "#17538D",
      }}>
        <NewSemester>
          <h1 style={{fontSize: "60px", marginBottom: "10px"}}>+</h1>
          <p>Adicionar período</p>
        </NewSemester>
      </Card>
    </SemestersContainer>
  );
};

export default Semesters;