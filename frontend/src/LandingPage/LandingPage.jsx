import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./LandingPage.css";
import analyticsImage from "../Assets/data-analytics.png";

// Headlines for the landing page
const headlines = {
  0: (
    <>
      <span className="highlight-text">Start scoring higher</span>
      <br />
      <span className="headline-text">in 2 clicks.</span>
    </>
  ),
  1: (
    <>
      <span className="highlight-text">Your mistakes</span>
      <br />
      <span className="headline-text">in clear sight.</span>
    </>
  ),
  2: (
    <>
      <span className="highlight-text">Learn with</span>
      <br />
      <span className="headline-text">AI-powered feedback.</span>
    </>
  ),
};

const LandingPage = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const navigate = useNavigate();
  
  // Using react-intersection-observer for scroll animations
  const [statsRef, statsInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });
  
  const [missionRef, missionInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });
  
  const [analyticsRef, analyticsInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });
  
  const [satSectionRef, satSectionInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  useEffect(() => {
    const headlineKeys = Object.keys(headlines);
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlineKeys.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fadeVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -50,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="landing-container">
      <div className="hero-backdrop">
        <div className="hero-gradient"></div>
      </div>
      
      <div className="main-content">
        <motion.div 
          className="headline-container"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeadline}
              className="headline"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {headlines[`${currentHeadline}`]}
            </motion.div>
          </AnimatePresence>

          <motion.div 
            className="sat-button"
            variants={itemVariant}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <button onClick={() => navigate("/sat")} className="cta-button">
              Practice SAT Questions →
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="stats"
          ref={statsRef}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={staggerChildren}
        >
          <motion.div className="stat-item" variants={itemVariant}>
            <div className="stat-number">20+</div>
            <div className="stat-label">Analytic Types</div>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariant}>
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Users</div>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariant}>
            <div className="stat-number">5000+</div>
            <div className="stat-label">SAT questions</div>
          </motion.div>
        </motion.div>
      </div>

      <motion.section 
        className="SAT-section"
        ref={satSectionRef}
        initial={{ opacity: 0 }}
        animate={satSectionInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="SAT-content"
          initial={{ y: 50, opacity: 0 }}
          animate={satSectionInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="SAT-title">Improve your SAT score</h2>
          <p className="SAT-description">
            We provide you with the most recent SAT questions to help train you
            to get the score you want.
          </p>
          <motion.a 
            href="/sat" 
            className="cta-button"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.98 }}
          >
            Try our tools →
          </motion.a>
        </motion.div>
      </motion.section>

      <motion.div 
        className="info-mission"
        ref={missionRef}
        initial="hidden"
        animate={missionInView ? "visible" : "hidden"}
        variants={staggerChildren}
      >
        <motion.div 
          className="mission-statement"
          variants={itemVariant}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
        >
          <div className="mission-title">
            <h1>Our Mission</h1>
          </div>
          <div className="mission-text">
            <p>
            We created Aquarc to simplify college preparation. We help with SAT dates, 
            extracurriculars, and organization to save time and reduce stress.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="mission-statement"
          variants={itemVariant}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
        >
          <div className="mission-title">
            <h1>Why Aquarc?</h1>
          </div>
          <div className="mission-text">
            <p>
            College prep can be overwhelming. Aquarc makes it manageable by consolidating
             resources to help you stay on track and feel less stressed.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="mission-statement"
          variants={itemVariant}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
        >
          <div className="mission-title">
            <h1>Our Features</h1>
          </div>
          <div className="mission-text">
            <p>
            Aquarc makes college prep smarter with tools for achieving ideal SAT scores 
            and finding suitable extracurriculars using AI-powered solutions.
            </p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="info-analytics"
        ref={analyticsRef}
        initial={{ opacity: 0, y: 100 }}
        animate={analyticsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="analytics"
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div className="analytics-image">
            <motion.img 
              src={analyticsImage} 
              alt="Analytics preview"
              whileHover={{ y: -5, transition: { duration: 0.2, yoyo: Infinity } }}
            />
          </div>
          <div className="analytics-content">
            <h1>Analytics</h1>
            <p>
            We believe tracking progress motivates success. Our analytics provide real-time 
            data to identify improvement areas and celebrate achievements.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;