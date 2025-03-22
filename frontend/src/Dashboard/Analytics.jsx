import React from 'react';

function Analytics() {
    return (
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
}

export default Analytics;