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

// Feature slideshow content
const slideshowFeatures = [
  {
    id: 1,
    title: "Target your weak points",
    description: "Grind any specific skill from 27 categories.",
    color: "#3b82f6"
  },
  {
    id: 2,
    title: "Help when you need it",
    description: "AI assistance available after you get a question wrong.",
    color: "#6366f1"
  },
  {
    id: 3,
    title: "Understand what went wrong",
    description: "Contrast your thinking process with the multiple others to pinpoint error.",
    color: "#8b5cf6"
  },
  {
    id: 4,
    title: "Master every method",
    description: "Learn all possible solution paths - not just the official answer.",
    color: "#ec4899"
  },
  {
    id: 5,
    title: "Grind it out",
    description: "Practice similar questions to the ones you missed using AI-powered recommendations.",
    color: "#f43f5e"
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    text: "Aquarc helped me improve my SAT score by 150 points in just a month of focused practice.",
    name: "Sarah L.",
    score: "1480",
    improvement: "+150"
  },
  {
    id: 2,
    text: "The AI feedback pointed out patterns in my mistakes I never would have noticed myself.",
    name: "Michael T.",
    score: "1520",
    improvement: "+200"
  },
  {
    id: 3,
    text: "Being able to focus on specific weak areas was a game-changer for my study strategy.",
    name: "Jamie K.",
    score: "1390",
    improvement: "+110"
  }
];

const LandingPage = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
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

  const [slideshowRef, slideshowInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  const [testimonialsRef, testimonialsInView] = useInView({
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

  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideshowFeatures.length);
    }, 5000);

    return () => clearInterval(slideshowInterval);
  }, []);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(testimonialInterval);
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

  const slideVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.5, ease: "easeIn" }
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
            className="subheadline"
            variants={itemVariant}
          >
            Designed by students, for students. The most comprehensive SAT prep platform that adapts to your learning style.
          </motion.div>

          <motion.div 
            className="cta-container"
            variants={itemVariant}
          >
            <motion.button 
              onClick={() => navigate("/sat")} 
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Practice SAT Questions →
            </motion.button>
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

      {/* New Feature Slideshow Section */}
      <motion.section 
        className="slideshow-section"
        ref={slideshowRef}
        initial={{ opacity: 0 }}
        animate={slideshowInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="slideshow-container"
          initial={{ y: 50, opacity: 0 }}
          animate={slideshowInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="slideshow-heading">
            <h2>How Aquarc Transforms Your SAT Prep</h2>
            <p>Our tools are designed to accelerate your learning and focus on what matters most</p>
          </div>
          
          <div className="slideshow-content">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeSlide}
                className="slide"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ borderColor: slideshowFeatures[activeSlide].color }}
              >
                <div className="slide-image">
                  <img src={slideshowFeatures[activeSlide].image} alt={slideshowFeatures[activeSlide].title} />
                </div>
                <div className="slide-text">
                  <h3 style={{ color: slideshowFeatures[activeSlide].color }}>{slideshowFeatures[activeSlide].title}</h3>
                  <p>{slideshowFeatures[activeSlide].description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="slideshow-controls">
              {slideshowFeatures.map((feature, index) => (
                <div 
                  key={feature.id}
                  className={`control-dot ${index === activeSlide ? 'active' : ''}`}
                  style={{ backgroundColor: index === activeSlide ? feature.color : 'rgba(255, 255, 255, 0.3)' }}
                  onClick={() => setActiveSlide(index)}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

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
          <motion.button 
            onClick={() => navigate("/sat")}
            className="cta-button"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.98 }}
          >
            Try our tools →
          </motion.button>
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

      {/* Testimonials Section */}
      <motion.section 
        className="testimonials-section"
        ref={testimonialsRef}
        initial={{ opacity: 0 }}
        animate={testimonialsInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="testimonials-heading">
          <h2>Success Stories</h2>
          <p>See how students like you are improving their scores with Aquarc</p>
        </div>

        <div className="testimonials-slider">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTestimonial}
              className="testimonial-card"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">{testimonials[activeTestimonial].text}</p>
              <div className="testimonial-author">{testimonials[activeTestimonial].name}</div>
              <div className="testimonial-stats">
                <div className="score-badge">
                  <span>Score: </span>
                  <span className="highlight-text">{testimonials[activeTestimonial].score}</span>
                </div>
                <div className="improvement-badge">
                  <span>{testimonials[activeTestimonial].improvement}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="testimonial-dots">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`testimonial-dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
              ></div>
            ))}
          </div>
        </div>
      </motion.section>

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

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h3>Aquarc</h3>
            <p>Make test prep smarter, not harder.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Learn</h4>
              <ul>
                <li><a href="/sat">SAT Prep</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/resources">Resources</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="/terms">Terms</a></li>
                <li><a href="/privacy">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Aquarc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;