import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './OrbitSim.css';

const G = 0.1;
const SUN_MASS = 10000;
const SUN_MU = G * SUN_MASS;
const STARTING_ORBIT_RADIUS = 600;

function OrbitSim() {
  const canvasRef = useRef(null);
  const fuelFillRef = useRef(null);
  const fuelTextRef = useRef(null);
  const distanceTextRef = useRef(null);

  const [showInstructions, setShowInstructions] = useState(true);
  const [timeWarp, setTimeWarp] = useState(1);

  const getInitialState = () => {
    const createPlanetAtOrbit = (orbitRadius, mass, radius, color, soi) => {
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * orbitRadius;
      const orbitalSpeed = Math.sqrt(SUN_MU / orbitRadius);
      const angularVelocity = orbitalSpeed / orbitRadius;

      return {
        x,
        y,
        mass,
        radius,
        color,
        soi,
        mu: G * mass,
        angle,
        angularVelocity,
        orbitRadius,
        radiusSq: radius * radius,
        soiSq: soi * soi,
      };
    };

    return {
      sun: {
        x: 0,
        y: 0,
        mass: SUN_MASS,
        radius: 80,
        mu: SUN_MU,
        radiusSq: 80 * 80,
      },
      planets: [
        createPlanetAtOrbit(1500, 150, 50, '#3b82f6', 200),
        createPlanetAtOrbit(4000, 100, 40, '#8b5cf6', 150),
        createPlanetAtOrbit(7500, 80, 35, '#ec4899', 120),
      ],
      rocket: {
        x: STARTING_ORBIT_RADIUS,
        y: 0,
        vx: 0,
        vy: Math.sqrt(SUN_MU / STARTING_ORBIT_RADIUS),
        angle: 0,
        thrust: 0.002,
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
      predictedPathX: new Float64Array(6500),
      predictedPathY: new Float64Array(6500),
      predictedPathEncounter: new Uint8Array(6500),
      predictedPathStep: new Int32Array(6500),
      predictedPathLength: 0,
      predictedEncounters: [],
    };
  };

  const gameStateRef = useRef(getInitialState());

  const handleReset = useCallback(() => {
    const newState = getInitialState();
    gameStateRef.current = newState;
    setTimeWarp(1);

    if (fuelFillRef.current) {
      fuelFillRef.current.style.height = '100%';
      fuelFillRef.current.style.backgroundColor = '#3b82f6';
    }
    if (fuelTextRef.current) fuelTextRef.current.innerText = '100%';
    if (distanceTextRef.current) distanceTextRef.current.innerText = '0';
  }, []);

  useEffect(() => {
    if (showInstructions) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    const simPlanetsBuffer = [{}, {}, {}];

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

      let clickedOrbitStep = null;
      if (state.predictedPathLength > 1) {
        const checkRadius = 20 / state.zoom;
        const checkRadiusSq = checkRadius * checkRadius;

        for (let i = 0; i < state.predictedPathLength; i++) {
          const dx = worldClickX - state.predictedPathX[i];
          const dy = worldClickY - state.predictedPathY[i];
          const distSq = dx * dx + dy * dy;

          if (distSq < checkRadiusSq) {
            clickedOrbitStep = state.predictedPathStep[i];
            break;
          }
        }
      }

      if (clickedOrbitStep !== null) {
        gameStateRef.current.warpTarget = clickedOrbitStep;
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
          // Already paused
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
      const halfW = canvas.width / 2 / z;
      const halfH = canvas.height / 2 / z;
      const left = state.camera.x - halfW;
      const right = state.camera.x + halfW;
      const top = state.camera.y - halfH;
      const bottom = state.camera.y + halfH;

      if (objX < left || objX > right || objY < top || objY > bottom) {
        const dx = objX - state.camera.x;
        const dy = objY - state.camera.y;

        const padding = 35 / z;
        const innerHalfW = halfW - padding;
        const innerHalfH = halfH - padding;
        const slope = dy / dx;

        let finalX, finalY;

        if (Math.abs(slope) < innerHalfH / innerHalfW) {
          finalX = dx > 0 ? innerHalfW : -innerHalfW;
          finalY = finalX * slope;
        } else {
          finalY = dy > 0 ? innerHalfH : -innerHalfH;
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

        if (fuelFillRef.current) {
          fuelFillRef.current.style.height = '100%';
          fuelFillRef.current.style.backgroundColor = '#3b82f6';
        }
        if (fuelTextRef.current) fuelTextRef.current.innerText = '100%';
        if (distanceTextRef.current) distanceTextRef.current.innerText = '0';

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
              planet.angle += planet.angularVelocity;
              planet.x =
                state.sun.x + Math.cos(planet.angle) * planet.orbitRadius;
              planet.y =
                state.sun.y + Math.sin(planet.angle) * planet.orbitRadius;
            });

            let dx = state.sun.x - state.rocket.x;
            let dy = state.sun.y - state.rocket.y;
            let distSq = dx * dx + dy * dy;
            let dist = Math.sqrt(distSq);
            let force = state.sun.mu / distSq;
            state.rocket.vx += (dx / dist) * force;
            state.rocket.vy += (dy / dist) * force;

            state.planets.forEach((planet) => {
              dx = planet.x - state.rocket.x;
              dy = planet.y - state.rocket.y;
              distSq = dx * dx + dy * dy;
              dist = Math.sqrt(distSq);
              if (dist < planet.soi && dist > planet.radius) {
                force = planet.mu / distSq;
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
          planet.angle += planet.angularVelocity;
          planet.x = state.sun.x + Math.cos(planet.angle) * planet.orbitRadius;
          planet.y = state.sun.y + Math.sin(planet.angle) * planet.orbitRadius;
        });

        if (state.keys['mouseDown'] && state.rocket.fuel > 0) {
          state.rocket.vx += Math.cos(state.rocket.angle) * state.rocket.thrust;
          state.rocket.vy += Math.sin(state.rocket.angle) * state.rocket.thrust;
          state.rocket.fuel -= 0.25;
          state.rocket.fuel = Math.max(0, state.rocket.fuel);

          if (fuelFillRef.current && fuelTextRef.current) {
            fuelFillRef.current.style.height = `${state.rocket.fuel}%`;
            fuelFillRef.current.style.backgroundColor =
              state.rocket.fuel < 25 ? '#ef4444' : '#3b82f6';
            fuelTextRef.current.innerText = `${Math.floor(state.rocket.fuel)}%`;
          }
        }

        let dx = state.sun.x - state.rocket.x;
        let dy = state.sun.y - state.rocket.y;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        let force = state.sun.mu / distSq;

        state.rocket.vx += (dx / dist) * force;
        state.rocket.vy += (dy / dist) * force;

        state.planets.forEach((planet) => {
          dx = planet.x - state.rocket.x;
          dy = planet.y - state.rocket.y;
          distSq = dx * dx + dy * dy;
          dist = Math.sqrt(distSq);

          if (dist < planet.soi && dist > planet.radius) {
            force = planet.mu / distSq;
            state.rocket.vx += (dx / dist) * force;
            state.rocket.vy += (dy / dist) * force;
          }
        });

        state.rocket.x += state.rocket.vx;
        state.rocket.y += state.rocket.vy;

        const sunDx = state.rocket.x - state.sun.x;
        const sunDy = state.rocket.y - state.sun.y;
        const sunDistSq = sunDx * sunDx + sunDy * sunDy;
        if (sunDistSq < state.sun.radiusSq) {
          collisionOccurred = true;
          break;
        }

        for (let planet of state.planets) {
          const planetDx = state.rocket.x - planet.x;
          const planetDy = state.rocket.y - planet.y;
          const planetDistSq = planetDx * planetDx + planetDy * planetDy;
          if (planetDistSq < planet.radiusSq) {
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

      if (state.predictionFrameCount % 3 === 0) {
        const PREDICTION_MAX_STEPS = 120000;
        const PREDICTION_INTERVAL = 20;

        let simRx = state.rocket.x;
        let simRy = state.rocket.y;
        let simRvx = state.rocket.vx;
        let simRvy = state.rocket.vy;

        for (let i = 0; i < state.planets.length; i++) {
          let p = state.planets[i];
          let sp = simPlanetsBuffer[i];
          sp.cosV = Math.cos(p.angularVelocity);
          sp.sinV = Math.sin(p.angularVelocity);
          sp.dx = p.x - state.sun.x;
          sp.dy = p.y - state.sun.y;
          sp.x = p.x;
          sp.y = p.y;
          sp.radiusSq = p.radiusSq;
          sp.soiSq = p.soiSq;
          sp.mu = p.mu;
          sp.radius = p.radius;
          sp.color = p.color;
          sp.soi = p.soi;
        }

        let collisionDetected = false;
        let sweptAngle = 0;
        let prevAngle = Math.atan2(simRy - state.sun.y, simRx - state.sun.x);
        let inEncounter = false;
        let encountersCompleted = 0;
        let currentEncounterData = null;
        let currentEncounterMinDist = Infinity;

        state.predictedEncounters.length = 0;

        let pathLen = 0;
        state.predictedPathX[pathLen] = simRx;
        state.predictedPathY[pathLen] = simRy;
        state.predictedPathEncounter[pathLen] = 0;
        state.predictedPathStep[pathLen] = 0;
        pathLen++;

        for (let i = 1; i <= PREDICTION_MAX_STEPS; i++) {
          let activeSoi = false;
          let planetCollision = false;

          for (let j = 0; j < simPlanetsBuffer.length; j++) {
            let p = simPlanetsBuffer[j];

            let newDx = p.dx * p.cosV - p.dy * p.sinV;
            let newDy = p.dx * p.sinV + p.dy * p.cosV;
            p.dx = newDx;
            p.dy = newDy;
            p.x = state.sun.x + newDx;
            p.y = state.sun.y + newDy;

            let pdx = p.x - simRx;
            let pdy = p.y - simRy;
            let pDistSq = pdx * pdx + pdy * pdy;

            if (pDistSq < p.radiusSq) {
              planetCollision = true;
              break;
            }

            if (pDistSq < p.soiSq) {
              activeSoi = true;
              let pDist = Math.sqrt(pDistSq);
              let pForce = p.mu / pDistSq;
              simRvx += (pdx / pDist) * pForce;
              simRvy += (pdy / pDist) * pForce;

              if (pDistSq < currentEncounterMinDist) {
                currentEncounterMinDist = pDistSq;
                currentEncounterData = {
                  x: p.x,
                  y: p.y,
                  radius: p.radius,
                  color: p.color,
                  soi: p.soi,
                };
              }
            }
          }

          let rxDx = state.sun.x - simRx;
          let rxDy = state.sun.y - simRy;
          let rxDistSq = rxDx * rxDx + rxDy * rxDy;
          let rxDist = Math.sqrt(rxDistSq);

          let rForce = state.sun.mu / rxDistSq;
          simRvx += (rxDx / rxDist) * rForce;
          simRvy += (rxDy / rxDist) * rForce;

          simRx += simRvx;
          simRy += simRvy;

          const sunCollision = rxDistSq < state.sun.radiusSq;

          if (
            i % PREDICTION_INTERVAL === 0 ||
            i === PREDICTION_MAX_STEPS ||
            sunCollision ||
            planetCollision
          ) {
            state.predictedPathX[pathLen] = simRx;
            state.predictedPathY[pathLen] = simRy;
            state.predictedPathEncounter[pathLen] = activeSoi ? 1 : 0;
            state.predictedPathStep[pathLen] = i;
            pathLen++;

            if (sunCollision || planetCollision) {
              collisionDetected = true;
              if (inEncounter && currentEncounterData) {
                state.predictedEncounters.push(currentEncounterData);
              }
              break;
            }

            if (activeSoi) {
              if (!inEncounter) {
                inEncounter = true;
                currentEncounterMinDist = Infinity;
              }
            } else {
              if (inEncounter) {
                inEncounter = false;
                if (currentEncounterData) {
                  state.predictedEncounters.push(currentEncounterData);
                  currentEncounterData = null;
                }
                sweptAngle = 0;
                prevAngle = Math.atan2(
                  simRy - state.sun.y,
                  simRx - state.sun.x
                );
                encountersCompleted++;
                if (encountersCompleted >= 2) break;
              }

              let currentAngle = Math.atan2(
                simRy - state.sun.y,
                simRx - state.sun.x
              );
              let angleDiff = currentAngle - prevAngle;

              if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
              if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

              sweptAngle += angleDiff;
              prevAngle = currentAngle;

              if (Math.abs(sweptAngle) >= Math.PI * 1.99) break;
              if (simRx * simRx + simRy * simRy > 900000000) break;
            }
          }
        }

        if (inEncounter && currentEncounterData) {
          state.predictedEncounters.push(currentEncounterData);
        }

        state.predictedPathLength = pathLen;
        state.collisionDetected = collisionDetected;
      }

      state.camera.x = state.rocket.x;
      state.camera.y = state.rocket.y;

      const dSunX = state.rocket.x - state.sun.x;
      const dSunY = state.rocket.y - state.sun.y;
      const distFromSun = Math.sqrt(dSunX * dSunX + dSunY * dSunY);

      const currentScore = Math.max(
        0,
        Math.floor(distFromSun - STARTING_ORBIT_RADIUS)
      );

      if (currentScore > state.maxDistance) {
        state.maxDistance = currentScore;
        if (distanceTextRef.current) {
          distanceTextRef.current.innerText = state.maxDistance;
        }
      }

      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(state.zoom, state.zoom);
      ctx.translate(-state.camera.x, -state.camera.y);

      const gradient = ctx.createRadialGradient(
        state.sun.x,
        state.sun.y,
        state.sun.radius * 0.5,
        state.sun.x,
        state.sun.y,
        state.sun.radius * 1.5
      );
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(state.sun.x, state.sun.y, state.sun.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(state.sun.x, state.sun.y, state.sun.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      drawOffscreenIndicator(state.sun.x, state.sun.y, '#fbbf24', true);

      state.planets.forEach((planet) => {
        const pdx = planet.x - state.sun.x;
        const pdy = planet.y - state.sun.y;
        const orbitRadius = Math.sqrt(pdx * pdx + pdy * pdy);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1 / state.zoom;
        ctx.beginPath();
        ctx.arc(state.sun.x, state.sun.y, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
      });

      state.planets.forEach((planet) => {
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

      if (state.predictedEncounters && state.predictedEncounters.length > 0) {
        state.predictedEncounters.forEach((ghost) => {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1 / state.zoom;
          ctx.beginPath();
          ctx.arc(ghost.x, ghost.y, ghost.soi, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = ghost.color;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(ghost.x, ghost.y, ghost.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      }

      if (state.predictedPathLength > 1) {
        ctx.lineWidth = 1.5 / state.zoom;
        ctx.setLineDash([5 / state.zoom, 5 / state.zoom]);

        let currentEncounterState = state.predictedPathEncounter[0] === 1;
        let lastDrawnX = state.predictedPathX[0];
        let lastDrawnY = state.predictedPathY[0];
        const cullThresholdSq = (1 / state.zoom) * (1 / state.zoom);

        ctx.beginPath();
        ctx.moveTo(lastDrawnX, lastDrawnY);

        for (let i = 1; i < state.predictedPathLength; i++) {
          let px = state.predictedPathX[i];
          let py = state.predictedPathY[i];
          let enc = state.predictedPathEncounter[i] === 1;

          if (enc !== currentEncounterState) {
            ctx.strokeStyle = currentEncounterState
              ? 'rgba(167, 139, 250, 0.9)'
              : state.collisionDetected
                ? 'rgba(239, 68, 68, 0.6)'
                : 'rgba(59, 130, 246, 0.5)';
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(
              state.predictedPathX[i - 1],
              state.predictedPathY[i - 1]
            );
            currentEncounterState = enc;
            lastDrawnX = state.predictedPathX[i - 1];
            lastDrawnY = state.predictedPathY[i - 1];
          }

          let drawDx = px - lastDrawnX;
          let drawDy = py - lastDrawnY;
          if (
            drawDx * drawDx + drawDy * drawDy >= cullThresholdSq ||
            i === state.predictedPathLength - 1
          ) {
            ctx.lineTo(px, py);
            lastDrawnX = px;
            lastDrawnY = py;
          }
        }

        ctx.strokeStyle = currentEncounterState
          ? 'rgba(167, 139, 250, 0.9)'
          : state.collisionDetected
            ? 'rgba(239, 68, 68, 0.6)'
            : 'rgba(59, 130, 246, 0.5)';
        ctx.stroke();
        ctx.setLineDash([]);

        if (state.collisionDetected && state.predictedPathLength > 0) {
          const lastPointX =
            state.predictedPathX[state.predictedPathLength - 1];
          const lastPointY =
            state.predictedPathY[state.predictedPathLength - 1];
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.beginPath();
          ctx.arc(lastPointX, lastPointY, 5 / state.zoom, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2 / state.zoom;
          ctx.beginPath();
          ctx.moveTo(lastPointX - 4 / state.zoom, lastPointY - 4 / state.zoom);
          ctx.lineTo(lastPointX + 4 / state.zoom, lastPointY + 4 / state.zoom);
          ctx.moveTo(lastPointX + 4 / state.zoom, lastPointY - 4 / state.zoom);
          ctx.lineTo(lastPointX - 4 / state.zoom, lastPointY + 4 / state.zoom);
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
  }, [showInstructions, handleReset]);

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
                  ref={fuelFillRef}
                  className="fuel-fill-vertical"
                  style={{
                    height: '100%',
                    backgroundColor: '#3b82f6',
                  }}
                ></div>
              </div>
              <span ref={fuelTextRef} className="fuel-percent">
                100%
              </span>
            </div>

            <div className="distance-hud">
              <label>Max Distance</label>
              <span ref={distanceTextRef} className="stat-value">
                0
              </span>
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
