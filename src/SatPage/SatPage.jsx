import React, { useState } from 'react';
import './SatPage.css';
import { MathSubdomains, EnglishSubdomains } from './SatSubdomains';

function SATPage() {
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedTestSection, setSelectedTestSection] = useState('');
  const [selectedSubdomains, setSelectedSubdomains] = useState({});
  const [selectedDifficulties, setSelectedDifficulties] = useState('');
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleTestChange = (test) => {
    setSelectedTest(test);
  };

  const handleTestSectionChange = (section) => {
    setSelectedTestSection(section);
    setSelectedSubdomains({}); // Reset subdomains when switching sections
  };

  const handleSubdomainChange = (subdomain) => {
    setSelectedSubdomains((prev) => ({
      ...prev,
      [subdomain]: !prev[subdomain],
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulties(difficulty);
  };

  const handleNavigateNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const handleNavigatePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const renderSubdomains = () => {
    const subdomainConfig = selectedTestSection === 'Math' ? MathSubdomains : EnglishSubdomains;
    
    return Object.entries(subdomainConfig).map(([category, subdomains]) => (
      <React.Fragment key={category}>
        <h4>{category}</h4>
        {subdomains.map((subdomain) => (
          <div key={subdomain.id} className="checkbox-group">
            <input
              type="checkbox"
              id={subdomain.id}
              onChange={() => handleSubdomainChange(subdomain.value)}
            />
            <label htmlFor={subdomain.id}>{subdomain.label}</label>
          </div>
        ))}
      </React.Fragment>
    ));
  };

  return (
    <div className="sat-page">
      <div className="sat-main-content">
        <h1>SAT Questions</h1>
      </div>

      <div className="checkbox-column">
        <div className="filter-group">
          <br></br>
          <h3>Assessment</h3>
          <p>Please select one</p>
          <div className="checkbox-group">
            <input
              type="radio"
              id="sat"
              name="assessment"
              onChange={() => handleTestChange('SAT')}
            />
            <label htmlFor="sat">SAT</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="act"
              name="assessment"
              onChange={() => handleTestChange('ACT')}
            />
            <label htmlFor="act">ACT</label>
          </div>
        </div>

        <div className="filter-group">
          <h3>Test Section</h3>
          <p>Please select one</p>
          <div className="checkbox-group">
            <input
              type="radio"
              id="math"
              name="test-section"
              onChange={() => handleTestSectionChange('Math')}
            />
            <label htmlFor="math">Math</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="english"
              name="test-section"
              onChange={() => handleTestSectionChange('English')}
            />
            <label htmlFor="english">Reading and Writing</label>
          </div>
        </div>

        <div className="filter-group">
          <h3>Subdomain</h3>
          <p>Select all that apply</p>

          {selectedTestSection && renderSubdomains()}
        </div>

        <div className="filter-group">
          <h3>Difficulty</h3>
          <p>Select all that apply</p>
          <div className="checkbox-group">
            <input
              type="radio"
              id="easy"
              name="difficulty"
              onChange={() => handleDifficultyChange('Easy')}
            />
            <label htmlFor="easy">Easy</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="medium"
              name="difficulty"
              onChange={() => handleDifficultyChange('Medium')}
            />
            <label htmlFor="medium">Medium</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="hard"
              name="difficulty"
              onChange={() => handleDifficultyChange('Hard')}
            />
            <label htmlFor="hard">Hard</label>
          </div>
        </div>

        <div className="button-group">
          <button 
            className="search-button" 
          >
            Search Questions
          </button>
        </div>
      </div>
    </div>
  );
}

export default SATPage;