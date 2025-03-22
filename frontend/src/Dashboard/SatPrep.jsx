import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function SatPrep() {
    const navigate = useNavigate();
    const location = useLocation();
    const [practiceTimes, setPracticeTimes] = useState([]);

    const handleStartPracticeSession = () => {
        // Navigate to the SAT practice test page
        navigate('/sat');
    };

    useEffect(() => {
        const fetchPracticeTimes = async () => {
            try {
                const response = await fetch('/sat/get-practice-times', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies for session authentication
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch practice times');
                }
                const data = await response.json();
                setPracticeTimes(data); // Assuming you have a state variable for practice times
            } catch (error) {
                console.error('Error fetching practice times:', error);
            }
        };
    
        fetchPracticeTimes();
    }, []);

    // Check if the current route is /sat
    const isPracticeTestPage = location.pathname === '/sat';

    return (
        <div className="sat-prep-container">
            {isPracticeTestPage ? (
                // Render the practice test page
                <div className="practice-test-page">
                    <h1>SAT Practice Test</h1>
                    <p>Welcome to the SAT practice test. Start your session below.</p>
                    {/* Add your practice test content here */}
                </div>
            ) : (
                // Render the SAT Prep dashboard
                <>
                    <div className="sat-header">
                        <h2>SAT Preparation</h2>
                        <button onClick={handleStartPracticeSession} className="start-practice-btn">
                            Start New Practice Session
                        </button>
                    </div>
                    <div className="sat-progress">
                        <h3>Practice Times</h3>
                        <ul>
                            {practiceTimes && practiceTimes.length > 0 ? (
                                practiceTimes.map((topic, index) => (
                                    <li key={index}>
                                        {topic.topic}: {topic.timeSpent} seconds
                                    </li>
                                ))
                            ) : (
                                <li>No practice times recorded.</li>
                            )}
                        </ul>
                    </div>
                    
                    <div className="sat-progress">
                        <div className="sat-progress-header">
                            <h3>Your Progress</h3>
                            <div className="sat-score-display">
                                <span className="current-score">Current: 1380</span>
                                <span className="target-score">Target: 1500</span>
                            </div>
                        </div>
                        
                        <div className="sat-progress-bar-container">
                            <div className="sat-progress-bar">
                                <div className="sat-progress-fill" style={{width: '69%'}}></div>
                                <div className="sat-progress-marker" style={{left: '60%'}} title="Last month: 1320"></div>
                            </div>
                            <div className="sat-progress-labels">
                                <span>1000</span>
                                <span>1200</span>
                                <span>1400</span>
                                <span>1600</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="sat-breakdown">
                        <h3>Section Breakdown</h3>
                        <div className="sat-breakdown-cards">
                            <div className="sat-breakdown-card">
                                <h4>Math</h4>
                                <div className="sat-section-score">720 / 800</div>
                                <div className="sat-section-bar">
                                    <div className="sat-section-fill" style={{width: '90%'}}></div>
                                </div>
                                <div className="sat-section-topics">
                                    <div className="sat-topic">
                                        <span>Algebra</span>
                                        <span>95%</span>
                                    </div>
                                    <div className="sat-topic">
                                        <span>Geometry</span>
                                        <span>85%</span>
                                    </div>
                                    <div className="sat-topic">
                                        <span>Advanced Math</span>
                                        <span>88%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="sat-breakdown-card">
                                <h4>Reading & Writing</h4>
                                <div className="sat-section-score">660 / 800</div>
                                <div className="sat-section-bar">
                                    <div className="sat-section-fill" style={{width: '82.5%'}}></div>
                                </div>
                                <div className="sat-section-topics">
                                    <div className="sat-topic">
                                        <span>Reading Comprehension</span>
                                        <span>87%</span>
                                    </div>
                                    <div className="sat-topic">
                                        <span>Grammar & Usage</span>
                                        <span>76%</span>
                                    </div>
                                    <div className="sat-topic">
                                        <span>Vocabulary</span>
                                        <span>85%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="sat-practice-tests">
                        <h3>Practice Tests & Drills</h3>
                        <div className="sat-practice-table">
                            <div className="sat-practice-header">
                                <div className="sat-practice-cell">Test Name</div>
                                <div className="sat-practice-cell">Progress</div>
                                <div className="sat-practice-cell">Score</div>
                                <div className="sat-practice-cell">Actions</div>
                            </div>
                            
                            ]
                        </div>
                        
                        <div className="sat-practice-actions">
                            <button className="sat-practice-new-btn">New Practice Test</button>
                            <button className="sat-practice-drill-btn">Create Custom Drill</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default SatPrep;