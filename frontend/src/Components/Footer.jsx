import React from 'react';
import './Footer.css';
import youtubeIcon from '../Assets/youtube.png';
import instaIcon from '../Assets/instagram.png';
import linkedinIcon from '../Assets/linkedin.png';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-grid">
        {/* Left section */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src="aquLogo.png" alt="Aquarc Logo" className="logo-icon"/>
            <span>Aquarc</span>
          </div>
          <p className="footer-description">
            Making high school navigation easier with personalized SAT prep, extracurricular tracking, and educational resources.
          </p>
        </div>

        {/* Center section */}
        <div className="footer-center">
          <h3 className="footer-heading">Contact Us</h3>
          <p className="contact-info">
            <a href="mailto:contact@aquarc.org" className="contact-link">contact@aquarc.org</a>
          </p>
        </div>

        {/* Right section */}
        <div className="footer-right">
          <div className="social-icons">
            <a href="https://www.youtube.com/@aquarc_co" target="_blank" rel="noopener noreferrer">
              <img src={youtubeIcon} alt="YouTube"/>
            </a>
            <a href="https://www.instagram.com/_aquarc_/" target="_blank" rel="noopener noreferrer">
              <img src={instaIcon} alt="Instagram"/>
            </a>
            <a href="https://www.linkedin.com/company/aquarc/" target="_blank" rel="noopener noreferrer">
              <img src={linkedinIcon} alt="LinkedIn"/>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;