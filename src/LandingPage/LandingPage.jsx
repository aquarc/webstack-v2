import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import './NewsletterSection/NewsLetterSection'
import NewsImage from '../Assets/news.jpg'
import NewsletterSection from './NewsletterSection/NewsLetterSection';
import ExtracurricularSection from './ECSection/ECSection';

const headlines = [
  {
    main: 'better SAT ',
    highlight: '2 clicks ',
    end: ' away.'
  },
  {
    main: 'find your dream ',
    highlight: 'programs',
    end: '.',
    specialLayout: true
  },
  {
    main: 'get your',
    highlight: 'internships',
    end: {
      line2: ' weekly,',
      line3: 'for free.'
    },
    specialLayout3Lines: true
  },
  {
    main: 'make the ',
    highlight: 'most ',
    end: ' of high school.'
  }
];

const LandingPage = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const interval = setInterval(() => {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % headlines.length);
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
        <div className={`headline-container ${fadeOut ? 'fade' : ''}`}>
          {renderHeadline(headlines[currentHeadline])}
        </div>

        <div className="subheadline">
          navigating high school has
          <br />
          never been easier.
        </div>

        <div className="sat-button">
          <button
            onClick={() => navigate('/sat')}
            className="cta-button"
          >
            your 1600 starts here →
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-number">5000+</div>
            <div className="stat-label">SAT questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">$3.7M+</div>
            <div className="stat-label">in scholarships</div>
          </div>
        </div>
      </div>

      <section className="SAT-section">
          <div className="SAT-content">
            <h2 className="SAT-title">Improve your SAT score</h2>
            <p className="SAT-description">
              we provide you with the most recent SAT questions to help train you to get the score you want.
            </p>
            <a href="/sat" className="cta-button">try our tool →</a>
          </div>
        </section>
        <NewsletterSection/>
        <ExtracurricularSection/>

    </div>

  );
};

export default LandingPage;