import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const [username, setUsername] = useState('');
    const location = useLocation();

    useEffect(() => {
        // If username is passed through navigation state, use it
        if (location.state?.username) {
            setUsername(location.state.username);
        }
        // Otherwise, fetch it from the server (you'll need to implement this endpoint)
        else {
            fetch('/sat/user-info')
                .then(response => response.json())
                .then(data => setUsername(data.username))
                .catch(error => console.error('Error fetching user info:', error));
        }
    }, [location]);
    const nextLessons = {
        math: {
            title: "Advanced Algebra Concepts",
            duration: "45 min",
            instructor: "Dr. Smith",
            difficulty: "Advanced"
        },
        english: {
            title: "Critical Reading Strategies",
            duration: "40 min",
            instructor: "Ms. Johnson",
            difficulty: "Intermediate"
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div>
                        <div className="logo-section">
                            <img src="/aquLogoWhiteCircle.png" alt="Aquarc Logo" className="logo-image" />
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <h1>Aquarc</h1>
                            </Link>
                        </div>

                        <nav className="nav-menu">
                            <div className="nav-item active">
                                <span>📊</span>
                                <span>Dashboard</span>
                            </div>
                            <div className="nav-item">
                                <span>🔢</span>
                                <span>Math Practice</span>
                            </div>
                            <div className="nav-item">
                                <span>📖</span>
                                <span>English Practice</span>
                            </div>
                            <div className="nav-item">
                                <span>📈</span>
                                <span>Analytics</span>
                            </div>
                        </nav>
                    </div>

                    <div className="bottom-nav">
                        <div className="nav-item">
                            <span>👤</span>
                            <span>Profile</span>
                        </div>
                        <div className="nav-item">
                            <span>🚪</span>
                            <span>Log out</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    <header className="header">
                        <div className="welcome-section">
                            <h2>Welcome back, {username}</h2>
                            <p>Continue your SAT preparation</p>
                        </div>
                        <div className="user-section">
                            <div className="user-avatar"></div>
                        </div>
                    </header>

                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            className="search-input"
                            placeholder="Search lessons and practice tests" 
                        />
                    </div>

                    <section className="next-lessons">
                        <div className="section-header">
                            <h3 className="section-title">Your next lessons</h3>
                            <div className="navigation-arrows">
                                <span>←</span>
                                <span>→</span>
                            </div>
                        </div>

                        <div className="lessons-grid">
                            <div className="lesson-card">
                                <p className="lesson-subject subject-math">Math</p>
                                <h4 className="lesson-title">{nextLessons.math.title}</h4>
                                <p className="lesson-instructor">{nextLessons.math.instructor}</p>
                                <div className="lesson-details">
                                    <span>{nextLessons.math.duration}</span>
                                    <span>•</span>
                                    <span>{nextLessons.math.difficulty}</span>
                                </div>
                            </div>

                            <div className="lesson-card">
                                <p className="lesson-subject subject-english">English</p>
                                <h4 className="lesson-title">{nextLessons.english.title}</h4>
                                <p className="lesson-instructor">{nextLessons.english.instructor}</p>
                                <div className="lesson-details">
                                    <span>{nextLessons.english.duration}</span>
                                    <span>•</span>
                                    <span>{nextLessons.english.difficulty}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;