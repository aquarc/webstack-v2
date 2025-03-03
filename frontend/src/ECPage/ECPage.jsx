import React, { useState } from 'react';
import './ECPage.css';

const ECPage = () => {
  const [categories, setCategories] = useState([]);
  const [gradeLevel, setGradeLevel] = useState('');
  const [difficulty, setDifficulty] = useState([]);

  const handleCategoryChange = (value) => {
    setCategories(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  const handleSearch = () => {
    console.log({ categories, gradeLevel, difficulty });
  };

  return (
    <div className="ec-container">
      <div className="ec-header">
        <h1>Extracurricular Activities</h1>
        <p>Find the perfect extracurricular activities to enhance your college application</p>
      </div>
      
      <div className="ec-content">
        <div className="ec-left-panel">
          <div className="ec-info-card">
            <h2>Why Extracurriculars Matter</h2>
            <p>Extracurricular activities demonstrate your interests, commitment, and leadership skills to college admissions officers.</p>
            
            <div className="ec-benefits">
              <div className="ec-benefit-item">
                <div className="ec-benefit-icon">🏆</div>
                <h3>Stand Out</h3>
                <p>Differentiate yourself from other applicants with similar academic profiles</p>
              </div>
              
              <div className="ec-benefit-item">
                <div className="ec-benefit-icon">🌱</div>
                <h3>Develop Skills</h3>
                <p>Build valuable skills like leadership, teamwork, and time management</p>
              </div>
              
              <div className="ec-benefit-item">
                <div className="ec-benefit-icon">🔍</div>
                <h3>Explore Interests</h3>
                <p>Discover and deepen your passion in various fields</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ec-right-panel">
          <div className="ec-filter-card">
            <h2>Find Your Opportunities</h2>
            
            <form className="ec-filter-form">
              <div className="ec-form-group">
                <h3>Category</h3>
                <div className="ec-checkbox-group">
                  <label className="ec-checkbox-label">
                    <input 
                      type="checkbox"
                      checked={categories.includes('Summer Programs')}
                      onChange={() => handleCategoryChange('Summer Programs')} 
                    />
                    <span className="ec-checkbox-text">Summer Programs</span>
                  </label>
                  
                  <label className="ec-checkbox-label">
                    <input 
                      type="checkbox"
                      checked={categories.includes('Scholarships')}
                      onChange={() => handleCategoryChange('Scholarships')} 
                    />
                    <span className="ec-checkbox-text">Scholarships</span>
                  </label>
                  
                  <label className="ec-checkbox-label">
                    <input 
                      type="checkbox"
                      checked={categories.includes('Competitions')}
                      onChange={() => handleCategoryChange('Competitions')} 
                    />
                    <span className="ec-checkbox-text">Competitions</span>
                  </label>
                </div>
              </div>

              <div className="ec-form-group">
                <h3>Grade Level</h3>
                <div className="ec-radio-group">
                  <label className="ec-radio-label">
                    <input 
                      type="radio" 
                      name="gradeLevel" 
                      value="Freshman"
                      checked={gradeLevel === 'Freshman'}
                      onChange={() => setGradeLevel('Freshman')} 
                    />
                    <span className="ec-radio-text">Freshman</span>
                  </label>
                  
                  <label className="ec-radio-label">
                    <input 
                      type="radio" 
                      name="gradeLevel" 
                      value="Sophomore"
                      checked={gradeLevel === 'Sophomore'}
                      onChange={() => setGradeLevel('Sophomore')} 
                    />
                    <span className="ec-radio-text">Sophomore</span>
                  </label>
                  
                  <label className="ec-radio-label">
                    <input 
                      type="radio" 
                      name="gradeLevel" 
                      value="Junior"
                      checked={gradeLevel === 'Junior'}
                      onChange={() => setGradeLevel('Junior')} 
                    />
                    <span className="ec-radio-text">Junior</span>
                  </label>
                  
                  <label className="ec-radio-label">
                    <input 
                      type="radio" 
                      name="gradeLevel" 
                      value="Senior"
                      checked={gradeLevel === 'Senior'}
                      onChange={() => setGradeLevel('Senior')} 
                    />
                    <span className="ec-radio-text">Senior</span>
                  </label>
                </div>
              </div>

              <div className="ec-form-group">
                <h3>Difficulty</h3>
                <div className="ec-checkbox-group">
                  <label className="ec-checkbox-label">
                    <input 
                      type="checkbox"
                      checked={difficulty.includes('Easy')}
                      onChange={() => handleDifficultyChange('Easy')} 
                    />
                    <span className="ec-checkbox-text">Easy</span>
                  </label>
                  
                  <label className="ec-checkbox-label">
                    <input 
                      type="checkbox"
                      checked={difficulty.includes('Medium')}
                      onChange={() => handleDifficultyChange('Medium')} 
                    />
                    <span className="ec-checkbox-text">Medium</span>
                  </label>
                  
                  <label className="ec-checkbox-label">
                    <input 
                      type="checkbox"
                      checked={difficulty.includes('Hard')}
                      onChange={() => handleDifficultyChange('Hard')} 
                    />
                    <span className="ec-checkbox-text">Hard</span>
                  </label>
                </div>
              </div>

              <button 
                type="button" 
                className="ec-search-btn" 
                onClick={handleSearch}
                disabled={categories.length === 0 || !gradeLevel}
              >
                Find Opportunities
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECPage;