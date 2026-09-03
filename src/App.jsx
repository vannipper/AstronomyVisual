import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OrbitSim from './pages/OrbitSim';
import AngularSize from './pages/AngularSize';
import './App.css'; // This is the only local import we need here now

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/orbit" element={<OrbitSim />} />
      <Route path="/angular-size" element={<AngularSize />} />
    </Routes>
  );
}

export default App;
