import React, { useRef, useEffect, useState } from 'react';
import './AngularSize.css';

const AngularSize = () => {
  const canvasRef = useRef(null);
  const [fov, setFov] = useState(60); // Field of view in degrees
  const [showInstructions, setShowInstructions] = useState(true);
  const [centerRA, setCenterRA] = useState(12); // Right Ascension in hours
  const [centerDec, setCenterDec] = useState(0); // Declination in degrees
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Bright star data
  const STAR_DATA = [
    // Format: [RA (hours), Dec (degrees), magnitude, name]
    [0.0, 29.1, 2.1, 'Alpheratz'],
    [0.7, -17.9, 2.0, 'Diphda'],
    [1.6, 35.6, 2.3, 'Mirach'],
    [2.1, 23.5, 2.9, 'Almach'],
    [2.7, 89.3, 2.0, 'Polaris'],
    [3.4, 49.9, 1.8, 'Ruchbah'],
    [4.6, 16.5, 0.9, 'Aldebaran'],
    [5.2, -8.2, 0.5, 'Rigel'],
    [5.4, 6.4, 2.2, 'Bellatrix'],
    [5.5, -1.2, 1.6, 'Mintaka'],
    [5.6, -0.3, 2.2, 'Alnilam'],
    [5.7, -1.9, 1.7, 'Alnitak'],
    [5.9, 7.4, 0.1, 'Betelgeuse'],
    [6.4, -16.7, -1.4, 'Sirius'],
    [7.4, 5.2, 0.4, 'Procyon'],
    [7.7, 28.0, 1.9, 'Pollux'],
    [10.1, 11.9, 1.4, 'Regulus'],
    [11.0, 61.8, 1.8, 'Dubhe'],
    [12.9, 55.9, 2.4, 'Alioth'],
    [13.4, -11.2, 1.0, 'Spica'],
    [13.8, 49.3, 2.2, 'Alkaid'],
    [14.3, 19.2, 0.0, 'Arcturus'],
    [16.5, -26.4, 1.1, 'Antares'],
    [18.6, 38.8, 0.0, 'Vega'],
    [19.8, 8.9, 0.8, 'Altair'],
    [20.7, 45.3, 1.3, 'Deneb'],
    [22.1, -29.6, 1.2, 'Fomalhaut'],
  ];

  // Deep sky objects with real positions and sizes
  const DEEP_SKY_OBJECTS = [
    { name: 'Andromeda Galaxy', ra: 0.71, dec: 41.3, size: 3, color: '#a78bfa', type: 'galaxy' },
    { name: 'Orion Nebula', ra: 5.58, dec: -5.4, size: 1, color: '#ec4899', type: 'nebula' },
    { name: 'Pleiades', ra: 3.78, dec: 24.1, size: 2, color: '#60a5fa', type: 'cluster' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      // Clear canvas with deep space background
      ctx.fillStyle = '#000814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate pixels per degree
      const pixelsPerDegree = canvas.height / fov;

      // Draw stars
      STAR_DATA.forEach(([ra, dec, mag, name]) => {
        // Calculate offset from center view
        const raOffset = (ra - centerRA) * 15; // Convert hours to degrees
        const decOffset = dec - centerDec;

        // Project to screen coordinates
        const x = centerX + raOffset * pixelsPerDegree;
        const y = centerY - decOffset * pixelsPerDegree;

        // Only draw if in view
        if (x >= -50 && x <= canvas.width + 50 && y >= -50 && y <= canvas.height + 50) {
          // Star size based on magnitude (brighter = bigger)
          const size = Math.max(1.5, 5 - mag);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Add glow for bright stars
          if (mag < 1.5) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Label very bright stars
          if (mag < 0.5 && fov < 30) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '11px sans-serif';
            ctx.fillText(name, x + 8, y - 8);
          }
        }
      });

      // Draw deep sky objects
      DEEP_SKY_OBJECTS.forEach(obj => {
        const raOffset = (obj.ra - centerRA) * 15;
        const decOffset = obj.dec - centerDec;

        const x = centerX + raOffset * pixelsPerDegree;
        const y = centerY - decOffset * pixelsPerDegree;

        const radiusPixels = (obj.size / 2) * pixelsPerDegree;

        // Only draw if in view and visible at this scale
        if (x >= -200 && x <= canvas.width + 200 && y >= -200 && y <= canvas.height + 200 && radiusPixels > 3) {
          ctx.globalAlpha = 0.5;

          if (obj.type === 'galaxy') {
            // Draw elliptical galaxy
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusPixels * 3);
            gradient.addColorStop(0, obj.color);
            gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.2)');
            gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(x, y, radiusPixels * 3, radiusPixels, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'nebula') {
            // Draw nebula with soft glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusPixels);
            gradient.addColorStop(0, obj.color);
            gradient.addColorStop(0.6, 'rgba(236, 72, 153, 0.3)');
            gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radiusPixels, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'cluster') {
            // Draw star cluster
            for (let i = 0; i < 15; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * radiusPixels;
              const sx = x + Math.cos(angle) * dist;
              const sy = y + Math.sin(angle) * dist;
              ctx.fillStyle = obj.color;
              ctx.beginPath();
              ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          ctx.globalAlpha = 1.0;

          // Label if zoomed in enough
          if (fov < 20 && radiusPixels > 20) {
            ctx.fillStyle = obj.color;
            ctx.font = '12px sans-serif';
            ctx.fillText(obj.name, x + radiusPixels + 5, y);
          }
        }
      });

      // Draw measurement overlays
      const measurements = [
        { size: 1, label: '1°', color: '#3b82f6' },
        { size: 1/60, label: "1' (arcmin)", color: '#8b5cf6' },
        { size: 1/3600, label: '1" (arcsec)', color: '#ec4899' },
      ];

      measurements.forEach(m => {
        const radiusPixels = (m.size / 2) * pixelsPerDegree;

        if (radiusPixels > 5 && radiusPixels < canvas.height / 2) {
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radiusPixels, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Label
          ctx.fillStyle = m.color;
          ctx.font = 'bold 14px monospace';
          ctx.fillText(m.label, centerX + radiusPixels + 10, centerY - 10);
          ctx.globalAlpha = 1.0;
        }
      });
    };

    render();

    // Mouse wheel zoom
    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      setFov(prev => Math.max(0.001, Math.min(180, prev * zoomFactor)));
    };

    // Mouse drag to pan
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;

        const pixelsPerDegree = canvas.height / fov;
        const deltaRA = (dx / pixelsPerDegree) / 15; // Convert degrees to hours
        const deltaDec = dy / pixelsPerDegree;

        setCenterRA(prev => (prev - deltaRA + 24) % 24); // Wrap RA around 24 hours
        setCenterDec(prev => Math.max(-90, Math.min(90, prev + deltaDec))); // Clamp Dec to -90 to 90

        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [fov, centerRA, centerDec, isDragging, lastMousePos]);

  // Determine which unit to display
  const getDisplayUnit = () => {
    if (fov >= 1) {
      return { value: fov.toFixed(3), unit: '°', name: 'Degrees' };
    } else if (fov >= 1/60) {
      return { value: (fov * 60).toFixed(2), unit: "'", name: 'Arcminutes' };
    } else {
      return { value: (fov * 3600).toFixed(1), unit: '"', name: 'Arcseconds' };
    }
  };

  const displayUnit = getDisplayUnit();

  return (
    <div className="angular-size-page">
      <div className="angular-size-container">
        <canvas ref={canvasRef} style={{ cursor: isDragging ? 'grabbing' : 'grab' }} />

        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-content">
              <h2>Night Sky Viewer</h2>
              <div className="instruction-item">
                <span className="instruction-icon">🖱️</span>
                <p>Scroll to zoom in and out</p>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">👆</span>
                <p>Click and drag to look around the sky</p>
              </div>
              <button
                className="start-button"
                onClick={() => setShowInstructions(false)}
              >
                Start Exploring
              </button>
            </div>
          </div>
        )}

        {/* Info Panel - Top Left */}
        <div className="info-panel">
          <h3>Field of View</h3>
          <div className="fov-value">{displayUnit.value}{displayUnit.unit}</div>
          <div className="unit-name">{displayUnit.name}</div>
        </div>
      </div>
    </div>
  );
};

export default AngularSize;
