import React from 'react';
import { Search } from 'lucide-react';

function EcFinder() {
    const ecActivities = [
        { id: 1, name: 'Robotics Club', type: 'STEM', difficulty: 'Medium', status: 'Applied' },
        { id: 2, name: 'Harvard Summer Program', type: 'Summer Program', difficulty: 'Hard', status: 'Interested' },
        { id: 3, name: 'Math Olympiad', type: 'Competition', difficulty: 'Hard', status: 'Completed' },
        { id: 4, name: 'Community Service', type: 'Volunteer', difficulty: 'Easy', status: 'Active' }
    ];

    return (
        <div className="ec-finder-container">
            <div className="ec-header">
                <h2>Extracurricular Activities</h2>
                
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
}

export default EcFinder;