import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './Components/NavBar'
import LandingPage from './LandingPage/LandingPage';
import LPFooter from './Components/Footer';
import FeedBackPage from './LandingPage/FeedBackPage/FeedBack'
import SatPage from './SatPage/SatPage'
import ECPage from './ECPage/ECPage'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar/>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feedback" element={<FeedBackPage />} />
          <Route path="/sat" element={<SatPage />} />
          <Route path="/extracurricular" element={<ECPage/>} />
        </Routes>
        {/* Use location to conditionally render footer */}
        <Routes>
          {/* Only render footer for these routes */}
          <Route path="/" element={<LPFooter />} />
          <Route path="/feedback" element={<LPFooter />} />
          <Route path="/extracurricular" element={<LPFooter />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;