import React from 'react';
import "./D-HomePage.css";

const HomePage = ({ isSidebarCollapsed }) => {
  return (
    <div className={`homepage-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="homepage-content">
        <h2>Home</h2>
        <p>Welcome To Aquarc! This is your dashboard homepage.</p>
      </div>
    </div>
  );
};

export default HomePage;