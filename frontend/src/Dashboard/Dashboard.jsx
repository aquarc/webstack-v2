// Dashboard.jsx changes
import React, { useState } from "react";
import "./Dashboard.css";
import {
  Home,
  FileText,
  CheckSquare,
  TrendingUp,
  History,
  LogOut,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { icon: Home, label: "Home", active: true },
  ];

  const assessmentItems = [
    { icon: FileText, label: "Diagnostic Tests" },
    { icon: CheckSquare, label: "Practice Exams" },
  ];

  const performanceItems = [
    { icon: TrendingUp, label: "Performance" },
    { icon: History, label: "Practice History" },
  ];

  const accountItems = [
    { icon: MessageSquare, label: "Share Feedback" },
    { icon: LogOut, label: "Logout" },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="logo-icon">
                <img
                  src="/aquLogoWhiteCircle.png"
                  alt="Aquarc Logo"
                  className="logo-image"
                />
              </div>
              {!isCollapsed && <h1 className="logo-text">Aquarc</h1>}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="nav-container">
          {/* Home Section */}
          <div className="nav-section">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`nav-item ${item.active ? 'nav-item-active' : ''}`}
              >
                <div className="nav-item-content">
                  <item.icon className="nav-icon" />
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Assessments Section */}
          <div className="nav-section">
            {!isCollapsed && <h3 className="section-title">Assessments</h3>}
            <div className="nav-items">
              {assessmentItems.map((item, index) => (
                <div key={index} className="nav-item">
                  <div className="nav-item-content">
                    <item.icon className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Section */}
          <div className="nav-section">
            {!isCollapsed && <h3 className="section-title">Performance</h3>}
            <div className="nav-items">
              {performanceItems.map((item, index) => (
                <div key={index} className="nav-item">
                  <div className="nav-item-content">
                    <item.icon className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="nav-section">
            {!isCollapsed && <h3 className="section-title">Account</h3>}
            <div className="nav-items">
              {accountItems.map((item, index) => (
                <div key={index} className="nav-item">
                  <div className="nav-item-content">
                    <item.icon className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Button at Bottom */}
          <button className={`sidebar-toggle-icon-button ${isCollapsed ? 'collapsed' : ''}`} onClick={toggleSidebar}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>


        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Your main dashboard content goes here */}
      </div>
    </div>
  );
};

export default Dashboard;