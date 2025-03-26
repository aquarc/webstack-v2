import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BarChart, Bell, User, LogOut, Book, Award, BarChart2 } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

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

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/aquLogo.png" alt="Aquarc Logo" className="sidebar-logo" />
                    <h1>aquarc</h1>
                </div>
                
                <div className="sidebar-menu">
                    <Link 
                        to="/overview" 
                        className={`sidebar-menu-item ${location.pathname === '/overview' ? 'active' : ''}`}
                    >
                        <BarChart2 size={20} />
                        <span>Overview</span>
                    </Link>
                    
                    <Link 
                        to="/analytics" 
                        className={`sidebar-menu-item ${location.pathname === '/analytics' ? 'active' : ''}`}
                    >
                        <BarChart size={20} />
                        <span>Analytics</span>
                    </Link>
                    
                    <Link 
                        to="/ec-finder" 
                        className={`sidebar-menu-item ${location.pathname === '/ec-finder' ? 'active' : ''}`}
                    >
                        <Award size={20} />
                        <span>EC Finder</span>
                    </Link>
                    
                    <Link 
                        to="/sat-prep" 
                        className={`sidebar-menu-item ${location.pathname === '/sat-prep' ? 'active' : ''}`}
                    >
                        <Book size={20} />
                        <span>SAT Prep</span>
                    </Link>
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
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
export default Dashboard;