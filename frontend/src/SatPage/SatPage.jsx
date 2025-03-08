import React, { useState, useRef, useEffect } from 'react';
import { MathSubdomains, EnglishSubdomains } from './SatSubdomains';
import './SatPage.css';
import './CSS/Filter.css';
import './CSS/QuestionStyles.css';
import {
  getSearchPayload,
  fetchQuestions,
  prepareSubdomains,
  renderQuestionDisplay
} from './SatPageFunctions';
import Desmos from 'desmos';
import { Calculator } from 'lucide-react';
import PomodoroTimer from './PomodoroTimer';
import Collapsible from '../Components/Collapsible';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

function SATPage() {
  // State variables for managing the SAT question interface
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedTestSections, setSelectedTestSections] = useState([]);
  const [selectedSubdomains, setSelectedSubdomains] = useState({});
  const [selectedDifficulties, setSelectedDifficulties] = useState({
    Easy: false,
    Medium: false,
    Hard: false
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tempAnswer, setTempAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State and refs for managing the integrated Desmos calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef(null);
  const calculatorInstanceRef = useRef(null);

  // Toggle function for the calculator
  const toggleCalculator = () => {
    setShowCalculator((prev) => !prev);
  };

  // Hide calculator if Math section is no longer selected
  useEffect(() => {
    if (!selectedTestSections.includes('Math') && showCalculator) {
      setShowCalculator(false);
    }
  }, [selectedTestSections, showCalculator]);

  // Initialize and cleanup the Desmos calculator when showCalculator changes
  useEffect(() => {
    if (showCalculator && calculatorRef.current) {
      // Initialize Desmos on the rendered container
      calculatorInstanceRef.current = Desmos.GraphingCalculator(calculatorRef.current, {
        keypad: true,
        expressions: true,
        settingsMenu: true,
        expressionsTopbar: true,
      });
      // Optionally, set an empty expression
      calculatorInstanceRef.current.setExpression({ id: 'graph1', latex: '' });
      
      // Cleanup: destroy the instance when component unmounts or showCalculator toggles off
      return () => {
        if (calculatorInstanceRef.current) {
          calculatorInstanceRef.current.destroy();
          calculatorInstanceRef.current = null;
        }
      };
    }
  }, [showCalculator]);

  // In your useEffect that handles question loading
  useEffect(() => {
    if (currentQuestions.length > 0) {
      const timer = setTimeout(() => {
        const questionsWithForceRender = currentQuestions.map(q => ({ ...q }));
        setCurrentQuestions(questionsWithForceRender);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestions.length]);

  // Event handlers for selection changes
  const handleTestChange = (test) => {
    setSelectedTest(test);
    setSelectedTestSections([]);
    setSelectedSubdomains({});
    setSelectedDifficulties({ Easy: false, Medium: false, Hard: false });
  };

  const handleTestSectionChange = (section) => {
    setSelectedTestSections(prev => {
      if (prev.includes(section)) {
        return prev.filter(s => s !== section);
      } else {
        return [...prev, section];
      }
    });
    if (selectedTestSections.includes(section)) {
      setSelectedSubdomains(prev => {
        const newSubdomains = { ...prev };
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

  const handleNavigateNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTempAnswer('');
    }
  };
  
  const handleNavigatePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setTempAnswer('');
    }
  };

  const handleSubmitAnswer = () => {
    if (tempAnswer.trim()) {
      setSelectedAnswer(tempAnswer);
    }
  };

  const handleSearch = async () => {
    if (!selectedTest) {
      setError('Please select a test type.');
      return;
    }
    if (selectedTestSections.length === 0) {
      setError('Please select a test section.');
      return;
    }
    if (Object.keys(selectedSubdomains).length === 0) {
      if (selectedTestSections.includes('Math')) {
        for (const key in MathSubdomains) {
          const skills = MathSubdomains[key];
          for (let i = 0; i < skills.length; i++) {
            selectedSubdomains[skills[i]['value']] = true;
          }
        }
      }
      if (selectedTestSections.includes('English')) {
        for (const key in EnglishSubdomains) {
          const skills = EnglishSubdomains[key];
          for (let i = 0; i < skills.length; i++) {
            selectedSubdomains[skills[i]['value']] = true;
          }
        }
      }
    }
    if (!selectedDifficulties.Easy && !selectedDifficulties.Medium && !selectedDifficulties.Hard) {
      setError('Please select a question difficulty.');
      return;
    }
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
        window.scrollTo(0, 0);
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

  const subdomainData = selectedTestSections.length > 0
    ? selectedTestSections.map(section => prepareSubdomains(section, selectedSubdomains, handleSubdomainChange)).flat()
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

  const renderAnswerChoices = (choices, correctAnswer, rationale, questionType, externalId) => {
    const shouldShowFreeResponse = !choices || 
      (Array.isArray(choices) && choices.length === 0) ||
      choices === '[]' ||
      choices === '""' ||
      choices === '' ||
      choices === '"\\"\\""' ||
      choices === '\\"\\""' ||
      choices === "\"\"" || 
      choices === '\\"\\"';
  
    if (shouldShowFreeResponse) {
      const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          handleSubmitAnswer();
        }
      };
  
      return (
        <>
          <div className="answer-choice free-response-container">
            <div className="flex gap-2 items-center w-full max-w-xl">
              <input 
                type="text"
                id="free-response-input"
                value={tempAnswer}
                onChange={(e) => setTempAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 p-2 border rounded-md ${
                  selectedAnswer 
                    ? (selectedAnswer === correctAnswer ? 'correct-answer' : 'incorrect-answer')
                    : ''
                }`}
                placeholder="Enter your answer..."
              />
              <button
                onClick={handleSubmitAnswer}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md transition-colors duration-200"
                disabled={!tempAnswer.trim()}
              >
                Submit
              </button>
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
  
    let parsedChoices = choices;
    try {
      if (typeof choices === 'string') {
        parsedChoices = JSON.parse(choices);
      }
  
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
      return renderAnswerChoices(null, correctAnswer, rationale, questionType, externalId);
    }
    
    return renderAnswerChoices(null, correctAnswer, rationale, questionType, externalId);
  };

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
              <div className="question-metadata"></div>
              {questionDetails.details && (
                <div className="question-additional-details">
                  <h4>Additional Information</h4>
                  <div dangerouslySetInnerHTML={{ __html: questionDetails.details }} />
                </div>
              )}
              <div className="question-text">
                <h3>Question</h3>
                <div dangerouslySetInnerHTML={{ __html: questionDetails.question }} />
              </div>
              <div className="answer-choices">
                <h3>Choose an Answer</h3>
                {renderAnswerChoices(
                  questionDetails.answerChoices, 
                  questionDetails.answer, 
                  questionDetails.rationale, 
                  questionDetails.questionType,
                  questionDetails.externalId
                )}
              </div>
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
        <div className="top-section">
          <div className="header-container">
            <h1>Select question type on the right.</h1>
          </div>
          <div className="tools-timer-container">
            {selectedTestSections.includes('Math') && (
              <button 
                onClick={toggleCalculator}
                className={`calculator-icon-button ${showCalculator ? 'active' : ''}`}
              >
                <Calculator size={24} />
              </button>
            )}
            <PomodoroTimer />
          </div>
        </div>
        {renderQuestionView()}
      </div>
      {showCalculator && (
        <Draggable bounds="parent" handle=".calculator-handle">
          <div className="calculator-wrapper">
            <div className="calculator-handle">Drag here</div>
            <ResizableBox
              width={600}
              height={400}
              minConstraints={[300, 200]}
              maxConstraints={[800, 600]}
              resizeHandles={['se']}
            >
              <div
                id="desmos-calculator"
                ref={calculatorRef}
                style={{ width: '100%', height: '100%' }}
              ></div>
            </ResizableBox>
          </div>
        </Draggable>
      )}
      <div className="checkbox-column">
        <div className="filter-group">
          <h3>Assessment</h3>
          <p>Please select one</p>
          {['SAT'].map((test) => (
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
        <div title="Test Section">
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
          <Collapsible title="Subdomain">
            <p>Select all that apply</p>
            {renderSubdomainInputs()}
          </Collapsible>
        )}
        <Collapsible title="Difficulty">
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
        </Collapsible>
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
