import { React, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import AuthRedirect from './Components/AuthRedirect';
import Cookie from 'js-cookie';
import Overview from './Dashboard/Overview';
import Analytics from './Dashboard/Analytics';
import EcFinder from './Dashboard/EcFinder';
import SatPrep from './Dashboard/SatPrep';

// Wrapper component to handle conditional NavBar rendering
const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GTAG, {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return (
    <>
      {/* Routes that will not render the nav bar */}
      {!location.pathname.startsWith('/overview') && !location.pathname.startsWith('/analytics') 
        && !location.pathname.startsWith('/ec-finder') && !location.pathname.startsWith('/sat-prep')
        && location.pathname !== '/sat' && <NavBar
      />}    

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/feedback" element={<FeedBackPage />} />
        <Route path="/sat" element={<SatPage />} />
        <Route path="/extracurricular" element={<ECPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/aboutPage" element={<AboutUsPage/>} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard routes - nested structure */}
        <Route path="/" element={<Dashboard />}>
          <Route path="dashboard" element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ec-finder" element={<EcFinder />} />
          <Route path="sat-prep" element={<SatPrep />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthRedirect />
          <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
