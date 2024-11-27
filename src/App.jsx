import React from 'react'
import NavBar from './Components/NavBar'
import LandingPage from './LandingPage/LandingPage';
import LPFooter from './Components/Footer';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <NavBar/>
      <LandingPage/>
      <LPFooter/>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
