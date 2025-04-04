import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MathSubdomains, EnglishSubdomains } from "./SatSubdomains";
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
import { Bookmark, Calculator, ListFilter, X } from "lucide-react";
import PomodoroTimer from "./PomodoroTimer";
import Collapsible from "../Components/Collapsible";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import Cookies from "js-cookie";
import { sendClickEvent } from "../App";

function SATPage() {
  // navbar
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "";
  };

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

  // Add this function definition (placeholder implementation)
  const sendClickEvent = (eventName) => {
    // Implement actual analytics tracking here
    console.log(`Event tracked: ${eventName}`);
  };

  // Add this state declaration for topic timings if needed
  const [topicTimings, setTopicTimings] = useState({}); // Replace the existing line

  // State and refs for managing the integrated Desmos calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef(null);
  const calculatorInstanceRef = useRef(null);

  // automatic opening and closing
  const [isSubdomainOpen, setIsSubdomainOpen] = useState(false);

  // cross out mode for answer choices
  const [isCrossOutMode, setIsCrossOutMode] = useState(false);
  const [crossedOutAnswers, setCrossedOutAnswers] = useState({});

  // State variables for time
  const [startTime, setStartTime] = useState(null);

  const userCookie = Cookies.get("user");

  const toggleSidebar = () => {
    setShowSidebar((prev) => {
      if (prev) {
        // set .checkbox-column width to 0%
        document.querySelector(".checkbox-column").style.display = "none";
        return false;
      } else {
        document.querySelector(".checkbox-column").style.display = "flex";
        return true;
      }
    });
  };

  // Toggle function for the calculator
  const toggleCalculator = () => {
    setShowCalculator((prev) => !prev);
  };

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

  // Reset crossedOutAnswers and isCrossOutMode when currentQuestions changes
  useEffect(() => {
    setCrossedOutAnswers({});
    setIsCrossOutMode(false);
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

  const handleNavigateNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    else setCurrentQuestionIndex(0);
    clearChanges();
  };

  const handleNavigatePrevious = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    else setCurrentQuestionIndex(currentQuestions.length - 1);
    clearChanges();
  };

  const clearChanges = () => {
    setSelectedAnswer(null);
    setTempAnswer("");
    setIsCrossOutMode(false);
    setShowCalculator(false);
  };

  const handleSubmitAnswer = () => {
    if (tempAnswer.trim()) {
      if (tempAnswer.includes("/")) {
        let [numerator, denominator] = tempAnswer.split("/");
        setSelectedAnswer((numerator / denominator).toFixed(4)); // 5 max characters including decimal place, 4 max without decimal place
      }
      setSelectedAnswer(tempAnswer);
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
    if (true /*selectedSubdomains.length > 0*/) {
      // for each ref in selectedRef, console.log it
      console.log("eeee:", selectedRef);

      // TODO: this code does not work anymore and will never work
      /*
      for (const key in MathSubdomains) {
        const skills = MathSubdomains[key];
        for (let i = 0; i < skills.length; i++) {
          selectedSubdomains[skills[i]['value']] = true;
        }
      }
      for (const key in EnglishSubdomains) {
        const skills = EnglishSubdomains[key];
        for (let i = 0; i < skills.length; i++) {
          selectedSubdomains[skills[i]['value']] = true;
        }
      }
      */
    } else {
      console.log("TODO: insert real error");
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
    });
    console.log("Sending search request with payload:", searchPayload);
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
  console.log("subdomainData:", subdomainData);

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
      <Collapsible title={sectionName} key={sectionName}>
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
      </Collapsible>
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
            onKeyPress={handleKeyPress}
            className={`flex-1 p-2 border rounded-md ${
              selectedAnswer
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
          {selectedAnswer && (
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
                .map((letter) => {
                  if (!parsedChoices[letter]) return null;

                  const content =
                    parsedChoices[letter].body || parsedChoices[letter];
                  const choiceKey = `choice-${letter}`;
                  const isSelected = selectedAnswer === letter;
                  const isCorrect =
                    isSelected &&
                    letter.toLowerCase() === correctAnswer.toLowerCase();

                  let answerClass = "answer-choice";

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
                              if (selectedAnswer == letter)
                                setSelectedAnswer(null);
                              currentCrossouts.add(choiceKey);
                            }

                            return {
                              ...prev,
                              [currentQuestionIndex]: currentCrossouts,
                            };
                          });
                        } else {
                          setSelectedAnswer(letter);
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
            {selectedAnswer && (
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
            {selectedAnswer && (
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
                        className={`control-button eliminate-button 
                            ${isCrossOutMode ? "active" : ""}`}
                        onClick={() => setIsCrossOutMode(!isCrossOutMode)}
                      >
                        <X size={18} />
                        <span>Eliminate Answer</span>
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
                        className={`control-button eliminate-button 
                            ${isCrossOutMode ? "active" : ""}`}
                        onClick={() => setIsCrossOutMode(!isCrossOutMode)}
                      >
                        <X size={18} />
                        <span>Eliminate Answer</span>
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
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  const renderNavigationView = () => {
    switch (questionDisplay.type) {
      case "loading":
      case "error":
        return null;
      case "question":
        const { questionDetails, navigation } = questionDisplay.content;

        return (
          <div class="fixed-bottom-bar">
            <button
              onClick={handleNavigatePrevious}
              disabled={!navigation.hasPrevious}
            >
              Previous
            </button>
            <span class="progress-text">
              {`${navigation.currentIndex} / ${navigation.totalQuestions}`}
            </span>
            <button onClick={handleNavigateNext} disabled={!navigation.hasNext}>
              Next
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <nav className={`nav sat-nav`}>
          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img src="/aquLogo.png" alt="Aquarc Logo" className="logo-image" />
          </div>

          <PomodoroTimer />
          <div>
            {questionDisplay.content?.questionDetails?.category == "Math" && (
              <button
                onClick={setShowCalculator((prev) => !prev)}
                className={`calculator-icon-button format-time`}
              >
                <Calculator size={24} />
              </button>
            )}
            <button
              onClick={toggleSidebar}
              className={`calculator-icon-button format-time`}
            >
              <ListFilter size={24} />
            </button>
          </div>
        </nav>
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
            <h2>Assessment</h2>
            <button onClick={toggleSidebar} className="sidebar-close-button">
              <X size={20} />
            </button>
          </div>

          {/* Existing filter content */}
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
        </div>
      </div>
      {currentQuestions.length > 0 && renderNavigationView()}
    </>
  );
}

export default SATPage;
