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
  Bell,
  Search,
  Settings,
  User,
  HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogoClick = () => {
    navigate("/");
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
                <div className="logo-section" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="logo-container">
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
          <button
            className="sidebar-toggle-icon-button"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Floating User Info Header */}
        <div className={`floating-header ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Left Section - User Info */}
          <div className="header-left">
            <div className="user-avatar">
              JD
            </div>
            <div className="user-details">
              <p className="user-name">John Doe</p>
              <p className="user-role">Student</p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="header-right">
            {/* Action Buttons */}
            <button className="header-button">
              <HelpCircle size={18} />
            </button>

            <button className="header-button">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="main-content-body">
          <h2>Practice Sets</h2>
          <p>Your main content goes here...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;