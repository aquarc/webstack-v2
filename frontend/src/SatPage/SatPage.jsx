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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef(null);
  const calculatorInstanceRef = useRef(null);
  const calculatorInitializedRef = useRef(false);

  // Calculator initialization effect
  useEffect(() => {
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

  // Calculator visibility effect
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
    // Reset other selections when test changes
    setSelectedTestSection('');
    setSelectedSubdomains({});
    setSelectedDifficulties({ Easy: false, Medium: false, Hard: false });
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

  // Navigation handlers
  const handleNavigateNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null); // Reset selected answer
    }
  };
  
  const handleNavigatePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedAnswer(null); // Reset selected answer
    }
  };

  // Search handler
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

    // Prepare search payload
    const searchPayload = getSearchPayload({
      selectedTest,
      selectedSubdomains,
      selectedDifficulties
    });

    console.log('Sending search request with payload:', searchPayload);

    setIsLoading(true);
    setError(null);

    try {
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

  // Prepare subdomain data for rendering
  const subdomainData = selectedTestSection
    ? prepareSubdomains(selectedTestSection, selectedSubdomains, handleSubdomainChange)
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

  // Render answer choices
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
                <label htmlFor="free-response-input">Your Answer</label>
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
  
      // Handle special Collegeboard format (dictionary format)
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
  
      // Handle regular array format
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

  // Render question view based on display type
  const renderQuestionView = () => {
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
  };
  
  return (
    <div className="sat-page">
      <div className="sat-main-content">
        <div className="header-container">
          <h1>SAT Questions</h1>
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