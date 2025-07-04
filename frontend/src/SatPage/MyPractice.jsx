import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './SatPage.css';
import './CSS/Filter.css';

const MyPractice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('questionId');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: questionId 
      ? `I had an error, question id was ${questionId}\n\n` 
      : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)' }}>
      <h1>My Practice</h1>
        <div className="filter-group">
            <button>Practice</button>
            <button>Quick Practice</button>
        </div>
        <div className="filter-group">

            <div className="single-card">
              <div className="card-content">
                <h3>SAT Formulas and Tips</h3>
                <p>Essential equations and problem-solving strategies</p>
                <a
                  href="/sat-math-equations.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-button"
                >
                  Download PDF
                </a>
              </div>
            </div>
        </div>
    </div>
  );
};

export default MyPractice;
