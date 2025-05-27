import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { ChevronDown, Clock, X, Play, Pause, RotateCcw } from "lucide-react";

const PomodoroTimer = forwardRef((props, ref) => {
  const [mode, setMode] = useState("Stopwatch"); // 'Pomodoro', 'Stopwatch', or 'Timer'
  /* Pomodoro mode */
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // time
  const [selectedDuration, setSelectedDuration] = useState(25 * 60);
  const [time, setTime] = useState(25 * 60);
  const [inputValue, setInputValue] = useState("25"); // New state for input

  // for breaks
  const [selectedBreakDuration, setSelectedBreakDuration] = useState(5 * 60);
  const [breakInputValue, setBreakInputValue] = useState("5");

  // for long breaks
  const [selectedLongBreakDuration, setSelectedLongBreakDuration] = useState(
    15 * 60,
  );
  const [longBreakInputValue, setLongBreakInputValue] = useState("15");
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const [showModal, setShowModal] = useState(false);

  // modal
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  const durations = [
    { label: "15", value: 15 * 60 },
    { label: "25", value: 25 * 60 },
    { label: "55", value: 55 * 60 },
  ];
  const longBreakDurations = [
    { label: "10", value: 10 * 60 },
    { label: "15", value: 15 * 60 },
    { label: "20", value: 20 * 60 },
  ];

  useImperativeHandle(ref, () => ({
    start: () => {
      if (!isActive) {
        setIsActive(true);
      }
    },
    // Optional: expose other controls if needed
    toggle: () => setIsActive(!isActive),
    stop: () => setIsActive(false),
    reset: () => resetTimer(),
    stopwatchReset: (() => {
      if (mode === "Stopwatch") {
        setTime(0);
      }
    }),
    setPracticeTestMode: (minutes) => {
      setMode("Timer");
      handleDurationChange(minutes * 60);
      setIsActive(true);
    },
  }));

  // reset timer when mode is changed
  useEffect(() => {
    resetTimer();
  }, [mode]);

  // Keep input in sync with duration changes
  useEffect(() => {
    setInputValue(String(selectedDuration / 60));
  }, [selectedDuration]);

  // Update timer logic
  useEffect(() => {
    if (mode === "Timer" && time <= 0) {
      props.onTimeUp?.();
      resetTimer();
    }
  }, [time, mode]);

  /*
  // Timer logic
  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'Pomodoro') {
          setTime(time => time - 1);
        } else {
          setTime(time => time + 1);
        }
      }, 1000);
    }

    if (mode === 'Pomodoro' && time <= 0) {
      clearInterval(interval);
      if (!isBreak) {
        const newCount = PomodoroCount + 1;
        setPomodoroCount(newCount);
        setIsBreak(true);
        setTime(newCount % 4 === 0 ? selectedLongBreakDuration : selectedBreakDuration);
      } else {
        setIsBreak(false);
        setTime(selectedDuration);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, time, isBreak, mode, selectedDuration, selectedBreakDuration, selectedLongBreakDuration, PomodoroCount]);
  */

  // Modified duration handling
  const handleDurationChange = (value, updateInput = true) => {
    const minutes = value / 60;
    setSelectedDuration(value);
    setTime(value);
    if (updateInput) setInputValue(String(minutes));
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showModal &&
        !buttonRef.current?.contains(event.target) &&
        !modalRef.current?.contains(event.target)
      ) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  /* for breaks */

  // Add break duration sync effect
  useEffect(() => {
    setBreakInputValue(String(selectedBreakDuration / 60));
  }, [selectedBreakDuration]);

  useEffect(() => {
    // update interval
    let interval = null;

    if (mode === "Pomodoro") {
      if (isActive && time > 0) {
        interval = setInterval(() => {
          setTime((time) => time - 1);
        }, 1000);
      } else if (isActive && time <= 0) {
        clearInterval(interval);
        if (!isBreak) {
          // Completed a work session
          const newCount = pomodoroCount + 1;
          setPomodoroCount(newCount);

          // Every 4 Pomodoros, take a long break
          setIsBreak(true);
          setTime(
            newCount % 4 === 0
              ? selectedLongBreakDuration
              : selectedBreakDuration,
          );
        } else {
          // Break finished
          setIsBreak(false);
          setTime(selectedDuration);
        }
      }
    } else if (mode === "Stopwatch") {
      if (isActive) {
        interval = setInterval(() => {
          setTime((time) => time + 1);
        }, 1000);
      }
    } else if (mode === "Timer") {
      if (isActive) {
        interval = setInterval(() => {
          setTime((time) => time - 1);
        }, 1000);
      }
    }

    return () => clearInterval(interval);
  }, [
    isActive,
    time,
    isBreak,
    mode,
    selectedDuration,
    selectedBreakDuration,
    selectedLongBreakDuration,
    pomodoroCount,
  ]);

  // Add long break handlers
  const handleLongBreakDurationChange = (value, updateInput = true) => {
    const minutes = value / 60;
    setSelectedLongBreakDuration(value);
    if (updateInput) setLongBreakInputValue(String(minutes));
  };

  const toggleTimer = () => {
    if (!isActive) {
      if (mode === "Pomodoro") {
        setTime(selectedDuration);
      } else if (mode === "Stopwatch") {
        setTime(0);
      } else if (mode === "Timer") {
        setTime(17 * 60);
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    if (mode === "Pomodoro") {
      setTime(selectedDuration);
    } else if (mode === "Stopwatch") {
      setTime(0);
    } else if (mode === "Timer") {
      setTime(17 * 60);
    }
  };

  // Add break duration handler
  const handleBreakDurationChange = (value, updateInput = true) => {
    const minutes = value / 60;
    setSelectedBreakDuration(value);
    if (updateInput) setBreakInputValue(String(minutes));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed top-20 right-4 pointer-events-auto"
      style={{ zIndex: 9999 }}
    >
      {/* Timer Button - Always visible */}
      <button
        ref={buttonRef}
        onClick={() => setShowModal(!showModal)}
        className="calculator-icon-button bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-sm hover:bg-gray-50 transition-colors format-time"
      >
        <span>{formatTime(time)}</span>

        <ChevronDown size={16} />
      </button>

      {/* Dropdown Modal */}
      {showModal && (
        <div
          ref={modalRef}
          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-64 p-4 z-50 pomodoro-modal"
        >
          <div className="sidebar-header">
            <h3 className="text-sm font-semibold text-gray-900">
              {mode === "Timer" ? "Test Timer" : "Stopwatch/Timer"}
            </h3>
            <div>
              <button
                onClick={toggleTimer}
                className={`text-xs px-3 py-2 rounded transition-colors sidebar-close-button
                ${
                  isActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={resetTimer}
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors sidebar-close-button"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors sidebar-close-button"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="input-group">
            {mode === "Timer" ? (
              <button className="mode-display-button" disabled>
                Timer
              </button>
            ) : (
              ["Stopwatch", "Pomodoro"].map((modeChoice) => (
                <button
                  key={modeChoice}
                  onClick={() => setMode(modeChoice)}
                  className={`input-group-button ${mode === modeChoice ? "active" : ""}`}
                >
                  {modeChoice}
                </button>
              ))
            )}
          </div>

          {/* Pomodoro settings */}
          {/* Duration Selection */}
          {mode === "Pomodoro" && (
            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-2">
                Duration:
              </label>
              <div className="input-group">
                <input
                  id="duration-work"
                  className="input-group-input"
                  type="number"
                  value={inputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputValue(value);
                    const minutes = parseFloat(value);
                    if (!isNaN(minutes) && minutes > 0) {
                      handleDurationChange(minutes * 60, false);
                    }
                  }}
                  onBlur={() => {
                    const minutes = parseFloat(inputValue);
                    if (isNaN(minutes) || minutes <= 0) {
                      handleDurationChange(selectedDuration); // Reset to last valid value
                    }
                  }}
                ></input>
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    type="button"
                    className={`input-group-button ${
                      selectedDuration === duration.value ? "active" : ""
                    }`}
                    onClick={() => handleDurationChange(duration.value)}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
              <label className="block text-xs text-gray-600 mb-2">
                Break Duration:
              </label>
              <input
                id="duration-break"
                type="number"
                value={breakInputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setBreakInputValue(value);
                  const minutes = parseFloat(value);
                  if (!isNaN(minutes) && minutes > 0) {
                    handleBreakDurationChange(minutes * 60, false);
                  }
                }}
                onBlur={() => {
                  const minutes = parseFloat(breakInputValue);
                  if (isNaN(minutes) || minutes <= 0) {
                    handleBreakDurationChange(selectedBreakDuration);
                  }
                }}
              />
              <label className="block text-xs text-gray-600 mb-2">
                Long Break Duration (Every 4):{" "}
              </label>
              <div className="input-group">
                <input
                  id="duration-long-break"
                  className="input-group-input"
                  type="number"
                  value={longBreakInputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLongBreakInputValue(value);
                    const minutes = parseFloat(value);
                    if (!isNaN(minutes) && minutes > 0) {
                      handleLongBreakDurationChange(minutes * 60, false);
                    }
                  }}
                  onBlur={() => {
                    const minutes = parseFloat(longBreakInputValue);
                    if (isNaN(minutes) || minutes <= 0) {
                      handleLongBreakDurationChange(selectedLongBreakDuration);
                    }
                  }}
                />
                {longBreakDurations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() =>
                      handleLongBreakDurationChange(duration.value)
                    }
                    type="button"
                    className={`input-group-button ${
                      selectedLongBreakDuration === duration.value
                        ? "active"
                        : ""
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default PomodoroTimer;
