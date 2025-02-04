import { React, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './Components/NavBar'
import LandingPage from './LandingPage/LandingPage';
import LPFooter from './Components/Footer';
import FeedBackPage from './LandingPage/FeedBackPage/FeedBack'
import SatPage from './SatPage/SatPage'
import ECPage from './ECPage/ECPage'
import SignUpPage from './Authentication/SignUp/SignUp'
import Dashboard from './Dashboard/Dashboard'
import AboutUsPage from './AboutPage/AboutPage';
import LoginPage from './Authentication/Login/Login';

// Wrapper component to handle conditional NavBar rendering
const AppContent = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      {!isDashboard && <NavBar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/feedback" element={<FeedBackPage />} />
        <Route path="/sat" element={<SatPage />} />
        <Route path="/extracurricular" element={<ECPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/aboutPage" element={<AboutUsPage/>} />
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

const useAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-8C7GL4G017', {
        page_path: location.pathname,
      });
    }
  }, [location]);
};

function App() {
  useAnalytics();

  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
