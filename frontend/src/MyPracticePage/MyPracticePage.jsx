import React from "react";
import "./MyPracticePage.css";
import { useNavigate } from "react-router-dom";


const MyPracticePage = () => {
  const navigate = useNavigate();

  const handleStartPractice = () => {
    navigate("/sat");
  };

  return (
    <div className="my-practice-page">
      <h1 className="page-title">My Practice</h1>
      <p className="page-description">
        Track your progress and practice effectively with our personalized SAT
        practice tools.
      </p>
      <button className="start-practice-button" onClick={handleStartPractice}>
        Start Practice
      </button>
    </div>
  );
}   

export default MyPracticePage;