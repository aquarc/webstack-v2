import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import AboutUsPage from '../AboutPage/AboutPage';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
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
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src="/aquLogo.png" alt="Aquarc Logo" className="logo-image" />
          <span>Aquarc</span>
        </div>

        <div className="nav-links">
          <Link to="/sat" className="link">SAT</Link>
          {/*<Link to="/extracurricular" className="link">Extracurriculars</Link> */}
          <a href="https://aquarc.beehiiv.com" className="link">Newsletter</a>
          <Link to="/feedback" className="link">Feedback</Link>
          {/*<Link to="/dashboard" className="link">Dashboard</Link>*/}
          <Link to="/aboutPage" className="link">About Us</Link>
        </div>

        <Link to="/signup" className="button">
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