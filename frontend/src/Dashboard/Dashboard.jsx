import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  Home,
  CheckSquare,
  TrendingUp,
  History,
  LogOut,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Users,
  Gamepad
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import Homepage from './D-HomePage';
import PracticeExamsPage from './D-PracticeExamPage';
import Gamespage from './D-GamesPage';
import PerformancePage from "./D-PerformancePage";
import PracticeHistoryPage from "./D-PracticeHIstoryPage";
import YourFriendsPage from "./D-FriendsPage";


const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState("Home"); // Track active item
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => {
    // Special case for Home since it's the index route
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check cookies first
        const userCookie = Cookies.get('user');
        if (userCookie) {
          const parsedUser = JSON.parse(userCookie);
          setUser(parsedUser);
          return;
        }

        // If no cookie, check session via API
        const response = await fetch('/sat/check-session', {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          Cookies.set('user', JSON.stringify(userData), { expires: 7 });
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    Cookies.remove('user');
    navigate('/login');
  };

  const handleItemClick = (label) => {
    if (label !== "Logout") {
      setActiveItem(label);
    }
  };

  const handleLeaderboardClick = () => {
    console.log("Leaderboard clicked");
    // Add your leaderboard logic here
  };

  const handleAddFriendClick = () => {
    console.log("Add friend clicked");
    // Add your add friend logic here
  };

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';

    const names = name.split(' ');
    let initials = names[0].charAt(0).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].charAt(0).toUpperCase();
    }

    return initials;
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
  ];

  const assessmentItems = [
    { icon: CheckSquare, label: "Practice Exams", path: "/dashboard/practice-exams" },
    { icon: Gamepad, label: "Games", path: "/dashboard/games" },
  ];

  const performanceItems = [
    { icon: TrendingUp, label: "Performance", path: "/dashboard/performance" },
    { icon: History, label: "Practice History", path: "/dashboard/practice-history" },
  ];

  const accountItems = [
    { icon: MessageSquare, label: "Share Feedback", path: "/dashboard/share-feedback" },
    { icon: Users, label: "Your Friends", path: "/dashboard/your-friends" },
    { icon: LogOut, label: "Logout", action: handleLogout },
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
                className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                onClick={() => handleNavigation(item)}
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
            {!isCollapsed && <h3 className="section-title">Practice</h3>}
            <div className="nav-items">
              {assessmentItems.map((item, index) => (
                <div
                  key={index}
                  className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                  onClick={() => handleNavigation(item)}
                >
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
                <div
                  key={index}
                  className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                  onClick={() => handleNavigation(item)}
                >
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
                <div
                  key={index}
                  className={`nav-item ${item.action ? 'logout-item' : isActive(item.path) ? 'nav-item-active' : ''}`}
                  onClick={() => handleNavigation(item)}
                >
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
              {user ? getInitials(user.username || user.email) : 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user ? (user.username || user.email.split('@')[0]) : 'User'}</p>
              <p className="user-role">{user ? user.email : 'user@example.com'}</p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="header-right">
            {/* Leaderboard Button */}
            <button
              className="header-button leaderboard-button"
              onClick={handleLeaderboardClick}
              title="Leaderboard"
            >
              <img src="/leaderboard.svg" alt="Leaderboard" className="button-icon" />
            </button>

            {/* Add Friend Button */}
            <button
              className="header-button add-friend-button"
              onClick={handleAddFriendClick}
              title="Add Friend"
            >
              <img src="/add-friend.svg" alt="Add Friend" className="button-icon" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="main-content-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;