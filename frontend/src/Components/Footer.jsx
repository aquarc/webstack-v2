import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Linkedin, Mail, ChevronRight } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const linkVariants = {
    initial: { x: 0 },
    hover: { 
      x: 5, 
      transition: { duration: 0.2 } 
    }
  };

  const socialVariants = {
    initial: { y: 0 },
    hover: { 
      y: -5, 
      transition: { duration: 0.2, yoyo: Infinity, ease: "easeInOut" } 
    }
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <footer className="footer-container">
      <div className="footer-gradient"></div>
      
      <motion.div 
        className="footer-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        {/* Left section */}
        <motion.div 
          className="footer-left"
          variants={itemVariants}
        >
          <motion.div 
            className="footer-logo"
            variants={logoVariants}
            whileHover="hover"
          >
            <img src="darkquarc.png" alt="Aquarc Logo" className="logo-icon"/>
            <span className='brand-name'>Aquarc</span>
          </motion.div>
          
          <motion.p 
            className="footer-description"
            variants={itemVariants}
          >
            Making high school navigation easier with personalized SAT prep, extracurricular tracking, and educational resources.
          </motion.p>
          
          <motion.div 
            className="footer-links"
            variants={itemVariants}
          >
            <motion.a 
              href="/sat" 
              className="footer-link"
              variants={linkVariants}
              whileHover="hover"
            >
              <ChevronRight size={16} className="link-icon" />
              <span>SAT Practice</span>
            </motion.a>
            
            <motion.a 
              href="/extracurricular" 
              className="footer-link"
              variants={linkVariants}
              whileHover="hover"
            >
              <ChevronRight size={16} className="link-icon" />
              <span>Extracurriculars</span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Center section */}
        <motion.div 
          className="footer-center"
          variants={itemVariants}
        >
          <motion.h3 
            className="footer-heading"
            variants={itemVariants}
          >
            Contact Us
          </motion.h3>
          
          <motion.div 
            className="contact-item"
            variants={itemVariants}
          >
            <Mail size={18} className="contact-icon" />
            <a href="mailto:contact@aquarc.org" className="contact-link">
              contact@aquarc.org
            </a>
          </motion.div>
        </motion.div>

        {/* Right section */}
        <motion.div 
          className="footer-right"
          variants={itemVariants}
        >
          <motion.div className="follow-section">
            <motion.h3 
              className="footer-heading"
              variants={itemVariants}
            >
              Follow Us
            </motion.h3>
            
            <motion.div 
              className="social-icons"
              variants={itemVariants}
            >
              <motion.a 
                href="https://www.youtube.com/@aquarc_co" 
                target="_blank" 
                rel="noopener noreferrer"
                variants={socialVariants}
                whileHover="hover"
                className="social-icon-container"
              >
                <Youtube className="social-icon" size={24} />
                <span className="social-label">YouTube</span>
              </motion.a>
              
              <motion.a 
                href="https://www.instagram.com/_aquarc_/" 
                target="_blank" 
                rel="noopener noreferrer"
                variants={socialVariants}
                whileHover="hover"
                className="social-icon-container"
              >
                <Instagram className="social-icon" size={24} />
                <span className="social-label">Instagram</span>
              </motion.a>
              
              <motion.a 
                href="https://www.linkedin.com/company/aquarc/" 
                target="_blank" 
                rel="noopener noreferrer"
                variants={socialVariants}
                whileHover="hover"
                className="social-icon-container"
              >
                <Linkedin className="social-icon" size={24} />
                <span className="social-label">LinkedIn</span>
              </motion.a>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="newsletter-signup"
            variants={itemVariants}
          >
            <h4 className="newsletter-heading">Join our newsletter</h4>
            <p className="newsletter-desc">Stay updated with study tips and resources</p>
            <a href="https://aquarc.beehiiv.com" className="newsletter-button">
              Subscribe
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="copyright-container"
        variants={itemVariants}
      >
        <div className="copyright">
          &copy; {new Date().getFullYear()} Aquarc. All rights reserved.
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;