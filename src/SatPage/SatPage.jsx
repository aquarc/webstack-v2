import React, { useState } from 'react';
import './SatPage.css';

function SATPage() {
  const [selectedTopics, setSelectedTopics] = useState({
    'Math': false,
    'Reading': false,
    'Writing': false,
    'Essay': false,
    'Grammar': false,
    'Algebra': false,
    'Geometry': false,
    'Trigonometry': false,
    'Data Analysis': false,
    'Vocabulary': false
  });

  const handleCheckboxChange = (topic) => {
    setSelectedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  return (
    <div className="sat-page">
      <div className="sat-main-content">
        <h1>SAT Preparation</h1>
        {/* Add your main content here */}
      </div>
      
      <div className="checkbox-column">
        <h2>Filters</h2>
        
      </div>
    </div>
  );
}

export default SATPage;