import React, { useState, useRef, useEffect } from 'react';
import './SatPage.css';
import './CSS/Filter.css'
import './CSS/QuestionStyles.css'
import {
  getSearchPayload,
  fetchQuestions,
  prepareSubdomains,
  renderQuestionDisplay
} from './SatPageFunctions';
import Desmos from 'desmos'
import { Calculator } from 'lucide-react';

function SATPage() {
  // State variables for managing the SAT question interface
  // Tracks selected test, section, subdomains, difficulties, and current question state
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedTestSections, setSelectedTestSections] = useState([]);
  const [selectedSubdomains, setSelectedSubdomains] = useState({});
  const [selectedDifficulties, setSelectedDifficulties] = useState({
    Easy: false,
    Medium: false,
    Hard: false
  });
  // State for managing current question interactions
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for managing loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State and refs for managing the integrated Desmos calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef(null);
  const calculatorInstanceRef = useRef(null);
  const calculatorInitializedRef = useRef(false);

  // Effect hook to initialize the Desmos graphing calculator
  // Creates a div container for the calculator and sets it up when the component mounts
  useEffect(() => {
    if (!calculatorInitializedRef.current) {
      const container = document.createElement('div');
      container.id = 'desmos-calculator';
      // styling configuration for calculator container
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

      // Append calculator to the main content area
      const mainContent = document.querySelector('.sat-main-content');
      if (mainContent) {
        mainContent.appendChild(container);
        calculatorRef.current = container;
        // Initialize Desmos calculator instance
        calculatorInstanceRef.current = Desmos.GraphingCalculator(container);
        calculatorInstanceRef.current.setExpression({ id: 'graph1', latex: '' });
        calculatorInitializedRef.current = true;
      }
    }
    // Cleanup function to remove calculator when component unmounts
    return () => {
      if (calculatorRef.current && calculatorInitializedRef.current) {
        calculatorRef.current.remove();
        calculatorInitializedRef.current = false;
      }
    };
  }, []);

  // Calculator visibility 
  useEffect(() => {
    if (calculatorRef.current) {
      calculatorRef.current.style.display = showCalculator ? 'block' : 'none';
    }
  }, [showCalculator]);

  // Toggle calculator visibility
  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };
  
  // Event handlers for selection changes
  const handleTestChange = (test) => {
    setSelectedTest(test);
    // Reset related states when a different test is selected
    setSelectedTestSections([]);
    setSelectedSubdomains({});
    setSelectedDifficulties({ Easy: false, Medium: false, Hard: false });
  };

  const handleTestSectionChange = (section) => {
    setSelectedTestSections(prev => {
      // If section is already selected, remove it, otherwise add it
      if (prev.includes(section)) {
        return prev.filter(s => s !== section);
      } else {
        return [...prev, section];
      }
    });
    // Only reset subdomains if the section is being removed
    if (selectedTestSections.includes(section)) {
      setSelectedSubdomains(prev => {
        const newSubdomains = { ...prev };
        // Remove subdomains associated with the deselected section
        Object.keys(newSubdomains).forEach(key => {
          if (key.startsWith(section)) {
            delete newSubdomains[key];
          }
        });
        return newSubdomains;
      });
    }
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

  // Navigation handlers for moving between questions
  // Reset selected answer when navigating  
  const handleNavigateNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null); // Reset selected answer
    }
  }
  const handleNavigatePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedAnswer(null); // Reset selected answer
    }
  };

  // Main search handler to fetch questions based on selected criteria
  const handleSearch = async () => {
    // Validate test selection
    if (!selectedTest) {
      setError('Please select a test type.');
      return;
    }

    // Validate section selection
    if (!selectedTestSections) {
      setError('Please select a test section.');
      return;
    }

    // Prepare search payload
    const searchPayload = getSearchPayload({
      selectedTest,
      selectedSubdomains,
      selectedDifficulties
    });

    console.log('Sending search request with payload:', searchPayload);

    // Set loading state and reset previous errors
    setIsLoading(true);
    setError(null);

    try {
      // Fetch questions based on search payload
      const questions = await fetchQuestions(searchPayload);

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

  // Prepare subdomain data for rendering based on selected test section
  const subdomainData = selectedTestSections.length > 0
  ? selectedTestSections.map(section => prepareSubdomains(section, selectedSubdomains, handleSubdomainChange)).flat()
  : [];

  // Render question display based on current state
  const questionDisplay = renderQuestionDisplay(
    isLoading,
    error,
    currentQuestions,
    currentQuestionIndex,
    handleNavigatePrevious,
    handleNavigateNext
  );

  // Render subdomain checkboxes
  const renderSubdomainInputs = () => {
    return subdomainData.map(({ category, subdomains }) => (
      <React.Fragment key={category}>
        <h4>{category}</h4>
        {/* Create checkbox inputs for each subdomain */}
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

  // Extensive logic to parse and render different answer choice formats
  // Supports multiple-choice, free response, and specific JSON formats
  // Handles answer selection, correctness, and rationale display
  const renderAnswerChoices = (choices, correctAnswer, rationale, questionType, externalId) => {
    if (!choices) return null;
    
    // Parse choices if it's a string
    let parsedChoices = choices;
    try {
      if (typeof choices === 'string') {
        parsedChoices = JSON.parse(choices);
      }
  
      // Handle free response questions (empty array case)
      if (Array.isArray(parsedChoices) && parsedChoices.length === 0) {
        return (
          <>
            <div className="answer-choice free-response-container">
              <div className="input-container">
                <input 
                  type="text"
                  id="free-response-input"
                  value={selectedAnswer || ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className={
                    selectedAnswer 
                      ? (selectedAnswer === correctAnswer ? 'correct-answer' : 'incorrect-answer')
                      : ''
                  }
                  placeholder="Enter your answer..."
                />
              </div>
            </div>
            {selectedAnswer && (
              <div className={`rationale-container ${selectedAnswer === correctAnswer ? 'correct' : 'incorrect'}`}>
                <h4 className="rationale-header">
                  {selectedAnswer === correctAnswer ? 'Correct!' : 'Incorrect'}
                </h4>
                <div className="rationale-content" dangerouslySetInnerHTML={{ __html: rationale }} />
              </div>
            )}
          </>
        );
      }
  
      // Handle special Collegeboard format (MCQ)
      if (externalId?.startsWith('DC-') || (!Array.isArray(parsedChoices) && typeof parsedChoices === 'object')) {
        return (
          <>
            <div className="multiple-choice-container">
              {['a', 'b', 'c', 'd'].map((letter) => {
                if (!parsedChoices[letter]) return null;
  
                const content = parsedChoices[letter].body || parsedChoices[letter];
                const choiceKey = `choice-${letter}`;
                const isSelected = selectedAnswer === letter;
                const isCorrect = isSelected && letter.toLowerCase() === correctAnswer.toLowerCase();
  
                let answerClass = 'answer-choice';
                if (isSelected) {
                  answerClass += isCorrect ? ' correct-answer' : ' incorrect-answer';
                }
  
                return (
                  <div 
                    key={choiceKey} 
                    className={answerClass}
                    onClick={() => setSelectedAnswer(letter)}
                  >
                    <input 
                      type="radio" 
                      id={choiceKey} 
                      name="answer-choices" 
                      value={letter}
                      checked={isSelected}
                      onChange={() => setSelectedAnswer(letter)}
                    />
                    <label 
                      htmlFor={choiceKey}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                );
              }).filter(Boolean)}
            </div>
            {selectedAnswer && (
              <div className={`rationale-container ${selectedAnswer.toLowerCase() === correctAnswer.toLowerCase() ? 'correct' : 'incorrect'}`}>
                <h4 className="rationale-header">
                  {selectedAnswer.toLowerCase() === correctAnswer.toLowerCase() ? 'Correct!' : 'Incorrect'}
                </h4>
                <div className="rationale-content" dangerouslySetInnerHTML={{ __html: rationale }} />
              </div>
            )}
          </>
        );
      }
  
      // Handle regular array format (MCQ)
      if (Array.isArray(parsedChoices)) {
        return (
          <>
            <div className="multiple-choice-container">
              {parsedChoices.map((choice, index) => {
                const content = typeof choice === 'object' 
                  ? choice.content || choice.body || choice 
                  : choice;
  
                const letterChoice = String.fromCharCode(65 + index).toLowerCase();
                const choiceKey = choice.id || `choice-${index}`;
                const isSelected = selectedAnswer === letterChoice;
                const isCorrect = isSelected && letterChoice === correctAnswer.toLowerCase();
  
                let answerClass = 'answer-choice';
                if (isSelected) {
                  answerClass += isCorrect ? ' correct-answer' : ' incorrect-answer';
                }
  
                return (
                  <div 
                    key={choiceKey} 
                    className={answerClass}
                    onClick={() => setSelectedAnswer(letterChoice)}
                  >
                    <input 
                      type="radio" 
                      id={choiceKey} 
                      name="answer-choices" 
                      value={letterChoice}
                      checked={isSelected}
                      onChange={() => setSelectedAnswer(letterChoice)}
                    />
                    <label 
                      htmlFor={choiceKey}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                );
              })}
            </div>
            {selectedAnswer && (
              <div className={`rationale-container ${selectedAnswer === correctAnswer.toLowerCase() ? 'correct' : 'incorrect'}`}>
                <h4 className="rationale-header">
                  {selectedAnswer === correctAnswer.toLowerCase() ? 'Correct!' : 'Incorrect'}
                </h4>
                <div className="rationale-content" dangerouslySetInnerHTML={{ __html: rationale }} />
              </div>
            )}
          </>
        );
      }
    } catch (error) {
      console.error('Error parsing answer choices:', error);
      return null;
    }
    return null;
  };

  // Render the main question view with different states (loading, error, question)
  const renderQuestionView = () => {
    // Switch between different view states based on current question display
    switch (questionDisplay.type) {
      case 'loading':
        return <div>{questionDisplay.content}</div>;
      case 'error':
        return <div className="error">{questionDisplay.content}</div>;
      case 'question':
        const { questionDetails, navigation } = questionDisplay.content;
        return (
          <div className="question-container">
            <div className="question-details">
              <div className="question-metadata">
              </div>
              
              {/* Additional details (if available) - NOW MOVED ABOVE THE QUESTION */}
              {questionDetails.details && (
                <div className="question-additional-details">
                  <h4>Additional Information</h4>
                  <p>{questionDetails.details}</p>
                </div>
              )}

              {/* Question text */}
              <div className="question-text">
                <h3>Question</h3>
                <p>{questionDetails.question}</p>
              </div>

              {/* Answer Choices */}
              <div className="answer-choices">
                <h3>Choose an Answer</h3>
                {renderAnswerChoices(questionDetails.answerChoices, questionDetails.answer, questionDetails.rationale)}
              </div>

              {/* Navigation */}
              <div className="navigation-buttons">
                <button
                  onClick={handleNavigatePrevious}
                  disabled={!navigation.hasPrevious}
                >
                  Previous
                </button>
                <span>
                  {`${navigation.currentIndex} / ${navigation.totalQuestions}`}
                </span>
                <button
                  onClick={handleNavigateNext}
                  disabled={!navigation.hasNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
  
  // Renders everything for the UI
  return (
    <div className="sat-page">
      <div className="sat-main-content">
        <div className="header-container">
        <h1>Select question type on the right.</h1>
          <button 
            onClick={toggleCalculator}
            className={`calculator-icon-button ${showCalculator ? 'active' : ''}`}
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
          <p>Please select all that apply</p>
          {['Math', 'English'].map((section) => (
            <div key={section} className="checkbox-group">
              <input
                type="checkbox"
                id={section.toLowerCase()}
                name="test-section"
                onChange={() => handleTestSectionChange(section)}
                checked={selectedTestSections.includes(section)}
              />
              <label htmlFor={section.toLowerCase()}>
                {section === 'English' ? 'Reading and Writing' : section}
              </label>
            </div>
          ))}
        </div>

        {selectedTestSections && (
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