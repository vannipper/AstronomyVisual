import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './OrbitSim.css';

const G = 0.1;
const SUN_MASS = 10000;
const STARTING_ORBIT_RADIUS = 600;

function OrbitSim() {
  const canvasRef = useRef(null);
  const [fuel, setFuel] = useState(100);
  const [distance, setDistance] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeWarp, setTimeWarp] = useState(1);
  const handleResetRef = useRef(null);

  const getInitialState = () => {
    const createPlanetAtOrbit = (orbitRadius, mass, radius, color, soi) => {
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * orbitRadius;
      const orbitalSpeed = Math.sqrt((G * SUN_MASS) / orbitRadius);
      const vx = -Math.sin(angle) * orbitalSpeed;
      const vy = Math.cos(angle) * orbitalSpeed;

      return { x, y, vx, vy, mass, radius, color, soi };
    };

    return {
      sun: { x: 0, y: 0, mass: SUN_MASS, radius: 80 },
      planets: [
        createPlanetAtOrbit(1500, 800, 50, '#3b82f6', 350),
        createPlanetAtOrbit(3000, 600, 40, '#8b5cf6', 300),
        createPlanetAtOrbit(5000, 400, 35, '#ec4899', 250),
      ],
      rocket: {
        x: STARTING_ORBIT_RADIUS,
        y: 0,
        vx: 0,
        vy: Math.sqrt((G * SUN_MASS) / STARTING_ORBIT_RADIUS),
        angle: 0,
        thrust: 0.003,
        fuel: 100,
      },
      camera: { x: 0, y: 0 },
      zoom: 1,
      mouseX: 0,
      mouseY: 0,
      keys: {},
      maxDistance: 0,
      timeWarp: 1,
      isPaused: false,
      shouldReset: false,
    };
  };

  const gameStateRef = useRef(getInitialState());

  const handleReset = () => {
    const newState = getInitialState();
    gameStateRef.current = newState;
    setFuel(newState.rocket.fuel);
    setDistance(0);
    setTimeWarp(1);
  };

  handleResetRef.current = handleReset;

  useEffect(() => {
    if (showInstructions) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let canvasBounds = canvas.getBoundingClientRect();
    const updateCanvasBounds = () => {
      canvasBounds = canvas.getBoundingClientRect();
    };
    window.addEventListener('resize', updateCanvasBounds);
    window.addEventListener('scroll', updateCanvasBounds);

    const handleMouseMove = (e) => {
      const state = gameStateRef.current;
      state.mouseX = e.clientX - canvasBounds.left;
      state.mouseY = e.clientY - canvasBounds.top;

      const worldMouseX =
        (state.mouseX - canvas.width / 2) / state.zoom + state.camera.x;
      const worldMouseY =
        (state.mouseY - canvas.height / 2) / state.zoom + state.camera.y;

      const dx = worldMouseX - state.rocket.x;
      const dy = worldMouseY - state.rocket.y;
      state.rocket.angle = Math.atan2(dy, dx);
    };

    const handleMouseDown = (e) => {
      const state = gameStateRef.current;
      if (e.button === 0) {
        state.keys['mouseDown'] = true;
      }
    };

    const handleMouseUp = (e) => {
      const state = gameStateRef.current;
      if (e.button === 0) state.keys['mouseDown'] = false;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      const state = gameStateRef.current;
      const clickX = e.clientX - canvasBounds.left;
      const clickY = e.clientY - canvasBounds.top;
      const worldClickX =
        (clickX - canvas.width / 2) / state.zoom + state.camera.x;
      const worldClickY =
        (clickY - canvas.height / 2) / state.zoom + state.camera.y;

      let clickedOrbitPoint = null;
      if (state.predictedPath && state.predictedPath.length > 1) {
        const checkRadius = 20 / state.zoom;
        const checkRadiusSq = checkRadius * checkRadius;

        for (let i = 0; i < state.predictedPath.length; i++) {
          const point = state.predictedPath[i];
          const dx = worldClickX - point.x;
          const dy = worldClickY - point.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < checkRadiusSq) {
            clickedOrbitPoint = point;
            break;
          }
        }
      }

      if (clickedOrbitPoint) {
        gameStateRef.current.warpTarget = clickedOrbitPoint.index;
      }
    };

    const handleKeyDown = (e) => {
      const state = gameStateRef.current;
      state.keys[e.key] = true;
      if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
      if (e.key === ',') {
        if (state.timeWarp === 0) {
        } else if (state.timeWarp === 1) {
          state.timeWarp = 0;
          state.isPaused = true;
          setTimeWarp(0);
        } else {
          const newWarp = state.timeWarp / 2;
          state.timeWarp = newWarp;
          setTimeWarp(newWarp);
        }
      }
      if (e.key === '.') {
        if (state.timeWarp === 0) {
          state.timeWarp = 1;
          state.isPaused = false;
          setTimeWarp(1);
        } else {
          const newWarp = Math.min(64, state.timeWarp * 2);
          state.timeWarp = newWarp;
          setTimeWarp(newWarp);
        }
      }
    };

    const handleKeyUp = (e) => {
      const state = gameStateRef.current;
      state.keys[e.key] = false;
    };

    const handleWheel = (e) => {
      const state = gameStateRef.current;
      e.preventDefault();
      const zoomSpeed = 0.1;
      const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
      state.zoom = Math.max(0.1, Math.min(3, state.zoom * delta));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const drawOffscreenIndicator = (objX, objY, color, isSun = false) => {
      const state = gameStateRef.current;
      const z = state.zoom;
      const left = state.camera.x - canvas.width / 2 / z;
      const right = state.camera.x + canvas.width / 2 / z;
      const top = state.camera.y - canvas.height / 2 / z;
      const bottom = state.camera.y + canvas.height / 2 / z;

      if (objX < left || objX > right || objY < top || objY > bottom) {
        const dx = objX - state.camera.x;
        const dy = objY - state.camera.y;

        const padding = 35 / z;
        const halfW = canvas.width / 2 / z - padding;
        const halfH = canvas.height / 2 / z - padding;
        const slope = dy / dx;

        let finalX, finalY;

        if (Math.abs(slope) < halfH / halfW) {
          finalX = dx > 0 ? halfW : -halfW;
          finalY = finalX * slope;
        } else {
          finalY = dy > 0 ? halfH : -halfH;
          finalX = finalY / slope;
        }

        const indWorldX = state.camera.x + finalX;
        const indWorldY = state.camera.y + finalY;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(indWorldX, indWorldY, (isSun ? 6 : 4) / z, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2 / z;
        ctx.beginPath();
        ctx.arc(indWorldX, indWorldY, (isSun ? 12 : 9) / z, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const gameLoop = () => {
      const state = gameStateRef.current;

      if (state.shouldReset) {
        state.shouldReset = false;
        const newState = getInitialState();
        gameStateRef.current = newState;
        setFuel(newState.rocket.fuel);
        setDistance(0);
        setTimeWarp(1);
        requestAnimationFrame(gameLoop);
        return;
      }

      const warpFactor = state.isPaused ? 0 : state.timeWarp;
      let collisionOccurred = false;

      for (
        let warpStep = 0;
        warpStep < warpFactor && !collisionOccurred;
        warpStep++
      ) {
        if (state.warpTarget !== undefined && state.warpTarget > 0) {
          const stepsToWarp = Math.min(state.warpTarget, 30);
          state.warpTarget -= stepsToWarp;

          for (let i = 0; i < stepsToWarp; i++) {
            state.planets.forEach((planet) => {
              let dx = state.sun.x - planet.x;
              let dy = state.sun.y - planet.y;
              let distSq = dx * dx + dy * dy;
              let dist = Math.sqrt(distSq);
              let force = (G * state.sun.mass) / distSq;
              planet.vx += (dx / dist) * force;
              planet.vy += (dy / dist) * force;
              planet.x += planet.vx;
              planet.y += planet.vy;
            });

            let dx = state.sun.x - state.rocket.x;
            let dy = state.sun.y - state.rocket.y;
            let distSq = dx * dx + dy * dy;
            let dist = Math.sqrt(distSq);
            let force = (G * state.sun.mass) / distSq;
            state.rocket.vx += (dx / dist) * force;
            state.rocket.vy += (dy / dist) * force;

            state.planets.forEach((planet) => {
              dx = planet.x - state.rocket.x;
              dy = planet.y - state.rocket.y;
              distSq = dx * dx + dy * dy;
              dist = Math.sqrt(distSq);
              if (dist < planet.soi && dist > planet.radius) {
                force = (G * planet.mass) / distSq;
                state.rocket.vx += (dx / dist) * force;
                state.rocket.vy += (dy / dist) * force;
              }
            });

            state.rocket.x += state.rocket.vx;
            state.rocket.y += state.rocket.vy;
          }

          if (state.warpTarget <= 0) {
            state.warpTarget = undefined;
          }
          break;
        }

        state.planets.forEach((planet) => {
          let dx = state.sun.x - planet.x;
          let dy = state.sun.y - planet.y;
          let distSq = dx * dx + dy * dy;
          let dist = Math.sqrt(distSq);

          let force = (G * state.sun.mass) / distSq;
          planet.vx += (dx / dist) * force;
          planet.vy += (dy / dist) * force;

          planet.x += planet.vx;
          planet.y += planet.vy;
        });

        if (state.keys['mouseDown'] && state.rocket.fuel > 0) {
          state.rocket.vx += Math.cos(state.rocket.angle) * state.rocket.thrust;
          state.rocket.vy += Math.sin(state.rocket.angle) * state.rocket.thrust;
          state.rocket.fuel -= 0.75;
          setFuel(Math.max(0, state.rocket.fuel));
        }

        let dx = state.sun.x - state.rocket.x;
        let dy = state.sun.y - state.rocket.y;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        let force = (G * state.sun.mass) / distSq;

        state.rocket.vx += (dx / dist) * force;
        state.rocket.vy += (dy / dist) * force;

        state.planets.forEach((planet) => {
          dx = planet.x - state.rocket.x;
          dy = planet.y - state.rocket.y;
          distSq = dx * dx + dy * dy;
          dist = Math.sqrt(distSq);

          if (dist < planet.soi && dist > planet.radius) {
            force = (G * planet.mass) / distSq;
            state.rocket.vx += (dx / dist) * force;
            state.rocket.vy += (dy / dist) * force;
          }
        });

        state.rocket.x += state.rocket.vx;
        state.rocket.y += state.rocket.vy;

        const sunDx = state.rocket.x - state.sun.x;
        const sunDy = state.rocket.y - state.sun.y;
        const sunDistSq = sunDx * sunDx + sunDy * sunDy;
        const sunRadiusSq = state.sun.radius * state.sun.radius;
        if (sunDistSq < sunRadiusSq) {
          collisionOccurred = true;
          break;
        }

        for (let planet of state.planets) {
          const planetDx = state.rocket.x - planet.x;
          const planetDy = state.rocket.y - planet.y;
          const planetDistSq = planetDx * planetDx + planetDy * planetDy;
          const planetRadiusSq = planet.radius * planet.radius;
          if (planetDistSq < planetRadiusSq) {
            collisionOccurred = true;
            break;
          }
        }

        if (collisionOccurred) break;
      }

      if (collisionOccurred) {
        state.shouldReset = true;
        requestAnimationFrame(gameLoop);
        return;
      }

      if (!state.predictionFrameCount) state.predictionFrameCount = 0;
      state.predictionFrameCount++;

      const shouldUpdatePrediction = state.predictionFrameCount % 3 === 0;

      if (shouldUpdatePrediction) {
        const PREDICTION_STEPS = 6000;
        const PREDICTION_INTERVAL = 30;
        const predictedPath = [
          { x: state.rocket.x, y: state.rocket.y, index: 0 },
        ];

        let simRx = state.rocket.x;
        let simRy = state.rocket.y;
        let simRvx = state.rocket.vx;
        let simRvy = state.rocket.vy;

        let simPlanets = state.planets.map((p) => ({ ...p }));
        let collisionDetected = false;

        for (let i = 1; i <= PREDICTION_STEPS; i++) {
        simPlanets.forEach((p) => {
          let dx = state.sun.x - p.x;
          let dy = state.sun.y - p.y;
          let distSq = dx * dx + dy * dy;
          let dist = Math.sqrt(distSq);
          let force = (G * state.sun.mass) / distSq;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.x += p.vx;
          p.y += p.vy;
        });

        let rxDx = state.sun.x - simRx;
        let rxDy = state.sun.y - simRy;
        let rxDistSq = rxDx * rxDx + rxDy * rxDy;
        let rxDist = Math.sqrt(rxDistSq);

        let rForce = (G * state.sun.mass) / rxDistSq;
        simRvx += (rxDx / rxDist) * rForce;
        simRvy += (rxDy / rxDist) * rForce;

        simPlanets.forEach((p) => {
          let pdx = p.x - simRx;
          let pdy = p.y - simRy;
          let pDistSq = pdx * pdx + pdy * pdy;
          let pDist = Math.sqrt(pDistSq);

          if (pDist < p.soi) {
            let pForce = (G * p.mass) / pDistSq;
            simRvx += (pdx / pDist) * pForce;
            simRvy += (pdy / pDist) * pForce;
          }
        });

        simRx += simRvx;
        simRy += simRvy;

        const sunCollisionDx = simRx - state.sun.x;
        const sunCollisionDy = simRy - state.sun.y;
        const sunCollisionDistSq = sunCollisionDx * sunCollisionDx + sunCollisionDy * sunCollisionDy;
        const sunRadiusSq = state.sun.radius * state.sun.radius;
        if (sunCollisionDistSq < sunRadiusSq) {
          collisionDetected = true;
          if (i % PREDICTION_INTERVAL === 0 || i === PREDICTION_STEPS) {
            predictedPath.push({
              x: simRx,
              y: simRy,
              index: i,
              collision: true,
            });
          }
          break;
        }

        let planetCollision = false;
        for (let p of simPlanets) {
          const planetCollisionDx = simRx - p.x;
          const planetCollisionDy = simRy - p.y;
          const planetCollisionDistSq = planetCollisionDx * planetCollisionDx + planetCollisionDy * planetCollisionDy;
          const planetRadiusSq = p.radius * p.radius;
          if (planetCollisionDistSq < planetRadiusSq) {
            planetCollision = true;
            break;
          }
        }

        if (planetCollision) {
          collisionDetected = true;
          if (i % PREDICTION_INTERVAL === 0 || i === PREDICTION_STEPS) {
            predictedPath.push({
              x: simRx,
              y: simRy,
              index: i,
              collision: true,
            });
          }
          break;
        }

        if (i % PREDICTION_INTERVAL === 0 || i === PREDICTION_STEPS) {
          predictedPath.push({ x: simRx, y: simRy, index: i });
        }
      }

        state.predictedPath = predictedPath;
        state.collisionDetected = collisionDetected;
      }

      state.camera.x = state.rocket.x;
      state.camera.y = state.rocket.y;

      const distFromSun = Math.sqrt(
        Math.pow(state.rocket.x - state.sun.x, 2) +
          Math.pow(state.rocket.y - state.sun.y, 2)
      );

      const currentScore = Math.max(
        0,
        Math.floor(distFromSun - STARTING_ORBIT_RADIUS)
      );

      if (currentScore > state.maxDistance) {
        state.maxDistance = currentScore;
        setDistance(state.maxDistance);
      }

      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(state.zoom, state.zoom);
      ctx.translate(-state.camera.x, -state.camera.y);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(state.sun.x, state.sun.y, state.sun.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0;

      drawOffscreenIndicator(state.sun.x, state.sun.y, '#fbbf24', true);

      state.planets.forEach((planet) => {
        const orbitRadius = Math.sqrt(
          Math.pow(planet.x - state.sun.x, 2) +
            Math.pow(planet.y - state.sun.y, 2)
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1 / state.zoom;
        ctx.beginPath();
        ctx.arc(state.sun.x, state.sun.y, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
      });

      state.planets.forEach((planet, index) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1 / state.zoom;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.soi, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        drawOffscreenIndicator(planet.x, planet.y, planet.color, false);
      });

      if (state.predictedPath && state.predictedPath.length > 1) {
        ctx.strokeStyle = state.collisionDetected
          ? 'rgba(239, 68, 68, 0.6)'
          : 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 1.5 / state.zoom;
        ctx.setLineDash([5 / state.zoom, 5 / state.zoom]);
        ctx.beginPath();
        ctx.moveTo(state.predictedPath[0].x, state.predictedPath[0].y);
        for (let i = 1; i < state.predictedPath.length; i++) {
          ctx.lineTo(state.predictedPath[i].x, state.predictedPath[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        if (state.collisionDetected && state.predictedPath.length > 0) {
          const lastPoint = state.predictedPath[state.predictedPath.length - 1];
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.beginPath();
          ctx.arc(lastPoint.x, lastPoint.y, 12 / state.zoom, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3 / state.zoom;
          ctx.beginPath();
          ctx.moveTo(
            lastPoint.x - 8 / state.zoom,
            lastPoint.y - 8 / state.zoom
          );
          ctx.lineTo(
            lastPoint.x + 8 / state.zoom,
            lastPoint.y + 8 / state.zoom
          );
          ctx.moveTo(
            lastPoint.x + 8 / state.zoom,
            lastPoint.y - 8 / state.zoom
          );
          ctx.lineTo(
            lastPoint.x - 8 / state.zoom,
            lastPoint.y + 8 / state.zoom
          );
          ctx.stroke();
        }
      }

      ctx.save();
      ctx.translate(state.rocket.x, state.rocket.y);
      ctx.rotate(state.rocket.angle);

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(6, -4);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();

      if (state.keys['mouseDown'] && state.rocket.fuel > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-8, -3);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-8, 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      const worldMouseX =
        (state.mouseX - canvas.width / 2) / state.zoom + state.camera.x;
      const worldMouseY =
        (state.mouseY - canvas.height / 2) / state.zoom + state.camera.y;

      if (!state.hoveringOrbitPoint) {
        ctx.save();
        ctx.translate(worldMouseX, worldMouseY);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -8 / state.zoom);
        ctx.lineTo(-4 / state.zoom, 2 / state.zoom);
        ctx.lineTo(0, 0);
        ctx.lineTo(4 / state.zoom, 2 / state.zoom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.beginPath();
        ctx.moveTo(0, -5 / state.zoom);
        ctx.lineTo(-2.5 / state.zoom, 1 / state.zoom);
        ctx.lineTo(0, 0);
        ctx.lineTo(2.5 / state.zoom, 1 / state.zoom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 6 / state.zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1 / state.zoom;
      ctx.setLineDash([4 / state.zoom, 4 / state.zoom]);
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
      window.removeEventListener('resize', updateCanvasBounds);
      window.removeEventListener('scroll', updateCanvasBounds);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showInstructions]);

  return (
    <div className="orbit-container">
      <Link to="/" className="home-button">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </Link>

      <main className="orbit-content">
        <canvas ref={canvasRef}></canvas>

        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-popup">
              <h2>Orbital Mechanics Simulator</h2>
              <p className="instructions-subtitle">
                Navigate and control your spacecraft
              </p>

              <div className="instructions-section">
                <h3>Mouse Controls</h3>
                <div className="control-row">
                  <span className="control-action">Aim rocket</span>
                  <span className="control-key">Move Mouse</span>
                </div>
                <div className="control-row">
                  <span className="control-action">Thrust</span>
                  <span className="control-key">Click / Hold</span>
                </div>
                <div className="control-row">
                  <span className="control-action">Warp to position</span>
                  <span className="control-key">
                    Right-Click on orbital line
                  </span>
                </div>
                <div className="control-row">
                  <span className="control-action">Zoom</span>
                  <span className="control-key">Scroll Wheel</span>
                </div>
              </div>

              <div className="instructions-section">
                <h3>Keyboard Controls</h3>
                <div className="control-row">
                  <span className="control-action">Decrease time warp</span>
                  <span className="control-key key">,</span>
                </div>
                <div className="control-row">
                  <span className="control-action">Increase time warp</span>
                  <span className="control-key key">.</span>
                </div>
                <div className="control-row">
                  <span className="control-action">Reset simulation</span>
                  <span className="control-key key">R</span>
                </div>
              </div>

              <div className="instructions-section">
                <h3>Objectives</h3>
                <p className="objective-text">
                  Use gravity assists from planets to travel as far as possible
                  while conserving fuel. Fly inside planetary rings to utilize
                  their gravitational influence.
                </p>
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

        {!showInstructions && (
          <>
            <div className="fuel-hud">
              <label>Fuel</label>
              <div className="fuel-bar-vertical">
                <div
                  className="fuel-fill-vertical"
                  style={{
                    height: `${fuel}%`,
                    backgroundColor: fuel < 25 ? '#ef4444' : '#3b82f6',
                  }}
                ></div>
              </div>
              <span className="fuel-percent">{Math.floor(fuel)}%</span>
            </div>

            <div className="distance-hud">
              <label>Max Distance</label>
              <span className="stat-value">{distance}</span>
              <span className="stat-unit">km</span>
            </div>

            <div className="reset-hud">
              <button onClick={handleReset} className="reset-button">
                <svg
                  className="reset-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className="help-button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
            </div>

            <div className="warp-hud">
              <div className="warp-display">
                <span className="warp-value">
                  {timeWarp === 0 ? 'PAUSED' : `${timeWarp}x`}
                </span>
              </div>
              <div className="warp-bar">
                {[0, 1, 2, 4, 8, 16, 32, 64].map((level) => (
                  <div
                    key={level}
                    className={`warp-notch ${timeWarp >= level && timeWarp !== 0 ? 'active' : ''} ${timeWarp === 0 && level === 0 ? 'active paused' : ''}`}
                  ></div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default OrbitSim;
