import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';
import PomodoroTimer from '../SatPage/PomodoroTimer';
import { ChevronLeft, Search } from 'lucide-react'; // Import back icon

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if current page is SAT page
  const isSatPage = location.pathname.startsWith('/sat');

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Keep existing useEffect and other handlers

  return (
    <div style={{ position: 'relative' }}>
      <nav className={`nav`}>
        <div className="logo" onClick={isSatPage ? handleBack : () => navigate('/')}
          style={{ cursor: 'pointer' }}>
          <img src="/darkquarc.png" alt="Aquarc Logo" className="logo-image" />
          <span className="brand-name">aquarc</span>
        </div>

        <div className="nav-links">
          <Link to="/sat" className="link">SAT</Link>
          {/*<a href="https://aquarc.beehiiv.com" className="link">Newsletter</a>*/}
          <Link to="/feedback" className="link">Feedback</Link>
          <Link to="/feedback" className="link">Blog</Link>
          {/*<Link to="/aboutPage" className="link">About Us</Link>*/}
        </div>

        <Link to="/signup" className="button">
          Your 1600 starts here →
        </Link>

        {/* Mobile menu remains the same */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`menu-line top ${isMenuOpen ? 'open' : ''}`} />
          <span className={`menu-line middle ${isMenuOpen ? 'open' : ''}`} />
          <span className={`menu-line bottom ${isMenuOpen ? 'open' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer - add SAT page check */}
      <div className={`mobile-drawer ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="mobile-link-container">
          <Link to="/sat" className="link">SAT</Link>
          {/*<a href="https://aquarc.beehiiv.com" className="link">Newsletter</a>*/}
          <Link to="/feedback" className="link">Feedback</Link>
          <Link to="/feedback" className="link">Blog</Link>

          {/*<Link to="/aboutPage" className="link">About Us</Link>*/}
          <Link to="/signup" className="button">
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
