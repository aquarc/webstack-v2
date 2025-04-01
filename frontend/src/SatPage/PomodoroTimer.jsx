import React, { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";
import sendClickEvent from "./SatPage.jsx";

const PomodoroTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [time, setTime] = useState(25 * 60);
  const [selectedDuration, setSelectedDuration] = useState(25 * 60);
  const [showModal, setShowModal] = useState(false);

  const durations = [
    { label: "15 min", value: 15 * 60 },
    { label: "25 min", value: 25 * 60 },
    { label: "55 min", value: 55 * 60 },
  ];

  useEffect(() => {
    let interval = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      clearInterval(interval);
      if (!isBreak) {
        setIsBreak(true);
        setTime(5 * 60);
      } else {
        setIsBreak(false);
        setTime(selectedDuration);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, time, isBreak, selectedDuration]);

  const toggleTimer = () => {
    if (!isActive) {
      setTime(selectedDuration);
    }
    setIsActive(!isActive);
    sendClickEvent("toggle-timer");
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTime(selectedDuration);
    sendClickEvent("reset-timer");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDurationChange = (value) => {
    setSelectedDuration(value);
    setTime(value);
  };

  return (
    <div
      className="absolute top-0 right-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      <div className="fixed top-20 right-4 flex flex-col items-end pointer-events-auto">
        {/* Timer Button */}
        {!showModal && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-md shadow-md transition-colors duration-200"
          >
            <Clock size={16} />
          </button>
        )}

        {/* Timer Modal */}
        {showModal && (
          <div className="relative">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="relative bg-white shadow-md rounded-lg p-4 w-72">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Pomodoro Timer
                </h3>
              </div>

              {/* Duration Selection with more spacing */}
              <div className="mb-3">
                <label className="block text-gray-700 text-xs font-medium mb-1">
                  Duration:
                </label>
                <div className="flex space-x-3 justify-center">
                  {durations.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => handleDurationChange(duration.value)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        selectedDuration === duration.value
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-gray-900 font-mono tracking-wider">
                  {formatTime(time)}
                </div>
              </div>

              {/* Controls with better spacing */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={toggleTimer}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  {isActive ? "Pause" : "Start"}
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Break Time Overlay */}
        {isBreak && (
          <div className="fixed inset-0 bg-gray-900/95 flex items-center justify-center">
            <div className="w-64 bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-center text-white">
                <h2 className="text-xl font-bold mb-2">Break Time!</h2>
                <div className="text-4xl font-bold mb-3 font-mono">
                  {formatTime(time)}
                </div>
                <p className="text-sm opacity-90">
                  Take a moment to stretch and relax
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;

