import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ACWR from './pages/ACWR';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acwr" element={<ACWR />} />
      </Routes>
    </Router>
  );
}

export default App;