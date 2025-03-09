import React, { useState, useEffect, useRef } from 'react';
import { Clock, X, Play, Pause, RotateCcw } from 'lucide-react';

const PomodoroTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
    
  // time
  const [selectedDuration, setSelectedDuration] = useState(25 * 60);
  const [time, setTime] = useState(25 * 60);
  const [inputValue, setInputValue] = useState('25'); // New state for input

  // for breaks 
  const [selectedBreakDuration, setSelectedBreakDuration] = useState(5 * 60);
  const [breakInputValue, setBreakInputValue] = useState('5');

  // for long breaks
  const [selectedLongBreakDuration, setSelectedLongBreakDuration] = useState(15 * 60);
  const [longBreakInputValue, setLongBreakInputValue] = useState('15');
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const [showModal, setShowModal] = useState(false);

  // modal
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  const durations = [
    { label: "15 min", value: 15 * 60 },
    { label: "25 min", value: 25 * 60 },
    { label: "55 min", value: 55 * 60 }
  ];

  // Keep input in sync with duration changes
  useEffect(() => {
    setInputValue(String(selectedDuration / 60));
  }, [selectedDuration]);

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
      if (showModal && 
          !buttonRef.current?.contains(event.target) &&
          !modalRef.current?.contains(event.target)) {
        setShowModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  /* for breaks */
    
  // Add break duration sync effect
  useEffect(() => {
    setBreakInputValue(String(selectedBreakDuration / 60));
  }, [selectedBreakDuration]);

  // Update timer effect to handle long breaks
  useEffect(() => {
    let interval = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (isActive && time <= 0) {
      clearInterval(interval);
      if (!isBreak) {
        // Completed a work session
        const newCount = pomodoroCount + 1;
        setPomodoroCount(newCount);
        
        // Every 4 pomodoros, take a long break
        setIsBreak(true);
        setTime(newCount % 4 === 0 ? selectedLongBreakDuration : selectedBreakDuration);
      } else {
        // Break finished
        setIsBreak(false);
        setTime(selectedDuration);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, time, isBreak, selectedDuration, selectedBreakDuration, selectedLongBreakDuration, pomodoroCount]);

  // Add long break handlers
  const handleLongBreakDurationChange = (value, updateInput = true) => {
    const minutes = value / 60;
    setSelectedLongBreakDuration(value);
    if (updateInput) setLongBreakInputValue(String(minutes));
  };

  // Add break duration handler
  const handleBreakDurationChange = (value, updateInput = true) => {
    const minutes = value / 60;
    setSelectedBreakDuration(value);
    if (updateInput) setBreakInputValue(String(minutes));
  };

  const toggleTimer = () => {
    if (!isActive) {
      setTime(selectedDuration);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTime(selectedDuration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-20 right-4 pointer-events-auto" style={{ zIndex: 9999 }}>
      {/* Timer Button - Always visible */}
      <button
        ref={buttonRef}
        onClick={() => setShowModal(!showModal)}
        className="calculator-icon-button bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="ml-2 text-sm font-medium text-gray-700">
          {formatTime(time)}
        </span>
      </button>

      {/* Dropdown Modal */}
      {showModal && (
        <div
          ref={modalRef}
          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-64 p-4 z-50 pomodoro-modal"
        >
          <div className="sidebar-header">
            <h3 className="text-sm font-semibold text-gray-900">Pomodoro Timer</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-500 transition-colors sidebar-close-button"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={toggleTimer}
              className={`text-xs px-3 py-2 rounded transition-colors sidebar-close-button
              ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isActive ? (
                  <Pause size={16} />
              ) : (
                  <Play size={16} />
              )}
            </button>
            <button
              onClick={resetTimer}
              className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors sidebar-close-button"
            >
            <RotateCcw size={16} />
            </button>
          </div>

          {/* Duration Selection */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-2">Duration:</label>
            { /* TODO: you don't do anything with this (nothing for duration-work)
                also validate input */ }
            <input 
              id="duration-work" 
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
            >
            </input>
            <div className="grid grid-cols-3 gap-2">
              {durations.map(duration => (
                <button
                  key={duration.value}
                  onClick={() => handleDurationChange(duration.value)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    selectedDuration === duration.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
            <label className="block text-xs text-gray-600 mb-2">Break Duration:</label>
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
            <label className="block text-xs text-gray-600 mb-2">Long Break:</label>
            <input 
              id="duration-long-break" 
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
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[15, 25, 55].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleLongBreakDurationChange(mins * 60)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    selectedLongBreakDuration === mins * 60
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
