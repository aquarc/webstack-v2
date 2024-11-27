import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.mobile-drawer') && !e.target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div style={{ position: 'relative' }}>
      <nav className="nav">
        <div className="logo">
          <img src="/aquLogo.png" alt="Aquarc Logo" className="logo-image" />
          <span>Aquarc</span>
        </div>
        
        <div className="nav-links">
          <Link to="/sat" className="link">SAT</Link>
          <Link to="/static/ec/ec.html" className="link">Extracurriculars</Link>
          <a href="https://aquarc.beehiiv.com" className="link">Newsletter</a>
          <Link to="/feedback" className="link">Feedback</Link>
        </div>
        
        <Link to="/sat" className="button">
          Get Started →
        </Link>

        <button 
          className="menu-toggle"
          onClick={toggleMenu}
        >
          <span className={`menu-line top ${isMenuOpen ? 'open' : ''}`} />
          <span className={`menu-line middle ${isMenuOpen ? 'open' : ''}`} />
          <span className={`menu-line bottom ${isMenuOpen ? 'open' : ''}`} />
        </button>
      </nav>

      <div className={`mobile-drawer ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="mobile-link-container">
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/sat" className="mobile-link">SAT</Link>
          <Link to="/static/ec/ec.html" className="mobile-link">Extracurriculars</Link>
          <a href="https://aquarc.beehiiv.com" className="mobile-link">Newsletter</a>
          <Link to="/feedback" className="mobile-link">Feedback</Link>
          <Link to="/sat" className="button">
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;