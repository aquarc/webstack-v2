import { React, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import NavBar from "./Components/NavBar";
import LandingPage from "./LandingPage/LandingPage";
import LPFooter from "./Components/Footer";
import FeedBackPage from "./LandingPage/FeedBackPage/FeedBack";
import SatPage from "./SatPage/SatPage";
import ECPage from "./ECPage/ECPage";
import ApPage from "./ApPage/ApPage";
import SignUpPage from "./Authentication/SignUp/SignUp";
import AboutUsPage from "./AboutPage/AboutPage";
import LoginPage from "./Authentication/Login/Login";
import AuthRedirect from "./Components/AuthRedirect";

import ReactGA from 'react-ga4';

// Initialize GA
if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize(process.env.REACT_APP_GTAG);
}

export function sendClickEvent(eventName, eventCategory = "") {
  if (!window.gtag) return;

  window.gtag("event", "click", {
    event_label: eventName,
    event_category: eventCategory,
  });
}

// Global click handler
const trackInteraction = (event) => {
  if (process.env.NODE_ENV !== 'production') return;

  const target = event.target.closest('button,a[href],.nav-item,[data-track]');
  
  if (target) {
    const category = target.dataset.category || 'General';
    const action = target.textContent.trim() || target.href || 'Unknown Action';
    const label = target.dataset.label || window.location.pathname;

    ReactGA.event({
      category,
      action: action.substring(0, 150), // Truncate to 150 chars
      label,
    });
  }
};

// Wrapper component to handle conditional NavBar rendering
const AppContent = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname
      });
    }
  }, [location]);

  return (
    <>
      {/* Routes that will not render the nav bar */}
      {location.pathname !== "/sat" && <NavBar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/notes" element={<ApPage />} />
        <Route path="/feedback" element={<FeedBackPage />} />
        <Route path="/sat" element={<SatPage />} />
        <Route path="/extracurricular" element={<ECPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/aboutPage" element={<AboutUsPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      {/* Use location to conditionally render footer */}
      <Routes>
        {/* Only render footer for these routes */}
        <Route path="/" element={<LPFooter />} />
        <Route path="/feedback" element={<LPFooter />} />
        <Route path="/extracurricular" element={<LPFooter />} />
        <Route path="/aboutPage" element={<LPFooter />} />
      </Routes>
    </>
  );
};

const GlobalClickTracker = ({ children }) => {
  useEffect(() => {
    document.addEventListener('click', trackInteraction, true); // Use capture phase
    return () => document.removeEventListener('click', trackInteraction, true);
  }, []);

  return children;
};

function App() {
  return (
    <div className="App">
      <GlobalClickTracker>
        <BrowserRouter>
          <AuthRedirect />
          <AppContent />
        </BrowserRouter>
      </GlobalClickTracker>
    </div>
  );
}

export default App;
