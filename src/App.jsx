import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OrbitSim from './pages/OrbitSim';
import NightSky from './pages/NightSky';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/orbit" element={<OrbitSim />} />
      <Route path="/night-sky" element={<NightSky />} />
    </Routes>
  );
}

export default App;
