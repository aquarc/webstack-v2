// JSX File: FilterComponent.jsx
import React, { useState } from 'react';
import './ECPage.css';

const FilterComponent = () => {
  const [assessment, setAssessment] = useState('');
  const [sections, setSections] = useState([]);
  const [difficulty, setDifficulty] = useState([]);

  const handleCheckboxChange = (value, group) => {
    if (group === 'sections') {
      setSections(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    } else if (group === 'difficulty') {
      setDifficulty(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    }
  };

  const handleSearch = () => {
    console.log({ assessment, sections, difficulty });
  };

  return (
    <div className="container">
      <nav className="navbar">
        <span className="logo">Aquarc</span>
        <ul className="nav-links">
          <li>SAT</li>
          <li>Extracurriculars</li>
          <li>Newsletter</li>
          <li>Feedback</li>
        </ul>
        <button className="get-started">Get Started</button>
      </nav>

      <div className="content">
        <div className="left-panel">
          <h1>Select question type on the right.</h1>
        </div>
        <div className="right-panel">
          <h2>Assessment</h2>
          <form>
            <div className="form-group">
              <label><input type="radio" name="assessment" onChange={() => setAssessment('SAT')} /> SAT</label>
              <label><input type="radio" name="assessment" onChange={() => setAssessment('ACT')} /> ACT</label>
              <label><input type="radio" name="assessment" onChange={() => setAssessment('PSAT 10/11')} /> PSAT 10/11</label>
              <label><input type="radio" name="assessment" onChange={() => setAssessment('PSAT 8/9')} /> PSAT 8/9</label>
            </div>

            <h3>Test Section</h3>
            <div className="form-group">
              <label><input type="checkbox" onChange={() => handleCheckboxChange('Math', 'sections')} /> Math</label>
              <label><input type="checkbox" onChange={() => handleCheckboxChange('Reading and Writing', 'sections')} /> Reading and Writing</label>
            </div>

            <h3>Difficulty</h3>
            <div className="form-group">
              <label><input type="checkbox" onChange={() => handleCheckboxChange('Easy', 'difficulty')} /> Easy</label>
              <label><input type="checkbox" onChange={() => handleCheckboxChange('Medium', 'difficulty')} /> Medium</label>
              <label><input type="checkbox" onChange={() => handleCheckboxChange('Hard', 'difficulty')} /> Hard</label>
            </div>

            <button type="button" className="search-btn" onClick={handleSearch}>Search Questions</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
