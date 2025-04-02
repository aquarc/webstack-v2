import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import "./NewsletterSection/NewsLetterSection";


const headlines = {
  0: (
    <div className="headline">
      <span className="highlight-text">Higher SAT</span>
      <br />
      <span className="headline-text">2 clicks away</span>
    </div>
  ),
  1: (
    <div className="headline">
      <span className="highlight-text">Dream Summer Programs</span>
      <br />
      <span className="headline-text">become a reality</span>
    </div>
  ),
  2: (
    <div className="headline">
      <span className="highlight-text">Internship Opportunities</span>
      <br />
      <span className="headline-text">discovered weekly</span>
    </div>
  ),
  3: (
    <div className="headline">
      <span className="highlight-text">Maximize your</span>
      <br />
      <span className="headline-text">high school experience</span>
    </div>
  ),
};

const LandingPage = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const headlineKeys = Object.keys(headlines);
    const interval = setInterval(() => {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % headlineKeys.length);
        setFadeOut(false);
      }, 500);
    }, 4000);
  
    return () => clearInterval(interval);
  }, []);

  const renderHeadline = (headline) => {
    if (headline.specialLayout3Lines) {
      return (
        <div className="headline">
          <div>
            <span className="headline-text">{headline.main}</span>
          </div>
          <div>
            <span className="highlight-text">{headline.highlight}</span>
            <span className="end-text">{headline.end.line2}</span>
          </div>
          <div>
            <span className="end-text">{headline.end.line3}</span>
          </div>
        </div>
      );
    }

    if (headline.specialLayout) {
      return (
        <div className="headline">
          <div>
            <span className="headline-text">{headline.main}</span>
          </div>
          <div>
            <span className="headline-text">summer </span>
            <span className="highlight-text">{headline.highlight}</span>
            <span className="end-text">{headline.end}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="headline">
        <div>
          <span className="headline-text">{headline.main}</span>
        </div>
        <div>
          <span className="highlight-text">{headline.highlight}</span>
          <span className="end-text">{headline.end}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="landing-container">
      <div className="main-content">
        <div className={`headline-container ${fadeOut ? "fade" : ""}`}>
          {headlines[currentHeadline]}
        </div>

        <div className="subheadline">
          Spend less time studying and score higher for free.
        </div>

        <div className="sat-button">
          <button onClick={() => navigate("/sat")} className="cta-button">
            your 1600 starts here →
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-number">20+</div>
            <div className="stat-label">Analytic Types</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5000+</div>
            <div className="stat-label">SAT questions</div>
          </div>
        </div>
      </div>

      <section className="SAT-section">
        <div className="SAT-content">
          <h2 className="SAT-title">Improve your SAT score</h2>
          <p className="SAT-description">
            We provide you with the most recent SAT questions to help train you
            to get the score you want.
          </p>
          <a href="/sat" className="cta-button">
            try our tool →
          </a>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
