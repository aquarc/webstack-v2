import React from 'react';
import { Youtube, Instagram, Linkedin, Mail, ChevronRight } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-gradient"></div>
      
      <div className="footer-grid">
        {/* Left section */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src="darkquarc.png" alt="Aquarc Logo" className="logo-icon"/>
            <span className='brand-name'>Aquarc</span>
          </div>
          
          <p className="footer-description">
            Making high school navigation easier with personalized SAT prep.
          </p>
          
          <div className="footer-links">
            <a href="/sat" className="footer-link">
              <ChevronRight size={16} className="link-icon" />
              <span>SAT Practice</span>
            </a>
          </div>
        </div>

        {/* Center section */}
        <div className="footer-center">
          <h3 className="footer-heading">
            Contact Us
          </h3>
          
          <div className="contact-item">
            <Mail size={18} className="contact-icon" />
            <a href="mailto:contact@aquarc.org" className="contact-link">
              contact@aquarc.org
            </a>
          </div>
        </div>

        {/* Right section */}
        <div className="footer-right">
          <div className="follow-section">
            <h3 className="footer-heading">
              Follow Us
            </h3>
            
            <div className="social-icons">
              <a 
                href="https://www.youtube.com/@aquarc_co" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon-container"
              >
                <Youtube className="social-icon" size={24} />
                <span className="social-label">YouTube</span>
              </a>
              
              <a 
                href="https://www.instagram.com/_aquarc_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon-container"
              >
                <Instagram className="social-icon" size={24} />
                <span className="social-label">Instagram</span>
              </a>
              
              <a 
                href="https://www.linkedin.com/company/aquarc/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon-container"
              >
                <Linkedin className="social-icon" size={24} />
                <span className="social-label">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="copyright-container">
        <div className="copyright">
          &copy; {new Date().getFullYear()} Aquarc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;