import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SatPage.css";
import "./CSS/Filter.css";
import "./CSS/QuestionStyles.css";
import {
  getSearchPayload,
  fetchQuestions,
  prepareSubdomains,
  renderQuestionDisplay,
} from "./SatPageFunctions";
import Desmos from "desmos";
import Collapsible from "../Components/Collapsible";
import { Bookmark, Calculator, ListFilter, X, HelpCircle } from "lucide-react";
import PomodoroTimer from "./PomodoroTimer";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import Cookies from 'js-cookie';
import Markdown from 'react-markdown'

function SATPage() {
  // navbar
  const navigate = useNavigate();
  const pomodoroTimerRef = useRef();

  // State variables for managing the SAT question interface
  const [selectedTest, setSelectedTest] = useState("SAT");
  const selectedRef = useRef([]);
  let selectedRefLength = 0;
  const [selectedSubdomains, setSelectedSubdomains] = useState({});
  const [selectedDifficulties, setSelectedDifficulties] = useState({
    Easy: false,
    Medium: false,
    Hard: false,
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tempAnswer, setTempAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  // Add this state declaration near other useState hooks
  const [selectedTestSections, setSelectedTestSections] = useState([]);

  // practice test mode
  const [practiceTestMode, setPracticeTestMode] = useState(true);

  // Add this function definition (placeholder implementation)
  const sendClickEvent = (eventName) => {
    // Implement actual analytics tracking here
    console.log(`Event tracked: ${eventName}`);
  };

  // State and refs for managing the integrated Desmos calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef(null);
  const calculatorInstanceRef = useRef(null);

  // cross out mode for answer choices
  const [isCrossOutMode, setIsCrossOutMode] = useState(false);
  const [crossedOutAnswers, setCrossedOutAnswers] = useState({});

  const [attempts, setAttempts] = useState({});
  const [attemptLogs, setAttemptLogs] = useState({});
  const [currentQuestionAttempts, setCurrentQuestionAttempts] = useState([]);

  const [activeFilterTab, setActiveFilterTab] = useState("assessment");

  const [userEmail, setUserEmail] = useState(() => {
    const user = Cookies.get('user');
    return user ? JSON.parse(user).email : null;
  });

  const [hasSelectedAnswer, setHasSelectedAnswer] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const [fetchedSimilarQuestions, setFetchedSimilarQuestions] = useState(new Set());

  const [excludedQuestionIds, setExcludedQuestionIds] = useState(new Set());

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Toggle function for the calculator
  const toggleCalculator = () => {
    setShowCalculator((prev) => !prev);
  };

  // Add near other useEffect hooks
  useEffect(() => {
    console.log("Attempts updated:", attempts);
  }, [attempts]);

  useEffect(() => {
    console.log("Current question index:", currentQuestionIndex);
  }, [currentQuestionIndex]);

  // Initialize and cleanup the Desmos calculator when showCalculator changes
  useEffect(() => {
    if (showCalculator && calculatorRef.current) {
      // Initialize Desmos on the rendered container
      calculatorInstanceRef.current = Desmos.GraphingCalculator(
        calculatorRef.current,
        {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          expressionsTopbar: true,
        },
      );
      // Optionally, set an empty expression
      calculatorInstanceRef.current.setExpression({ id: "graph1", latex: "" });

      // Cleanup: destroy the instance when component unmounts or showCalculator toggles off
      return () => {
        if (calculatorInstanceRef.current) {
          calculatorInstanceRef.current.destroy();
          calculatorInstanceRef.current = null;
        }
      };
    }

    sendClickEvent("calculator-button-click");
  }, [showCalculator]);

  // In your useEffect that handles question loading
  useEffect(() => {
    if (currentQuestions.length > 0) {
      const timer = setTimeout(() => {
        const questionsWithForceRender = currentQuestions.map((q) => ({
          ...q,
        }));
        setCurrentQuestions(questionsWithForceRender);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [currentQuestions.length]);

  useEffect(() => {
    document.title = "Aquarc - SAT Practice";
    return () => {
      document.title = "Aquarc"; // Optional: Reset title when leaving the page
    };
  }, []);

  useEffect(() => {
    setHasSelectedAnswer(false);
  }, [currentQuestionIndex]);

  // Reset crossedOutAnswers and isCrossOutMode when currentQuestions changes
  useEffect(() => {
    setCrossedOutAnswers({});
    setIsCrossOutMode(false);
    setAttempts({});
    setCurrentQuestionAttempts([]);
    setHasSelectedAnswer(false); // Add this line
  }, [currentQuestions]);


  // Event handlers for selection changes
  const handleTestChange = (test) => {
    setSelectedTest(test);
    setSelectedSubdomains({});
    setSelectedDifficulties({ Easy: false, Medium: false, Hard: false });
    sendClickEvent("test-change");
  };

  const handleTestSectionChange = (section) => {
    setSelectedTestSections((prev) => {
      if (prev.includes(section)) {
        return prev.filter((s) => s !== section);
      } else {
        return [...prev, section];
      }
    });
    if (selectedTestSections.includes(section)) {
      setSelectedSubdomains((prev) => {
        const newSubdomains = { ...prev };
        Object.keys(newSubdomains).forEach((key) => {
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
      [difficulty]: !prev[difficulty],
    }));
  };

  const sendAttemptsToBackend = (questionId, attempts) => {
    if (attempts.length === 0) return;

    // Extract all attempt data
    const attemptsList = attempts.map(a => a.answer);
    const timestamps = attempts.map(a => a.timestamp);
    const correctFlags = attempts.map(a => a.correct); // Store each attempt's correctness
    const correct = attempts.some(a => a.correct); // Overall question correctness

    fetch('/sat/log-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: questionId,
        attempts: attemptsList,  // Array of all attempts like [b, a, c]
        timestamps: timestamps,  // Array of timestamps for each attempt
        correctFlags: correctFlags, // Array of boolean flags for each attempt [false, false, true]
        correct: correct,        // Overall question correctness (true if any attempt was correct)
      }),
    });
  };

  const handleNavigateNext = () => {
    if (currentQuestions.length === 0) return;

    setShowChat(false);

    // Send accumulated attempts for current question
    sendAttemptsToBackend(
      currentQuestions[currentQuestionIndex].questionId,
      currentQuestionAttempts,
    );

    // Reset attempts and navigate
    setCurrentQuestionAttempts([]);
    setCurrentQuestionIndex(prev => (prev < currentQuestions.length - 1 ? prev + 1 : 0));
    clearChanges();
  };

  const handleNavigatePrevious = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    else setCurrentQuestionIndex(currentQuestions.length - 1);

    setShowChat(false);
    clearChanges();
  };

  const clearChanges = () => {
    pomodoroTimerRef.current?.stopwatchReset();
    setSelectedAnswer(null);
    setTempAnswer("");
    setIsCrossOutMode(false);
    setShowCalculator(false);
  };
  

  const handleSubmitAnswer = () => {
    if (tempAnswer.trim()) {
      const currentQuestion = currentQuestions[currentQuestionIndex];
      const correctAnswer = currentQuestion.answer;
      let isCorrect = false;
      let finalAnswer = tempAnswer;

      // Handle fraction input
      if (tempAnswer.includes("/")) {
        const [numerator, denominator] = tempAnswer.split("/");
        finalAnswer = (numerator / denominator).toFixed(4);
        isCorrect = finalAnswer === correctAnswer;
      } else {
        isCorrect = tempAnswer === correctAnswer;
      }

      // Log the attempt to our local state
      const timestamp = Date.now();
      const newAttempt = {
        answer: finalAnswer,
        timestamp: timestamp,
        correct: isCorrect,
      };
      setCurrentQuestionAttempts(prev => [...prev, newAttempt]);
      setHasSelectedAnswer(true);

      // Update local logs - keep this for backwards compatibility
      setAttemptLogs(prev => ({
        ...prev,
        [currentQuestion.questionId]: [
          ...(prev[currentQuestion.questionId] || []),
          { answer: finalAnswer, timestamp }
        ]
      }));

      // Update UI state based on answer correctness
      if (isCorrect) {
        setSelectedAnswer(tempAnswer);
        setHasSelectedAnswer(true);
        setAttempts(prev => {
          const newAttempts = { ...prev };
          delete newAttempts[currentQuestionIndex];
          return newAttempts;
        });
      } else {
        const currentAttempts = attempts[currentQuestionIndex] || 0;
        if (currentAttempts < 1) {
          setAttempts(prev => ({
            ...prev,
            [currentQuestionIndex]: currentAttempts + 1,
          }));
        } else {
          setAttempts(prev => ({
            ...prev,
            [currentQuestionIndex]: currentAttempts + 1,
          }));
          setSelectedAnswer(tempAnswer);
        }
      }
    }
    sendClickEvent("submit-answer");
  };

  const handleSearch = async () => {
    setSelectedAnswer(null);
    setTempAnswer("");
    if (!selectedTest) {
      setError("Please select a test type.");
      return;
    }

    if (
      !selectedDifficulties.Easy &&
      !selectedDifficulties.Medium &&
      !selectedDifficulties.Hard
    ) {
      setError("Please select a question difficulty.");
      return;
    }
    const searchPayload = getSearchPayload({
      selectedTest,
      selectedSubdomains,
      selectedDifficulties,
      practiceTestMode,
    });
    console.log("Sending search request with payload:", searchPayload);
    setIsLoading(true);
    setError(null);
    try {
      const questions = await fetchQuestions(searchPayload);
      if (questions.length > 0) {
        setCurrentQuestions(questions);
        setCurrentQuestionIndex(0);
        pomodoroTimerRef.current?.start(); // Start timer
        window.scrollTo(0, 0);
        setError(null);
      } else {
        setCurrentQuestions([]);
        setError("No questions found matching your search criteria.");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(
        error.message || "An error occurred while searching for questions.",
      );
      setCurrentQuestions([]);
    } finally {
      setIsLoading(false);
      toggleSidebar();
    }
    sendClickEvent("search-questions");
  };

  const subdomainData = prepareSubdomains(
    selectedSubdomains,
    handleSubdomainChange,
  );

  const questionDisplay = renderQuestionDisplay(
    isLoading,
    error,
    currentQuestions,
    currentQuestionIndex,
    handleNavigatePrevious,
    handleNavigateNext,
  );

  const renderSubdomainInputs = () => {
    if (subdomainData.length <= 0) {
      return null;
    }


    return Object.entries(subdomainData).map(([sectionName, section]) => (
      <div class="sidebar-standalone-content">
        <h2 class="sidebar-standalone-header">{sectionName}</h2>
        {section.map(({ category, subdomains }) => (
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
        ))}
      </div>
    ));
  };

  const shouldShowFreeResponse = (choices) => {
    return (
      !choices ||
      (Array.isArray(choices) && choices.length === 0) ||
      choices === "[]" ||
      choices === '""' ||
      choices === "" ||
      choices === '"\\"\\""' ||
      choices === '\\"\\""' ||
      choices === '""' ||
      choices === '\\"\\"'
    );
  };

  const renderAnswerChoices = (
    choices,
    correctAnswer,
    rationale,
    questionType,
    externalId,
  ) => {
    const currentAttempts = attempts[currentQuestionIndex] || 0;

    if (shouldShowFreeResponse(choices)) {
      const handleKeyPress = (e) => {
        if (e.key === "Enter") {
          handleSubmitAnswer();
        }
      };

      return (
        <>
          <input
            type="text"
            id="free-response-input"
            value={tempAnswer}
            onChange={(e) => setTempAnswer(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`flex-1 p-2 border rounded-md ${selectedAnswer
              ? selectedAnswer === correctAnswer
                ? "correct-answer"
                : "incorrect-answer"
              : ""
              }`}
            placeholder="Enter your answer..."
          />
          <br></br>
          <br></br>
          <button
            onClick={handleSubmitAnswer}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md transition-colors duration-200"
            disabled={!tempAnswer.trim()}
          >
            Submit
          </button>
          <br></br>
          {(selectedAnswer && (selectedAnswer === correctAnswer || currentAttempts >= 3)) && (
            <div
              className={`rationale-container ${selectedAnswer === correctAnswer ? "correct" : "incorrect"}`}
            >
              <h4 className="rationale-header">
                {selectedAnswer === correctAnswer ? "Correct!" : "Incorrect"}
              </h4>
              <div
                className="rationale-content"
                dangerouslySetInnerHTML={{ __html: rationale }}
              />
            </div>
          )}
          <br></br>
        </>
      );
    }

    let parsedChoices = choices;
    try {
      if (typeof choices === "string") {
        parsedChoices = JSON.parse(choices);
      }

      if (
        externalId?.startsWith("DC-") ||
        (!Array.isArray(parsedChoices) && typeof parsedChoices === "object")
      ) {
        return (
          <>
            <div className="multiple-choice-container">
              {["a", "b", "c", "d"]
                .map((letterChoice, index) => { // Added index parameter here
                  if (!parsedChoices[letterChoice]) return null;

                  const content =
                    parsedChoices[letterChoice].body || parsedChoices[letterChoice];
                  const choiceKey = `choice-${letterChoice}`;
                  const isSelected = selectedAnswer === letterChoice;
                  const isCorrect =
                    isSelected &&
                    letterChoice.toLowerCase() === correctAnswer.toLowerCase();

                  const isCrossedOut =
                    crossedOutAnswers[currentQuestionIndex]?.has(choiceKey);

                  return (
                    <div
                      key={choiceKey}
                      className={`answer-choice ${isCrossedOut ? "crossed-out" : ""}`}
                      onClick={(e) => {
                        if (isCrossOutMode) {
                          // Cross out logic
                          setCrossedOutAnswers((prev) => {
                            const currentCrossouts = new Set(
                              prev[currentQuestionIndex] || [],
                            );

                            if (currentCrossouts.has(choiceKey)) {
                              currentCrossouts.delete(choiceKey);
                            } else {
                              if (selectedAnswer === letterChoice)
                                setSelectedAnswer(null);
                              currentCrossouts.add(choiceKey);
                            }

                            return {
                              ...prev,
                              [currentQuestionIndex]: currentCrossouts,
                            };
                          });
                        } else {
                          // Selection logic - fixed to use letterChoice directly
                          setSelectedAnswer(letterChoice);
                          setHasSelectedAnswer(true);

                          // Log this attempt
                          const timestamp = Date.now();
                          const isCorrect = letterChoice.toLowerCase() === correctAnswer.toLowerCase();

                          // Add to current question attempts
                          setCurrentQuestionAttempts(prev => [...prev, {
                            answer: letterChoice,
                            timestamp: timestamp,
                            correct: isCorrect
                          }]);

                          // Update attempt counter for UI display
                          if (!isCorrect) {
                            setAttempts(prev => ({
                              ...prev,
                              [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + 1,
                            }));
                          }

                          // Keep legacy logging for backward compatibility
                          setAttemptLogs(prev => ({
                            ...prev,
                            [currentQuestions[currentQuestionIndex]?.questionId]: [
                              ...(prev[currentQuestions[currentQuestionIndex]?.questionId] || []),
                              { answer: letterChoice, timestamp: timestamp }
                            ]
                          }));
                        }
                      }}
                    >
                      <label
                        htmlFor={choiceKey}
                        className={
                          isSelected
                            ? isCorrect
                              ? " correct-answer"
                              : " incorrect-answer"
                            : "unselected-answer"
                        }
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
            {(selectedAnswer && (selectedAnswer.toLowerCase() === correctAnswer.toLowerCase() || currentAttempts >= 3)) && (
              <div
                className={`rationale-container ${selectedAnswer.toLowerCase() === correctAnswer.toLowerCase() ? "correct" : "incorrect"}`}
              >
                <h4 className="rationale-header">
                  {selectedAnswer.toLowerCase() === correctAnswer.toLowerCase()
                    ? "Correct!"
                    : "Incorrect"}
                </h4>
                <div
                  className="rationale-content"
                  dangerouslySetInnerHTML={{ __html: rationale }}
                />
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
                const content =
                  typeof choice === "object"
                    ? choice.content || choice.body || choice
                    : choice;

                const letterChoice = String.fromCharCode(
                  65 + index,
                ).toLowerCase();
                const choiceKey = choice.id || `choice-${index}`;
                const isSelected = selectedAnswer === letterChoice;
                const isCorrect =
                  isSelected && letterChoice === correctAnswer.toLowerCase();

                const isCrossedOut =
                  crossedOutAnswers[currentQuestionIndex]?.has(choiceKey);

                return (
                  <div
                    key={choiceKey}
                    className={`answer-choice ${isCrossedOut ? "crossed-out" : ""}`}
                    onClick={(e) => {
                      if (isCrossOutMode) {
                        setCrossedOutAnswers((prev) => {
                          const currentCrossouts = new Set(
                            prev[currentQuestionIndex] || [],
                          );

                          if (currentCrossouts.has(choiceKey)) {
                            currentCrossouts.delete(choiceKey);
                          } else {
                            if (selectedAnswer == letterChoice)
                              setSelectedAnswer(null);
                            currentCrossouts.add(choiceKey);
                          }

                          return {
                            ...prev,
                            [currentQuestionIndex]: currentCrossouts,
                          };
                        });
                      } else {
                        setSelectedAnswer(letterChoice);
                        setHasSelectedAnswer(true);

                        // Log this attempt
                        const timestamp = Date.now();
                        const isCorrect = letterChoice.toLowerCase() === correctAnswer.toLowerCase();

                        // Add to current question attempts
                        setCurrentQuestionAttempts(prev => [...prev, {
                          answer: letterChoice,
                          timestamp: timestamp,
                          correct: isCorrect
                        }]);

                        // Update attempt counter for UI display
                        if (!isCorrect) {
                          setAttempts(prev => ({
                            ...prev,
                            [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + 1,
                          }));
                        }

                        // Keep legacy logging for backward compatibility
                        setAttemptLogs(prev => ({
                          ...prev,
                          [currentQuestions[currentQuestionIndex]?.questionId]: [
                            ...(prev[currentQuestions[currentQuestionIndex]?.questionId] || []),
                            { answer: letterChoice, timestamp: timestamp }
                          ]
                        }));
                      }
                    }}
                  >
                    <label
                      htmlFor={choiceKey}
                      className={
                        isSelected
                          ? isCorrect
                            ? " correct-answer"
                            : " incorrect-answer"
                          : "unselected-answer"
                      }
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                );
              })}
            </div>
            {(selectedAnswer && (selectedAnswer === correctAnswer.toLowerCase() || currentAttempts >= 3)) && (
              <div
                className={`rationale-container ${selectedAnswer === correctAnswer.toLowerCase() ? "correct" : "incorrect"}`}
              >
                <h4 className="rationale-header">
                  {selectedAnswer === correctAnswer.toLowerCase()
                    ? "Correct!"
                    : "Incorrect"}
                </h4>
                <div
                  className="rationale-content"
                  dangerouslySetInnerHTML={{ __html: rationale }}
                />
              </div>
            )}
          </>
        );
      }
    } catch (error) {
      console.error("Error parsing answer choices:", error);
      return renderAnswerChoices(
        null,
        correctAnswer,
        rationale,
        questionType,
        externalId,
      );
    }

    return renderAnswerChoices(
      null,
      correctAnswer,
      rationale,
      questionType,
      externalId,
    );
  };


  // Update the renderQuestionView function
  const renderQuestionView = () => {
    switch (questionDisplay.type) {
      case "loading":
        return <div>{questionDisplay.content}</div>;
      case "question":
        const { questionDetails, navigation } = questionDisplay.content;
        {
          excludedQuestionIds.has(questionDetails.questionId) && (
            <div className="ai-question-tag">
              AI-Suggested Question
            </div>
          )
        }
        if (questionDetails.category === "Math") {
          return (
            <div className={`question-container math-layout`}>
              {questionDetails.details && (
                <>
                  <div className="question-control-header">
                    <button className="control-button save-button">
                      <Bookmark size={18} />
                      <span>Coming Soon</span>
                    </button>
                    {!shouldShowFreeResponse(questionDetails.answerChoices) && (
                      <button
                        className={`control-button eliminate-button ${isCrossOutMode ? "active" : ""}`}
                        onClick={() => setIsCrossOutMode(!isCrossOutMode)}
                      >
                        <X size={18} />
                        <span>Eliminate Answer</span>
                      </button>
                    )}
                    {/* Show Ask AI button for all question types after incorrect attempt */}
                    {hasSelectedAnswer && (
                      <button
                        className="control-button ai-help-button"
                        onClick={() => handleAIHelp()}
                      >
                        <HelpCircle size={18} />
                        <span>Ask AI</span>
                      </button>
                    )}
                  </div>
                  <div
                    className="question-additional-details"
                    dangerouslySetInnerHTML={{
                      __html: questionDetails.details,
                    }}
                  />
                </>
              )}
              <div className="question-right-side">
                {!questionDetails.details && (
                  <div className="question-control-header">
                    <button className="control-button save-button">
                      <Bookmark size={18} />
                      <span>Coming Soon</span>
                    </button>
                    {!shouldShowFreeResponse(questionDetails.answerChoices) && (
                      <button
                        className={`control-button eliminate-button ${isCrossOutMode ? "active" : ""}`}
                        onClick={() => setIsCrossOutMode(!isCrossOutMode)}
                      >
                        <X size={18} />
                        <span>Eliminate Answer</span>
                      </button>
                    )}
                    {/* Show AI button after any attempt */}
                    {(attempts[currentQuestionIndex] > 0) && (
                      <button
                        className="control-button ai-help-button"
                        onClick={() => handleAIHelp()}
                      >
                        <HelpCircle size={18} />
                        <span>Ask AI</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="question-text">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: questionDetails.question,
                    }}
                  />
                </div>
                <br />
                <div className="answer-choices">
                  {renderAnswerChoices(
                    questionDetails.answerChoices,
                    questionDetails.answer,
                    questionDetails.rationale,
                    questionDetails.questionType,
                    questionDetails.externalId,
                  )}
                </div>
                <div className={`feedback-link ${showSidebar ? "with-sidebar" : ""}`}>
                  <a href={`/feedback?questionId=${questionDetails.questionId}`} target="_blank" rel="noopener noreferrer">
                    Feedback
                  </a>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className={`question-container`}>
              {questionDetails.details && (
                <>
                  <div
                    className="question-additional-details"
                    dangerouslySetInnerHTML={{
                      __html: questionDetails.details,
                    }}
                  />
                  <div className="vertical-bar"></div>
                </>
              )}
              <div className="question-right-side">
                <div className="question-control-header">
                  <button className="control-button save-button">
                    <Bookmark size={18} />
                    <span>Coming Soon</span>
                  </button>
                  <button
                    className={`control-button eliminate-button 
        ${isCrossOutMode ? "active" : ""}`}
                    onClick={() => setIsCrossOutMode(!isCrossOutMode)}
                  >
                    <X size={18} />
                    <span>Eliminate Answer</span>
                  </button>
                  {/* Add AI Help button for English */}
                  {hasSelectedAnswer && (
                    <button
                      className="control-button ai-help-button"
                      onClick={() => handleAIHelp()}
                    >
                      <HelpCircle size={18} />
                      <span>Ask AI</span>
                    </button>
                  )}
                </div>
                <div className="question-text">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: questionDetails.question,
                    }}
                  />
                </div>
                <br />
                <div className="answer-choices">
                  {renderAnswerChoices(
                    questionDetails.answerChoices,
                    questionDetails.answer,
                    questionDetails.rationale,
                    questionDetails.questionType,
                    questionDetails.externalId,
                  )}
                </div>
                <div className={`feedback-link ${showSidebar ? "with-sidebar" : ""}`}>
                  <a href={`/feedback?questionId=${questionDetails.questionId}`} target="_blank" rel="noopener noreferrer">
                    Feedback
                  </a>
                </div>
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  // In the renderNavigationView function
  const renderNavigationView = () => {
    switch (questionDisplay.type) {
      case "loading":
      case "error":
        return null;
      case "question":
        const { questionDetails, navigation } = questionDisplay.content;

        return (
          <div className="fixed-bottom-bar">
            <div className="left-section">
              {userEmail ? (
                <span className="user-email-bottom">{userEmail}</span>
              ) : (
                <span className="login-status">Not Logged In</span>
              )}
            </div>
            
            <div className="middle-section">
              <span className="progress-text">
                {`${navigation.currentIndex} / ${navigation.totalQuestions}`}
              </span>
            </div>

            <div className="right-section">
              <button
                onClick={handleNavigatePrevious}
                disabled={!navigation.hasPrevious}
                className="nav-button"
              >
                Previous
              </button>
              <button 
                onClick={handleNavigateNext} 
                disabled={!navigation.hasNext}
                className="nav-button"
              >
                Next
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleAIHelp = () => {
    if (!showChat) {
      // Add initial instructions when opening the chat
      setMessages([
        {
          parts: ["Why did you select the answer " + selectedAnswer?.toUpperCase() + "?"],
          role: "model"
        }
      ]);
    }
    setShowChat(!showChat);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      // Add user message immediately
      const newMessages = [...messages, { parts: [inputMessage], role: "user" }];
      setMessages(newMessages);
      setInputMessage('');

      // Get current question data
      const currentQuestion = currentQuestions[currentQuestionIndex];

      // Check if this is the first response to the initial question
      const isFirstResponse = messages.length === 1 && messages[0].role == "model";

      // Prepare the payload based on context
      const apiPayload = isFirstResponse ? {
        history: [],
        message: `Evaluate my answer choice for this SAT question:
        
        Question: ${currentQuestion.question}
        My Answer: ${selectedAnswer?.toUpperCase()}
        My Reasoning: ${inputMessage}
        Correct Answer: ${currentQuestion.answer}
        Official Rationale: ${currentQuestion.rationale}
        
        Please:
        1. Present the strongest argument FOR my answer
        2. Present the strongest argument AGAINST my answer
        3. Explain why the correct answer is better

        And use only markdown in your answer! Even if it is math. No HTML. No LaTeX. Nothing.`
      } : {
        history: messages,
        message: inputMessage
      };

      // API call
      const response = await fetch('/ai/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Add AI response
      setMessages(prev => [
        ...prev,
        { parts: [data.response], role: "model" },
      ]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { parts: ["Sorry, there was an error processing your request"], role: "model" },
      ]);
    }
  };


  // Implement the handler function
  const handleApproaches = async () => {
    //      try {
    // Convert messages to the required format

    const requestBody = { "history": messages };

    setMessages(prev => [
      ...prev,
      { parts: ["Generate Alternative Approaches"], role: "user" },
    ]);
    console.log(requestBody);

    const response = await fetch('/ai/think', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    console.log(data.response);

    // Update state with the AI response
    setMessages(prev => [
      ...prev,
      {
        parts: [data.response],
        role: "model",
      }
    ]);
  };

  // Add this function to check if a message contains thinking processes
  const isThinking = (text) => {
    try {
      console.log(text);
      const data = JSON.parse(text);
      return Array.isArray(data) && data.every(item =>
        'leads_to' in item && 'thinking_process' in item
      );
    } catch {
      return false;
    }

  };

  const renderThinking = (message) => {
    console.log("Message is: " + message);
    console.log(typeof message);

    const data = JSON.parse(message);
    return (
      <div>
        {data.map((item, index) => {
          console.log(item.thinking_process);
          return (
            <Collapsible key={item.leads_to} title={item.leads_to == "user" ? "Your Answer" : "Correct Answer"}>
              <Markdown>{item.thinking_process}</Markdown>
            </Collapsible>);
        }
        )}
      </div>
    );
  };

// In SatPage.jsx - Update handleSimilarQuestions function
const handleSimilarQuestions = async () => {
  try {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    // Use a Set for more efficient lookups and guaranteed uniqueness
    const allExistingIds = new Set();
    
    // Add all current question IDs
    currentQuestions.forEach(q => {
      if (q.questionId) allExistingIds.add(q.questionId);
      // Also add internal ID as fallback
      if (q.id) allExistingIds.add(q.id);
    });
    
    // Add all previously excluded IDs
    excludedQuestionIds.forEach(id => allExistingIds.add(id));

    console.log("Excluding these question IDs:", Array.from(allExistingIds));
    
    const requestBody = {
      query: currentQuestion.question,
      exclude: Array.from(allExistingIds), // Now excludes all known IDs
    };

    setFetchedSimilarQuestions(prev => new Set([...prev, currentQuestionIndex]));

    setMessages(prev => [
      ...prev,
      { parts: ["Searching for similar questions..."], role: "model" }
    ]);

    const response = await fetch('/ai/similarquestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.similar_questions?.length > 0) {
      // Enhanced duplicate detection
      const uniqueNewQuestions = [];
      const seenIds = new Set(allExistingIds);
      
      // More thorough duplicate check
      for (const question of data.similar_questions) {
        const idToCheck = question.questionId || question.id;
        
        // Skip if we've seen this ID before
        if (!idToCheck || seenIds.has(idToCheck)) {
          console.log("Skipping duplicate question:", idToCheck);
          continue;
        }
        
        // Also check for questions with the same content
        const isDuplicateContent = currentQuestions.some(q => 
          q.question === question.question || 
          (q.question && question.question && 
           q.question.trim() === question.question.trim())
        );
        
        if (isDuplicateContent) {
          console.log("Skipping question with duplicate content");
          continue;
        }
        
        // This is a new unique question
        seenIds.add(idToCheck);
        uniqueNewQuestions.push(question);
      }

      if (uniqueNewQuestions.length > 0) {
        const updatedQuestions = [...currentQuestions];
        updatedQuestions.splice(currentQuestionIndex + 1, 0, ...uniqueNewQuestions);
        
        // Update excluded IDs with the new questions
        const newExcluded = new Set(allExistingIds);
        uniqueNewQuestions.forEach(q => {
          if (q.questionId) newExcluded.add(q.questionId);
          if (q.id) newExcluded.add(q.id);
        });
        setExcludedQuestionIds(newExcluded);

        setCurrentQuestions(updatedQuestions);
        setAttempts({});
        setCurrentQuestionAttempts([]);

        setMessages(prev => [
          ...prev,
          {
            parts: [`Added ${uniqueNewQuestions.length} new similar questions`],
            role: "model"
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { parts: ["No new similar questions found"], role: "model" }
        ]);
      }
    } else {
      setMessages(prev => [
        ...prev,
        { parts: ["No similar questions found"], role: "model" }
      ]);
    }
  } catch (error) {
    console.error("Error finding similar questions:", error);
    setMessages(prev => [
      ...prev,
      {
        parts: ["Failed to retrieve similar questions. Please try again later."],
        role: "model"
      }
    ]);
  } finally {
    setFetchedSimilarQuestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestionIndex);
      return newSet;
    });
  }
};

  return (
    <>
      <div style={{ position: "relative" }}>
        <nav className={`nav sat-nav`}>
          <div
            className="logo"
            onClick={() => navigate('/')}
            style={{ cursor: "pointer" }}
          >
            <img src="/aquLogo.png" alt="Aquarc Logo" className="logo-image" />
          </div>

          <PomodoroTimer ref={pomodoroTimerRef} />

          <div>
            {questionDisplay.content?.questionDetails?.category == "Math" && (
              <button
                onClick={() => toggleCalculator()} // Fixed: Call toggleCalculator function when clicked
                className={`calculator-icon-button format-time`}
              >
                <Calculator size={24} />
              </button>
            )}

          </div>
        </nav>
      </div>

      <div
        className="sidebar-tab"
        style={{ right: showSidebar ? '35%' : '0' }}
        onClick={toggleSidebar}
      >
        <ListFilter size={20} />
      </div>

      <div className="sat-page">
        <div className="sat-main-content">
          <br></br>
          <br></br>
          {currentQuestions.length > 0 ? (
            renderQuestionView()
          ) : (
            <>
              <div class="question-container">Please filter questions.</div>
            </>
          )}
        </div>
        {showCalculator && (
          <Draggable bounds="html" handle=".calculator-handle">
            <div className="calculator-wrapper">
              <div className="calculator-handle">Drag here</div>
              <ResizableBox
                width={600}
                height={400}
                minConstraints={[300, 200]}
                maxConstraints={[800, 600]}
                resizeHandles={["se"]}
              >
                <div
                  id="desmos-calculator"
                  ref={calculatorRef}
                  style={{ width: "100%", height: "100%" }}
                ></div>
              </ResizableBox>
            </div>
          </Draggable>
        )}
        <div className={`checkbox-column ${showSidebar ? "" : "collapsed"}`}>
          {/* Search button inside sidebar header */}
          <div className="sidebar-header">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeFilterTab === 'assessment' ? 'active' : ''}`}
                onClick={() => setActiveFilterTab('assessment')}
              >
                Assessment
              </button>
              <button
                className={`filter-tab ${activeFilterTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveFilterTab('analytics')}
              >
                Analytics
              </button>
              <button
                className="close-sidebar-button"
                onClick={toggleSidebar}
              >
                <X size={18} />
              </button>
            </div>

          </div>

          {activeFilterTab === 'analytics' && (
            <div className="analytics-tab-content">
              <h3>Question Analytics</h3>

              {userEmail ? (
                <>
                  <div className="user-info">
                    <span className="user-email">{userEmail}</span>
                    <button
                      className="auth-button auth-button-secondary"
                      onClick={() => {
                        Cookies.remove('user');
                        setUserEmail(null);
                        // Instead of navigating immediately, let the user stay on current page
                        if (window.location.pathname === '/sat') {
                          navigate('/');
                        }
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                  <div className="analytics-placeholder">
                    <p>Your practice statistics will appear here after completing questions.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="analytics-message">
                    Track your progress, see performance trends, and get personalized recommendations by signing in.
                  </p>

                  <div className="auth-buttons-container">
                    <button
                      className="auth-button auth-button-primary"
                      onClick={() => navigate('/signup')}
                    >
                      Create Account
                    </button>
                    <button
                      className="auth-button auth-button-secondary"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </button>
                  </div>

                  <div className="auth-divider">or</div>

                  <p className="analytics-message text-center" style={{ marginTop: '1rem' }}>
                    Continue practicing without saving your progress.
                  </p>
                </>
              )}
            </div>
          )}

          {activeFilterTab === 'assessment' && (
            <>
              <div className="filter-group">
                {["SAT", "PSAT 10/11", "PSAT 8/9"].map((test) => (
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

              {renderSubdomainInputs()}

              <div class="sidebar-standalone-content">
                <h2 class="sidebar-standalone-header">Difficulty</h2>
                {["Easy", "Medium", "Hard"].map((difficulty) => (
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

              <div className="checkbox-group" style={{ marginTop: '1rem' }}>
                <input
                  type="checkbox"
                  id="practice-test-mode"
                  checked={practiceTestMode}
                  onChange={() => setPracticeTestMode(!practiceTestMode)}
                />
                <label htmlFor="practice-test-mode">
                  Practice Test Mode (15 questions)
                </label>
              </div>

              {questionDisplay.type === "error" && (
                <div className="error-message">{questionDisplay.content}</div>
              )}
              <div className="button-group">
                <button
                  className="search-button"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Search Questions"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {currentQuestions.length > 0 && renderNavigationView()}
      {showChat && (
        <div className="ai-chat-sidebar">
          <div className="ai-chat-header">SAT AI Tutor</div>
          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.role == "model" ? "ai-message" : "user-message"}
              >
                {message.role == "model" ?
                  (isThinking(message.parts[0]) ?
                    renderThinking(message.parts[0])
                    :
                    <Markdown>{message.parts[0]}</Markdown>)
                  :
                  message.parts[0]}
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="ai-chat-input-container">
            {/* Approach buttons row */}
            <div className="approach-buttons">
              <button
                type="button"
                className="approach-button"
                onClick={() => handleApproaches()}
                disabled={messages.length <= 1}
              >
                Approaches
              </button>
              <button
                type="button"
                className="approach-button"
                onClick={() => handleSimilarQuestions()}
                disabled={fetchedSimilarQuestions.has(currentQuestionIndex) || !currentQuestions.length}
              >
                Get Similar Questions
              </button>
            </div>

            {/* Input row */}
            <div className="input-row">
              <input
                type="text"
                className="ai-chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question..."
              />
              <button type="submit" className="ai-chat-button">
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default SATPage;
