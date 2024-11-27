import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './Components/NavBar'
import LandingPage from './LandingPage/LandingPage';
import LPFooter from './Components/Footer';
import FeedBackPage from './LandingPage/FeedBackPage/FeedBack'
import SatPage from './SatPage/SatPage'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar/>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feedback" element={<FeedBackPage />} />
          <Route path="/sat" element={<SatPage />} />

          {/* Add other routes as needed */}
        </Routes>
        <LPFooter/>
      </BrowserRouter>
    </div>
  );
}

export default App;