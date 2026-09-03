import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './OrbitSim.css';

function OrbitSim() {
  const canvasRef = useRef(null);
  const [fuel, setFuel] = useState(100);
  const [distance, setDistance] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const handleResetRef = useRef(null);

  const gameStateRef = useRef({
    sun: { x: 0, y: 0, mass: 5000, radius: 50 },
    planets: [
      {
        x: 600,
        y: 0,
        vx: 0,
        vy: 0.913,
        mass: 200,
        radius: 35,
        color: '#3b82f6'
      },
      {
        x: 1100,
        y: 0,
        vx: 0,
        vy: 0.673,
        mass: 160,
        radius: 28,
        color: '#8b5cf6'
      },
      {
        x: 1600,
        y: 0,
        vx: 0,
        vy: 0.559,
        mass: 140,
        radius: 22,
        color: '#ec4899'
      },
    ],
    rocket: {
      x: 600,
      y: -150,
      vx: 0.8,
      vy: 0,
      angle: 0,
      thrust: 0.08,
      fuel: 100,
      trail: []
    },
    camera: { x: 0, y: 0 },
    mouseX: 0,
    mouseY: 0,
    keys: {}
  });

  const handleReset = () => {
    const state = gameStateRef.current;
    state.rocket.x = 600;
    state.rocket.y = -150;
    state.rocket.vx = 0.8;
    state.rocket.vy = 0;
    state.rocket.angle = 0;
    state.rocket.fuel = 100;
    state.rocket.trail = [];
    setFuel(100);
    setDistance(0);
  };

  // Store handleReset in ref so event handlers can access latest version
  handleResetRef.current = handleReset;

  useEffect(() => {
    if (showInstructions) {
      return; // Don't start game loop until instructions are dismissed
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 150;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler - update rocket angle
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      state.mouseX = e.clientX - rect.left;
      state.mouseY = e.clientY - rect.top;

      // Convert to world coordinates
      const worldMouseX = state.mouseX - canvas.width / 2 + state.camera.x;
      const worldMouseY = state.mouseY - canvas.height / 2 + state.camera.y;

      // Calculate angle to mouse
      const dx = worldMouseX - state.rocket.x;
      const dy = worldMouseY - state.rocket.y;
      state.rocket.angle = Math.atan2(dy, dx);
    };

    // Click handler - thrust
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left click
        state.keys['mouseDown'] = true;
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) { // Left click
        state.keys['mouseDown'] = false;
      }
    };

    // Keyboard handlers
    const handleKeyDown = (e) => {
      state.keys[e.key] = true;

      // Reset on 'R' key
      if (e.key === 'r' || e.key === 'R') {
        if (handleResetRef.current) {
          handleResetRef.current();
        }
      }
    };

    const handleKeyUp = (e) => {
      state.keys[e.key] = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Physics and rendering loop
    const gameLoop = () => {
      // Update planets with real gravity from sun ONLY
      state.planets.forEach(planet => {
        let dx = state.sun.x - planet.x;
        let dy = state.sun.y - planet.y;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        let force = (state.sun.mass) / distSq;
        planet.vx += (dx / dist) * force * 0.01;
        planet.vy += (dy / dist) * force * 0.01;

        planet.x += planet.vx;
        planet.y += planet.vy;
      });

      // Apply thrust if mouse is down and fuel available
      if (state.keys['mouseDown'] && state.rocket.fuel > 0) {
        state.rocket.vx += Math.cos(state.rocket.angle) * state.rocket.thrust;
        state.rocket.vy += Math.sin(state.rocket.angle) * state.rocket.thrust;
        state.rocket.fuel -= 0.5;
        setFuel(Math.max(0, state.rocket.fuel));
      }

      // Apply gravity to ROCKET from sun
      let dx = state.sun.x - state.rocket.x;
      let dy = state.sun.y - state.rocket.y;
      let distSq = dx * dx + dy * dy;
      let dist = Math.sqrt(distSq);
      let force = (state.sun.mass) / distSq;
      state.rocket.vx += (dx / dist) * force * 0.01;
      state.rocket.vy += (dy / dist) * force * 0.01;

      // Apply gravity to ROCKET from planets
      state.planets.forEach(planet => {
        dx = planet.x - state.rocket.x;
        dy = planet.y - state.rocket.y;
        distSq = dx * dx + dy * dy;
        dist = Math.sqrt(distSq);
        if (dist > planet.radius) {
          force = (planet.mass) / distSq;
          state.rocket.vx += (dx / dist) * force * 0.01;
          state.rocket.vy += (dy / dist) * force * 0.01;
        }
      });

      // Update rocket position
      state.rocket.x += state.rocket.vx;
      state.rocket.y += state.rocket.vy;

      // Add to trail
      state.rocket.trail.push({ x: state.rocket.x, y: state.rocket.y });
      if (state.rocket.trail.length > 200) {
        state.rocket.trail.shift();
      }

      // Update camera to follow rocket
      state.camera.x = state.rocket.x;
      state.camera.y = state.rocket.y;

      // Calculate distance from starting planet
      const startPlanet = state.planets[0];
      const distFromStart = Math.sqrt(
        Math.pow(state.rocket.x - startPlanet.x, 2) +
        Math.pow(state.rocket.y - startPlanet.y, 2)
      );
      setDistance(Math.floor(distFromStart));

      // Render
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2 - state.camera.x, canvas.height / 2 - state.camera.y);

      // Draw sun
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(state.sun.x, state.sun.y, state.sun.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw orbit paths (approximate circles based on starting positions)
      state.planets.forEach(planet => {
        const orbitRadius = Math.sqrt(
          Math.pow(planet.x - state.sun.x, 2) +
          Math.pow(planet.y - state.sun.y, 2)
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(state.sun.x, state.sun.y, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw planets
      state.planets.forEach(planet => {
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw rocket trail
      if (state.rocket.trail.length > 1) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(state.rocket.trail[0].x, state.rocket.trail[0].y);
        for (let i = 1; i < state.rocket.trail.length; i++) {
          ctx.lineTo(state.rocket.trail[i].x, state.rocket.trail[i].y);
        }
        ctx.stroke();
      }

      // Draw rocket
      ctx.save();
      ctx.translate(state.rocket.x, state.rocket.y);
      ctx.rotate(state.rocket.angle);

      // Rocket body
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();

      // Rocket nose
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(8, -4);
      ctx.lineTo(8, 4);
      ctx.closePath();
      ctx.fill();

      // Thrust visualization
      if (state.keys['mouseDown'] && state.rocket.fuel > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-8, -3);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-8, 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Draw aim line
      const worldMouseX = state.mouseX - canvas.width / 2 + state.camera.x;
      const worldMouseY = state.mouseY - canvas.height / 2 + state.camera.y;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(state.rocket.x, state.rocket.y);
      ctx.lineTo(worldMouseX, worldMouseY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showInstructions]);

  return (
    <div className="orbit-container">
      <header className="page-header">
        <Link to="/" className="back-button">← Back</Link>
        <h1>Orbital Mechanics</h1>
      </header>

      <main className="orbit-content">
        <canvas ref={canvasRef}></canvas>

        {/* Instructions popup */}
        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-popup">
              <h2>How to Play</h2>
              <div className="instructions-content">
                <div className="instruction-item">
                  <span className="instruction-icon">🖱️</span>
                  <p><strong>Move mouse</strong> to aim your rocket</p>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🚀</span>
                  <p><strong>Click and hold</strong> to thrust</p>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🌍</span>
                  <p><strong>Use planets</strong> for gravity assists</p>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⛽</span>
                  <p><strong>Conserve fuel</strong> - travel as far as you can!</p>
                </div>
              </div>
              <button
                className="start-button"
                onClick={() => setShowInstructions(false)}
              >
                Start Simulation
              </button>
            </div>
          </div>
        )}

        {/* Fuel bar - left side */}
        <div className="fuel-hud">
          <label>Fuel</label>
          <div className="fuel-bar-vertical">
            <div
              className="fuel-fill-vertical"
              style={{ height: `${fuel}%` }}
            ></div>
          </div>
          <span className="fuel-percent">{Math.floor(fuel)}%</span>
        </div>

        {/* Distance - top left */}
        <div className="distance-hud">
          <label>Distance</label>
          <span className="stat-value">{distance}</span>
          <span className="stat-unit">units</span>
        </div>

        {/* Reset button - top right */}
        <div className="reset-hud">
          <button onClick={handleReset} className="reset-button">
            <svg className="reset-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            Reset (R)
          </button>
        </div>
      </main>
    </div>
  );
}

export default OrbitSim;
