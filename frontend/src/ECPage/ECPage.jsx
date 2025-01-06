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
      <div className="content">
        <div className="left-panel">
          <h1>Select question type on the right.</h1>
        </div>
        <div className="right-panel">
          <h2>Choose your extracurricular</h2>
          <form>
            <div className="form-group">
              <label><input type="radio" name="assessment" onChange={() => setAssessment('Summer Programs')} /> Summer Programs</label>
              <label><input type="radio" name="assessment" onChange={() => setAssessment('Scholarships')} /> Scholarships</label>
              <label><input type="radio" name="assessment" onChange={() => setAssessment('Competitions')} /> Competitions</label>
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
