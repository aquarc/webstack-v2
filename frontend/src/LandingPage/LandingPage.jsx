import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import "./NewsletterSection/NewsLetterSection";
import analyticsImage from '../Assets/data-analytics.png';

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
          Spend less time studying and score higher for free.
        </div>

        <div className="sat-button">
          <button onClick={() => navigate("/sat")} className="cta-button">
            Practice SAT Questions →
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


      {/*

      <div className="info-mission">

        <div className="mission-statement">
          <div className="mission-title">
            <h1>Our Mission</h1>
          </div>
          <div className="mission-text">
            <p>
            We created Aquarc to simplify the journey of getting ready for college. From helping you 
            find the right SAT dates to discovering meaningful extracurricular activities, our aim is 
            to save you time, keep you organized, and reduce stress. Our main goal is straightforward: 
            to provide you with the tools you need, so you can focus on what truly matters to you during 
            this important time.
            </p>
          </div>
        </div>

        <div className="mission-statement">
          <div className="mission-title">
            <h1>Why Aquarc?</h1>
          </div>
          <div className="mission-text">
            <p>
            Preparing for college can feel overwhelming. Aquarc offers a way to make things easier and more manageable. 
            By bringing together the resources you need, like SAT schedules and ideas for extracurriculars, we help you 
            stay on track and feel less stressed. Think of Aquarc as a helpful guide designed to streamline the process, 
            allowing you to concentrate on your studies and your passions.
            </p>
          </div>
        </div>

        <div className="mission-statement">
          <div className="mission-title">
            <h1>Our Features</h1>
          </div>
          <div className="mission-text">
            <p>
            Aquarc is built to make the college prep journey smarter and easier. We offer tools to expedite your journey to a perfect 
            SAT score and help you find extracurriculars that are the perfect fit for you. We're adding AI-powered tools that generate 
            practice questions to help you learn faster, find personalized clubs and summer opportunities that match your interests, 
            and keep all your tasks organized in one place. Our goal is simple: use AI to guide you, support you, and let you focus 
            on what really matters.
            </p>
          </div>
        </div>
      </div>

      <div className="info-analytics">
        <div
          className={`analytics ${isInView ? "animate" : ""}`}
          ref={analyticsRef}
        >
          <div className="analytics-image">
            <img src={analyticsImage} alt="Analytics preview" />
          </div>
          <div className="analytics-content">
            <h1>Analytics</h1>
            <p>
            At Aquarc, we believe that understanding your progress is key to staying motivated and achieving your goals. That’s why 
            we’ve integrated powerful analytics to give you a clear view of your journey. Whether it’s tracking your practice test 
            scores, identifying patterns in your study habits, or seeing how your extracurriculars align with your college goals, 
            our insights are designed to help you make smarter decisions. With real-time data at your fingertips, you can pinpoint 
            areas to improve and celebrate your successes along the way. Our goal is to empower you with the information you need 
            to stay organized, stay motivated, and keep moving forward with confidence.
            </p>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export default LandingPage;
