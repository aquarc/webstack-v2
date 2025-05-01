import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import './NavBar.css';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navbarClass = `navbar ${isScrolled ? 'scrolled' : ''}`;
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'SAT Prep', path: '/sat' },
    { name: 'Notes', path: '/notes' },
    { name: 'About Us', path: '/aboutPage' },
    { name: 'Feedback', path: '/feedback' }
  ];

  const isActive = (path) => location.pathname === path;

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    visible: {
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      y: -20,
      height: 0,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05, 
      color: '#6366f1',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const logoVariants = {
    hover: { 
      scale: 1.1,
      transition: { duration: 0.3, yoyo: Infinity, ease: 'easeInOut' }
    }
  };

  return (
    <motion.nav 
      className={navbarClass}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="navbar-container">
        <motion.div 
          className="logo-container"
          whileHover="hover"
          variants={logoVariants}
        >
          <Link to="/" className="logo-link">
            <img src="darkquarc.png" alt="Aquarc Logo" className="logo" />
            <span className="logo-text">Aquarc</span>
          </Link>
        </motion.div>

        <div className="nav-links-desktop">
          {navItems.map((item) => (
            <motion.div
              key={item.name}
              className="nav-item-container"
              whileHover="hover"
              whileTap="tap"
              variants={linkVariants}
            >
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div 
                    className="active-indicator"
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="auth-buttons-desktop">
          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={linkVariants}
          >
            <Link to="/login" className="login-button">
              Log In
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/signup" className="signup-button">
              Sign Up
            </Link>
          </motion.div>
        </div>

        <motion.button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mobile-nav-links">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="mobile-auth-buttons">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/login" className="mobile-login-button">
                  Log In
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/signup" className="mobile-signup-button">
                  Sign Up
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;