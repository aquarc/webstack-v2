import React from 'react';
import { Sun, GraduationCap, Trophy } from 'lucide-react';
import './ECSection.css';
import ECImage from '../../Assets/ec.jpg'

const ExtracurricularSection = () => {
  return (
    <section className="extracurricular-section">
      <div className="extracurricular-container">
        <div className="extracurricular-image-container">
          <img 
            src={ECImage}
            alt="Student working on laptop" 
            className="extracurricular-image"
          />
        </div>

        <div className="extracurricular-content">
          <h2 className="extracurricular-title">Extracurricular Finder</h2>
          <p className="extracurricular-description">
            Discover and track the perfect extracurricular activities that align with your interests and college goals. From sports to clubs, we've got you covered.
          </p>
          
          <div className="activities-list">
            <div className="activity-item">
              <Sun className="activity-icon" />
              <span>Summer Programs</span>
            </div>
            <div className="activity-item">
              <GraduationCap className="activity-icon" />
              <span>Scholarships</span>
            </div>
            <div className="activity-item">
              <Trophy className="activity-icon" />
              <span>Competitions</span>
            </div>
          </div>

          <a href="/finder" className="extracurricular-cta">
            Find now →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ExtracurricularSection;