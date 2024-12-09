import React, { useState, useRef, useEffect } from 'react';
import './SatPage.css';
import {
  getSearchPayload,
  fetchQuestions,
  prepareSubdomains,
  renderQuestionDisplay
} from './SatPageFunctions';
import Desmos from 'desmos'
import { Calculator } from 'lucide-react';

function SATPage() {
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedTestSection, setSelectedTestSection] = useState('');
  const [selectedSubdomains, setSelectedSubdomains] = useState({});
  const [selectedDifficulties, setSelectedDifficulties] = useState({
    Easy: false,
    Medium: false,
    Hard: false
  });
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef(null);
  const calculatorInstanceRef = useRef(null);
  const calculatorInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize calculator once
    if (!calculatorInitializedRef.current) {
      const container = document.createElement('div');
      container.id = 'desmos-calculator';
      container.style.width = '600px';
      container.style.height = '400px';
      container.style.position = 'absolute';
      container.style.bottom = '80px';
      container.style.left = '20px';
      container.style.display = 'none';
      container.style.zIndex = '1000';
      container.style.backgroundColor = 'white';
      container.style.border = '1px solid #ccc';
      container.style.borderRadius = '8px';
      container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

      const mainContent = document.querySelector('.sat-main-content');
      if (mainContent) {
        mainContent.appendChild(container);
        calculatorRef.current = container;
        calculatorInstanceRef.current = Desmos.GraphingCalculator(container);
        calculatorInstanceRef.current.setExpression({ id: 'graph1', latex: '' });
        calculatorInitializedRef.current = true;
      }
    }

    return () => {
      if (calculatorRef.current && calculatorInitializedRef.current) {
        calculatorRef.current.remove();
        calculatorInitializedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (calculatorRef.current) {
      calculatorRef.current.style.display = showCalculator ? 'block' : 'none';
    }
  }, [showCalculator]);

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };
  
  const handleTestChange = (test) => {
    setSelectedTest(test);
  };

  const handleTestSectionChange = (section) => {
    setSelectedTestSection(section);
    setSelectedSubdomains({});
  };

  const handleSubdomainChange = (subdomain) => {
    setSelectedSubdomains((prev) => ({
      ...prev,
      [subdomain]: !prev[subdomain],
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulties((prev) => ({
      ...prev,
      [difficulty]: !prev[difficulty]
    }));
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

  const handleSearch = async () => {
    // Validate test selection
    if (!selectedTest) {
      setError('Please select a test type.');
      return;
    }

    // Validate test section selection
    if (!selectedTestSection) {
      setError('Please select a test section.');
      return;
    }

    // Prepare difficulties
    const difficulty = Object.entries(selectedDifficulties)
      .filter(([_, isSelected]) => isSelected)
      .map(([difficulty]) => difficulty);

    // Prepare subdomains based on selected test section
    const subdomain = Object.entries(selectedSubdomains)
      .filter(([_, isSelected]) => isSelected)
      .map(([subdomain]) => subdomain);

    // Construct search payload
    const searchPayload = {
      test: selectedTest,
      difficulty: difficulty.length > 0 ? difficulty : [""],
      subdomain: subdomain.length > 0 ? subdomain : [""]
    };

    console.log('Sending search request with payload:', searchPayload);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/sat/find-questions-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const questions = await response.json();

      if (questions.length > 0) {
        setCurrentQuestions(questions);
        setCurrentQuestionIndex(0);
        setError(null);
      } else {
        setCurrentQuestions([]);
        setError('No questions found matching your search criteria.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message || 'An error occurred while searching for questions.');
      setCurrentQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const subdomainData = selectedTestSection
    ? prepareSubdomains(selectedTestSection, selectedSubdomains, handleSubdomainChange)
    : [];

  const questionDisplay = renderQuestionDisplay(
    isLoading,
    error,
    currentQuestions,
    currentQuestionIndex,
    handleNavigatePrevious,
    handleNavigateNext
  );

  const renderSubdomainInputs = () => {
    return subdomainData.map(({ category, subdomains }) => (
      <React.Fragment key={category}>
        <h4>{category}</h4>
        {subdomains.map((subdomain) => (
          <div key={subdomain.id} className="checkbox-group">
            <input
              type="checkbox"
              id={subdomain.id}
              onChange={subdomain.onChange}
              checked={subdomain.checked}
            />
            <label htmlFor={subdomain.id}>{subdomain.label}</label>
          </div>
        ))}
      </React.Fragment>
    ));
  };

  const renderQuestionView = () => {
    switch (questionDisplay.type) {
      case 'loading':
        return <div>{questionDisplay.content}</div>;
      case 'error':
        return <div className="error">{questionDisplay.content}</div>;
      case 'question':
        return (
          <div>
            <div>{questionDisplay.content.text}</div>
            <div className="navigation-buttons">
              <button
                onClick={handleNavigatePrevious}
                disabled={!questionDisplay.content.navigation.hasPrevious}
              >
                Previous
              </button>
              <span>
                {`${questionDisplay.content.navigation.currentIndex} / ${questionDisplay.content.navigation.totalQuestions}`}
              </span>
              <button
                onClick={handleNavigateNext}
                disabled={!questionDisplay.content.navigation.hasNext}
              >
                Next
              </button>
            </div>
            <button 
              onClick={toggleCalculator}
              className="calculator-toggle"
              style={{
                position: 'absolute',
              }}
            >
              {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sat-page">
      <div className="sat-main-content">
        <div className="header-container">
          <h1>SAT Questions</h1>
          <button 
            onClick={toggleCalculator}
            className={`calculator-icon-button ${showCalculator ? 'active' : ''}`}
            aria-label={showCalculator ? 'Hide Calculator' : 'Show Calculator'}
          >
            <Calculator size={24} />
          </button>
        </div>
        {renderQuestionView()}
      </div>

      <div className="checkbox-column">
        <div className="filter-group">
          <h3>Assessment</h3>
          <p>Please select one</p>
          {['SAT', 'ACT', 'PSAT 10/11', 'PSAT 8/9'].map((test) => (
            <div key={test} className="checkbox-group">
              <input
                type="radio"
                id={test}
                name="assessment"
                onChange={() => handleTestChange(test)}
                checked={selectedTest === test}
              />
              <label htmlFor={test}>{test}</label>
            </div>
          ))}
        </div>

        <div className="filter-group">
          <h3>Test Section</h3>
          <p>Please select one</p>
          {['Math', 'English'].map((section) => (
            <div key={section} className="checkbox-group">
              <input
                type="radio"
                id={section.toLowerCase()}
                name="test-section"
                onChange={() => handleTestSectionChange(section)}
                checked={selectedTestSection === section}
              />
              <label htmlFor={section.toLowerCase()}>
                {section === 'English' ? 'Reading and Writing' : section}
              </label>
            </div>
          ))}
        </div>

        {selectedTestSection && (
          <div className="filter-group">
            <h3>Subdomain</h3>
            <p>Select all that apply</p>
            {renderSubdomainInputs()}
          </div>
        )}

        <div className="filter-group">
          <h3>Difficulty</h3>
          <p>Select all that apply</p>
          {['Easy', 'Medium', 'Hard'].map((difficulty) => (
            <div key={difficulty} className="checkbox-group">
              <input
                type="checkbox"
                id={difficulty.toLowerCase()}
                checked={selectedDifficulties[difficulty]}
                onChange={() => handleDifficultyChange(difficulty)}
              />
              <label htmlFor={difficulty.toLowerCase()}>{difficulty}</label>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search Questions'}
          </button>
        </div>
      </div>
      
    </div>
    
  );

}

export default SATPage;