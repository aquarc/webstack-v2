import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import "./NewsletterSection/NewsLetterSection";
import analyticsImage from '../Assets/data-analytics.png';
import askImage from '../Assets/ask-ai.png';
import targetImage from '../Assets/target.png';
import understandImage from '../Assets/understand.png';
import approachImage from '../Assets/approach.png';
import grindImage from '../Assets/grind.png';

// Headlines for the landing page
const headlines = {
  0: (
    <div className="headline">
      <span className="highlight-text">Start scoring higher</span>
      <br />
      <span className="headline-text">in 2 clicks.</span>
    </div>
  ),
  1: (
    <div className="headline">
      <span className="highlight-text">Your mistakes</span>
      <br />
      <span className="headline-text">in clear sight.</span>
    </div>
  ),
  2: (
    <div className="headline">
      <span className="highlight-text">Learn with</span>
      <br />
      <span className="headline-text">AI-powered feedback.</span>
    </div>
  ),
};

const LandingPage = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [isInView, setIsInView] = useState(false); // Track if the .analytics section is in view
  const analyticsRef = useRef(null); // Reference to the analytics section
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

  // Use IntersectionObserver to detect when the .analytics section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true); // Trigger animation when the section is in view
          } else {
            setIsInView(false); // Reset animation when the section is out of view
          }
        });
      },
      { threshold: 0.5 } // Trigger when at least 50% of the section is in view
    );

    if (analyticsRef.current) {
      observer.observe(analyticsRef.current);
    }

    return () => {
      if (analyticsRef.current) {
        observer.unobserve(analyticsRef.current);
      }
    };
  }, []);

  return (
    <div className="landing-container">
      <div className="main-content">
        <div className={`headline-container ${fadeOut ? "fade" : ""}`}>
          {headlines[`${currentHeadline}`]}
        </div>

        <div className="subheadline">
          You don't need to be tired and overwhelmed to succeed. Aquarc is how that happens.
        </div>

        <div className="sat-button">
          <button onClick={() => navigate("/sat")} className="cta-button">
            Start Your Streak →
          </button>
          <button onClick={() => navigate("/sat")} className="cta-button-outline">
            Practice For Free
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">College Board Sourced</div>
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

<div className="features-container">
        {/* Target Weak Points Section */}
        <div className="feature-section">
          <div className="feature-card">
            <div className="feature-text">
              <h2>Target your weak points</h2>
              <p>Grind any specific skill from 27 categories with precision targeting that adapts to your learning patterns.</p>
            </div>
            <div className="feature-visual">
              <div className="feature-image-wrapper">
                <img src={targetImage} alt="Skill categories interface" />
              </div>
            </div>
          </div>
        </div>

        <div className="feature-section">
          <div className="feature-card reverse-layout">
            <div className="feature-text">
              <h2>Help when you need it</h2>
              <p>AI assistance available instantly after you get a question wrong. Get personalized explanations that match your thinking style.</p>
            </div>
            <div className="feature-visual">
              <div className="feature-image-wrapper">
                <img src={askImage} alt="Ask AI Button" />
              </div>
            </div>
          </div>
        </div>

        {/* Understand Mistakes Section */}
        <div className="feature-section">
          <div className="feature-card">
            <div className="feature-text">
              <h2>Understand what went wrong</h2>
              <p>Contrast your thinking process with multiple solution approaches to pinpoint exactly where errors occurred and why.</p>
            </div>
            <div className="feature-visual">
              <div className="feature-image-wrapper">
                <img src={understandImage} alt="Mistake analysis interface" />
              </div>
            </div>
          </div>
        </div>

        {/* Multiple Approaches Section */}
        <div className="feature-section">
          <div className="feature-card reverse-layout">
            <div className="feature-text">
              <h2>Master every method</h2>
              <p>Learn all possible solution paths - not just the official answer. Build flexibility and confidence with diverse problem-solving techniques.</p>
            </div>
            <div className="feature-visual">
              <div className="feature-image-wrapper">
                <img src={approachImage} alt="Multiple solution methods example" />
              </div>
            </div>
          </div>
        </div>

        {/* Grind Similar Questions Section */}
        <div className="feature-section">
          <div className="feature-card">
            <div className="feature-text">
              <h2>Grind it out</h2>
              <p>Practice similar questions to the ones you missed using AI-powered recommendations that evolve based on your progress and performance patterns.</p>
            </div>
            <div className="feature-visual">
              <div className="feature-image-wrapper">
                <img src={grindImage} alt="Question generator interface" />
              </div>
            </div>
          </div>
        </div>
      </div>
       <section className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="how-it-works-title">We didn't just study the SAT. We decoded it.</h2>
          <p className="how-it-works-subtitle">There should be an efficient way to study without grinding 3 hour practice tests every day of your life.</p>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">📋</div>
              <h3 className="step-title">Choose Your Struggles</h3>
              <p className="step-description">Practice only what you need to learn.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">🔎</div>
              <h3 className="step-title">Press Search Questions</h3>
              <p className="step-description">We'll find the best questions for you.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">⚡️</div>
              <h3 className="step-title">Practice</h3>
              <p className="step-description">Practice like a test or question by question, your choice. </p>
            </div>
          </div>
        </div>
      </section>

      


      
    </div>
  );
};

export default LandingPage;
