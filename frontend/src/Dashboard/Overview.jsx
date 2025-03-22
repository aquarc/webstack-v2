import React from 'react';
import { Book, Award, BarChart2 } from 'lucide-react';

function Overview() {
    return (
        <div className="overview-container">
            <div className="welcome-section">
                <h2>Welcome back, Student!</h2>
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
}

export default Overview;