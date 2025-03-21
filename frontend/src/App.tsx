import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ACWR from './pages/ACWR';
import PacePredictor from './pages/PacePredictor';
import RacePlanner from './pages/RacePlanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acwr" element={<ACWR />} />
        <Route path="/pace-predictor" element={<PacePredictor />} />
        <Route path="/race-planner" element={<RacePlanner />} />
      </Routes>
    </Router>
  );
}

export default App;