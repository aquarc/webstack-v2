import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BarChart, LineChart, PieChart, Bell, User, LogOut, Book, Award, BarChart2, Search } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [userName, setUserName] = useState('');
    const [topicQuestions, setTopicQuestions] = useState({
        'Algebra': {total: 45, completed: 23},
        'Geometry': {total: 38, completed: 15},
        'Advanced Math': {total: 32, completed: 10},
        'Reading Comprehension': {total: 52, completed: 28},
        'Grammar & Usage': {total: 43, completed: 19},
        'Vocabulary': {total: 30, completed: 21}
    });
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [practiceTimes, setPracticeTimes] = useState([]);

    const handleStartPracticeSession = () => {
        // Navigate to the SAT page
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

    // Mock data for visualizations
    const satScoreData = [
        { month: 'Jan', score: 1200 },
        { month: 'Feb', score: 1250 },
        { month: 'Mar', score: 1280 },
        { month: 'Apr', score: 1320 },
        { month: 'May', score: 1380 }
    ];
    
    const studyHoursData = [
        { subject: 'Math', hours: 12 },
        { subject: 'Reading', hours: 8 },
        { subject: 'Writing', hours: 10 }
    ];
    
    const ecActivities = [
        { id: 1, name: 'Robotics Club', type: 'STEM', difficulty: 'Medium', status: 'Applied' },
        { id: 2, name: 'Harvard Summer Program', type: 'Summer Program', difficulty: 'Hard', status: 'Interested' },
        { id: 3, name: 'Math Olympiad', type: 'Competition', difficulty: 'Hard', status: 'Completed' },
        { id: 4, name: 'Community Service', type: 'Volunteer', difficulty: 'Easy', status: 'Active' }
    ];
    
    const satPracticeTests = [
        { id: 1, name: 'Practice Test 1', questions: 100, completed: 75, score: '1350/1600' },
        { id: 2, name: 'Math Section Drill', questions: 40, completed: 40, score: '35/40' },
        { id: 3, name: 'Reading Comprehension', questions: 52, completed: 30, score: '28/30' }
    ];

    // Mock questions by topic for the expanded view
    const questionsByTopic = {
        'Algebra': [
            { id: 'a1', name: 'Linear Equations', difficulty: 'Medium', completed: true },
            { id: 'a2', name: 'Quadratic Equations', difficulty: 'Hard', completed: false },
            { id: 'a3', name: 'Systems of Equations', difficulty: 'Medium', completed: true },
            { id: 'a4', name: 'Inequalities', difficulty: 'Easy', completed: true },
            { id: 'a5', name: 'Functions', difficulty: 'Hard', completed: false }
        ],
        'Geometry': [
            { id: 'g1', name: 'Angles and Lines', difficulty: 'Easy', completed: true },
            { id: 'g2', name: 'Triangles', difficulty: 'Medium', completed: true },
            { id: 'g3', name: 'Circles', difficulty: 'Hard', completed: false },
            { id: 'g4', name: 'Coordinate Geometry', difficulty: 'Medium', completed: false }
        ],
        'Advanced Math': [
            { id: 'm1', name: 'Complex Numbers', difficulty: 'Hard', completed: false },
            { id: 'm2', name: 'Trigonometry', difficulty: 'Hard', completed: false },
            { id: 'm3', name: 'Logarithms', difficulty: 'Medium', completed: true }
        ],
        'Reading Comprehension': [
            { id: 'r1', name: 'Main Idea', difficulty: 'Medium', completed: true },
            { id: 'r2', name: 'Supporting Details', difficulty: 'Easy', completed: true },
            { id: 'r3', name: 'Author\'s Purpose', difficulty: 'Medium', completed: false },
            { id: 'r4', name: 'Vocabulary in Context', difficulty: 'Medium', completed: true }
        ],
        'Grammar & Usage': [
            { id: 'gr1', name: 'Sentence Structure', difficulty: 'Medium', completed: true },
            { id: 'gr2', name: 'Verb Agreement', difficulty: 'Easy', completed: false },
            { id: 'gr3', name: 'Punctuation', difficulty: 'Medium', completed: true }
        ],
        'Vocabulary': [
            { id: 'v1', name: 'Context Clues', difficulty: 'Easy', completed: true },
            { id: 'v2', name: 'Word Relationships', difficulty: 'Medium', completed: true },
            { id: 'v3', name: 'Connotation/Denotation', difficulty: 'Hard', completed: false }
        ]
    };

    // Function to fetch questions for a topic
    const fetchQuestionsByTopic = (topic) => {
        setIsLoading(true);
        // In a real implementation, you would make an API call to your backend here
        // using something like:
        
        fetch('/sat/find-questions-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                test: 'SAT',
                difficulty: ['Easy', 'Medium', 'Hard'],
                subdomain: [topic]
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Process the returned questions
            setExpandedTopic(topic);
            setIsLoading(false);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            setIsLoading(false);
        });
       
        
        // For now, we'll just simulate an API call with a timeout
        setTimeout(() => {
            setExpandedTopic(topic);
            setIsLoading(false);
        }, 500);
    };

    useEffect(() => {
        // Check if the user cookie is present
        const userCookie = Cookies.get('user');
        
        // If the cookie is not present, navigate to the landing page
        if (!userCookie) {
            navigate('/');
        } else {
            try {
                const userData = JSON.parse(userCookie);
                setUserName(userData.name || 'Student');
            } catch (e) {
                setUserName('Student');
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        // Remove the user cookie
        Cookies.remove('user');
    
        // Navigate to landing page
        navigate('/');
    };
    
    // Section rendering functions
    const renderOverview = () => (
        <div className="overview-container">
            <div className="welcome-section">
                <h2>Welcome back, {userName}!</h2>
                <p>Here's your academic progress this month</p>
            </div>
            
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon sat-icon">
                        <Book size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>SAT Practice</h3>
                        <p>1380 <span className="positive-change">+60 pts</span></p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon ec-icon">
                        <Award size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Active ECs</h3>
                        <p>4 <span className="positive-change">+1 new</span></p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon study-icon">
                        <BarChart2 size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Study Hours</h3>
                        <p>30 hrs <span className="positive-change">+5 hrs</span></p>
                    </div>
                </div>
            </div>
            
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <ul className="activity-list">
                    <li>
                        <div className="activity-dot"></div>
                        <div className="activity-content">
                            <p className="activity-title">Completed Math Practice Test</p>
                            <p className="activity-time">2 hours ago</p>
                        </div>
                    </li>
                    <li>
                        <div className="activity-dot"></div>
                        <div className="activity-content">
                            <p className="activity-title">Applied to Robotics Club</p>
                            <p className="activity-time">Yesterday</p>
                        </div>
                    </li>
                    <li>
                        <div className="activity-dot"></div>
                        <div className="activity-content">
                            <p className="activity-title">Reached 1350+ SAT score milestone</p>
                            <p className="activity-time">3 days ago</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
    
    const renderAnalytics = () => (
        <div className="analytics-container">
            <h2>Performance Analytics</h2>
            
            <div className="analytics-cards">
                <div className="analytics-card">
                    <h3>SAT Score Progress</h3>
                    <div className="chart-container">
                        <div className="chart-placeholder">
                            <p>Line chart showing SAT score progression from Jan (1200) to May (1380)</p>
                        </div>
                    </div>
                </div>
                
                <div className="analytics-card">
                    <h3>Study Hours by Subject</h3>
                    <div className="chart-container">
                        <div className="chart-placeholder">
                            <p>Bar chart showing study hours: Math (12hrs), Reading (8hrs), Writing (10hrs)</p>
                        </div>
                    </div>
                </div>
                
                <div className="analytics-card">
                    <h3>Strength Analysis</h3>
                    <div className="strengths-container">
                        <div className="strength-item">
                            <div className="strength-label">Math - Algebra</div>
                            <div className="strength-bar">
                                <div className="strength-fill" style={{width: '90%'}}></div>
                            </div>
                            <div className="strength-value">90%</div>
                        </div>
                        <div className="strength-item">
                            <div className="strength-label">Math - Geometry</div>
                            <div className="strength-bar">
                                <div className="strength-fill" style={{width: '75%'}}></div>
                            </div>
                            <div className="strength-value">75%</div>
                        </div>
                        <div className="strength-item">
                            <div className="strength-label">Reading Comprehension</div>
                            <div className="strength-bar">
                                <div className="strength-fill" style={{width: '82%'}}></div>
                            </div>
                            <div className="strength-value">82%</div>
                        </div>
                        <div className="strength-item">
                            <div className="strength-label">Grammar & Writing</div>
                            <div className="strength-bar">
                                <div className="strength-fill" style={{width: '68%'}}></div>
                            </div>
                            <div className="strength-value">68%</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="analytics-recommendations">
                <h3>Personalized Recommendations</h3>
                <div className="recommendation-cards">
                    <div className="recommendation-card">
                        <h4>Focus Areas</h4>
                        <ul>
                            <li>Grammar & Writing - Practice with punctuation and verb agreement</li>
                            <li>Math - Review coordinate geometry concepts</li>
                        </ul>
                    </div>
                    <div className="recommendation-card">
                        <h4>Study Schedule</h4>
                        <p>Based on your progress, we recommend:</p>
                        <ul>
                            <li>Increase Writing practice by 2 hours/week</li>
                            <li>Maintain current Math practice schedule</li>
                            <li>Take a full practice test every 2 weeks</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderEcFinder = () => (
        <div className="ec-finder-container">
            <div className="ec-header">
                <h2>Extracurricular Activities</h2>
                <Link to="/extracurricular" className="explore-more-btn">
                    <Search size={16} /> Find More Activities
                </Link>
            </div>
            
            <div className="ec-filters">
                <select className="ec-filter-select">
                    <option value="all">All Types</option>
                    <option value="STEM">STEM</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Sports">Sports</option>
                    <option value="Arts">Arts</option>
                    <option value="Summer">Summer Programs</option>
                </select>
                
                <select className="ec-filter-select">
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
                
                <select className="ec-filter-select">
                    <option value="all">All Statuses</option>
                    <option value="Interested">Interested</option>
                    <option value="Applied">Applied</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>
            
            <div className="ec-cards">
                {ecActivities.map(activity => (
                    <div key={activity.id} className="ec-card">
                        <div className="ec-card-header">
                            <h3>{activity.name}</h3>
                            <span className={`ec-status status-${activity.status.toLowerCase()}`}>
                                {activity.status}
                            </span>
                        </div>
                        <div className="ec-card-content">
                            <p><strong>Type:</strong> {activity.type}</p>
                            <p><strong>Difficulty:</strong> {activity.difficulty}</p>
                        </div>
                        <div className="ec-card-actions">
                            <button className="ec-action-btn view-btn">View Details</button>
                            <button className="ec-action-btn update-btn">Update Status</button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="ec-recommendations">
                <h3>Recommended for You</h3>
                <div className="ec-recommendation-cards">
                    <div className="ec-recommendation-card">
                        <h4>National Science Olympiad</h4>
                        <p><strong>Type:</strong> Competition (STEM)</p>
                        <p><strong>Difficulty:</strong> Hard</p>
                        <p><strong>Why:</strong> Matches your interests in STEM and competitive activities</p>
                        <button className="ec-action-btn add-btn">Add to My List</button>
                    </div>
                    
                    <div className="ec-recommendation-card">
                        <h4>Yale Young Global Scholars</h4>
                        <p><strong>Type:</strong> Summer Program</p>
                        <p><strong>Difficulty:</strong> Hard</p>
                        <p><strong>Why:</strong> Great follow-up to your Harvard Summer Program interest</p>
                        <button className="ec-action-btn add-btn">Add to My List</button>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderSatPrep = () => (
        <div className="sat-prep-container">
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
                    
                    {satPracticeTests.map(test => (
                        <div key={test.id} className="sat-practice-row">
                            <div className="sat-practice-cell">{test.name}</div>
                            <div className="sat-practice-cell">
                                <div className="sat-practice-progress">
                                    <div className="sat-practice-progress-bar">
                                        <div 
                                            className="sat-practice-progress-fill" 
                                            style={{width: `${(test.completed/test.questions)*100}%`}}
                                        ></div>
                                    </div>
                                    <span>{test.completed}/{test.questions}</span>
                                </div>
                            </div>
                            <div className="sat-practice-cell">{test.score}</div>
                            <div className="sat-practice-cell">
                                <button className="sat-practice-btn continue-btn">
                                    {test.completed === test.questions ? 'Review' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="sat-practice-actions">
                    <button className="sat-practice-new-btn">New Practice Test</button>
                    <button className="sat-practice-drill-btn">Create Custom Drill</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/aquLogo.png" alt="Aquarc Logo" className="sidebar-logo" />
                </div>
                
                <div className="sidebar-menu">
                    <button 
                        className={`sidebar-menu-item ${activeSection === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveSection('overview')}
                    >
                        <BarChart2 size={20} />
                        <span>Overview</span>
                    </button>
                    
                    <button 
                        className={`sidebar-menu-item ${activeSection === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveSection('analytics')}
                    >
                        <BarChart size={20} />
                        <span>Analytics</span>
                    </button>
                    
                    <button 
                        className={`sidebar-menu-item ${activeSection === 'ec-finder' ? 'active' : ''}`}
                        onClick={() => setActiveSection('ec-finder')}
                    >
                        <Award size={20} />
                        <span>EC Finder</span>
                    </button>
                    
                    <button 
                        className={`sidebar-menu-item ${activeSection === 'sat-prep' ? 'active' : ''}`}
                        onClick={() => setActiveSection('sat-prep')}
                    >
                        <Book size={20} />
                        <span>SAT Prep</span>
                    </button>
                </div>
                
                <div className="sidebar-footer">
                    <button className="sidebar-menu-item" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            
            <main className="main-content">
                <header className="dashboard-header">
                
                    
                    <div className="header-actions">
                        <button className="header-action-btn">
                            <Bell size={20} />
                        </button>
                        
                        <div className="user-profile">
                            <div className="user-avatar">
                                <User size={20} />
                            </div>
                            <span className="user-name">{userName}</span>
                        </div>
                    </div>
                </header>
                
                <div className="dashboard-content">
                    {activeSection === 'overview' && renderOverview()}
                    {activeSection === 'analytics' && renderAnalytics()}
                    {activeSection === 'ec-finder' && renderEcFinder()}
                    {activeSection === 'sat-prep' && renderSatPrep()}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;