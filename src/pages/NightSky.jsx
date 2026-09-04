import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NightSky.css';

const NightSky = () => {
  const canvasRef = useRef(null);
  const [fov, setFov] = useState(90);
  const [showInstructions, setShowInstructions] = useState(true);
  const [centerRA, setCenterRA] = useState(12);
  const [centerDec, setCenterDec] = useState(25);
  const [centerAz, setCenterAz] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const STAR_DATA = [
    [6.4, -16.7, -1.4, 'Sirius'], [5.3, -52.7, -0.7, 'Canopus'], [14.7, -60.4, -0.3, 'Alpha Centauri'],
    [14.3, 19.2, 0.0, 'Arcturus'], [18.6, 38.8, 0.0, 'Vega'], [7.4, 5.2, 0.4, 'Procyon'],
    [5.9, 7.4, 0.5, 'Betelgeuse'], [5.2, -8.2, 0.1, 'Rigel'], [15.6, -63.1, 0.6, 'Hadar'],
    [0.3, -42.3, 0.5, 'Achernar'], [19.8, 8.9, 0.8, 'Altair'], [4.6, 16.5, 0.9, 'Aldebaran'],
    [13.4, -11.2, 1.0, 'Spica'], [16.5, -26.4, 1.1, 'Antares'], [7.7, 28.0, 1.2, 'Pollux'],
    [22.1, -29.6, 1.2, 'Fomalhaut'], [20.7, 45.3, 1.3, 'Deneb'], [10.1, 11.9, 1.4, 'Regulus'],
    [6.8, -28.9, 1.5, 'Adhara'], [17.6, -37.1, 1.6, 'Shaula'], [5.5, -1.2, 1.6, 'Mintaka'],
    [5.7, -1.9, 1.7, 'Alnitak'], [8.1, -47.3, 1.8, 'Naos'], [11.0, 61.8, 1.8, 'Dubhe'],
    [1.9, 63.7, 2.0, 'Schedar'], [0.7, -17.9, 2.0, 'Diphda'], [2.7, 89.3, 2.0, 'Polaris'],
    [0.0, 29.1, 2.1, 'Alpheratz'], [16.1, 19.8, 2.1, 'Alphecca'], [11.8, 14.6, 2.1, 'Denebola'],
    [5.4, 6.4, 2.2, 'Bellatrix'], [5.6, -0.3, 2.2, 'Alnilam'], [9.2, -43.4, 2.2, 'Avior'],
    [13.8, 49.3, 2.2, 'Alkaid'], [19.9, 35.1, 2.2, 'Delta Cygni'], [0.67, 60.7, 2.3, 'Tsih'],
    [1.6, 35.6, 2.3, 'Mirach'], [12.9, 55.9, 2.4, 'Alioth'], [11.9, 53.7, 2.4, 'Merak'],
    [12.3, 57.0, 2.4, 'Phad'], [23.1, 15.2, 2.4, 'Markab'], [0.15, 56.5, 2.5, 'Caph'],
    [19.5, 27.9, 2.5, 'Gienah'], [21.5, 9.9, 2.5, 'Enif'],
    [10.7, -17.0, 2.6, 'Alphard'], [11.2, 20.5, 2.6, 'Algieba'], [10.3, 19.8, 2.6, 'Zosma'],
    [1.43, 60.2, 2.7, 'Ruchbah'], [13.9, 18.4, 2.7, 'Vindemiatrix'], [18.9, 13.9, 2.7, 'Tarazed'],
    [20.4, 40.3, 2.8, 'Sadr'], [2.1, 23.5, 2.9, 'Almach'], [3.9, 24.1, 2.9, 'Alcyone'],
    [7.7, 5.2, 2.9, 'Gomeisa'], [4.9, 15.9, 3.0, 'Ain'], [7.6, 28.0, 1.6, 'Castor'],
    [17.9, 38.8, 3.1, 'Albireo'], [20.4, -47.3, 3.2, 'Peacock'], [2.29, 59.1, 3.4, 'Segin'],
    [0.2, 59.1, 2.3, 'Gamma Cas'], [0.8, 35.6, 2.8, 'Delta And'], [1.1, 15.9, 3.0, 'Epsilon Ari'],
    [1.7, -10.3, 2.9, 'Menkar'], [2.1, 42.3, 3.4, 'Gamma Per'], [2.3, 49.9, 1.8, 'Mirphak'],
    [2.7, 47.8, 3.1, 'Delta Per'], [3.1, 40.9, 2.8, 'Algol'], [3.4, 24.1, 2.9, 'Atlas'],
    [3.5, 24.4, 3.6, 'Merope'], [3.7, 24.1, 3.7, 'Electra'], [3.9, 23.9, 4.2, 'Maia'],
    [4.0, 15.6, 3.5, 'Theta Tau'], [4.3, 15.9, 3.4, 'Gamma Tau'], [4.6, 19.2, 3.6, 'Epsilon Tau'],
    [4.7, 28.6, 2.9, 'Beta Aur'], [5.0, 43.8, 2.7, 'Theta Aur'], [5.3, 45.9, 1.9, 'Capella'],
    [5.4, 28.6, 3.2, 'Iota Aur'], [5.6, -9.7, 2.8, 'Saiph'], [5.8, -2.6, 3.4, 'Eta Ori'],
    [6.0, 20.6, 3.5, 'Mebsuta'], [6.2, -17.1, 2.0, 'Mirzam'], [6.4, 4.1, 3.1, 'Delta CMi'],
    [6.8, 12.9, 3.8, 'Eta Gem'], [7.0, 20.6, 2.9, 'Wasat'], [7.2, -26.4, 1.5, 'Wezen'],
    [7.4, -29.3, 1.8, 'Aludra'], [7.8, 28.0, 3.6, 'Iota Gem'], [8.2, 9.2, 3.5, 'Zeta CMi'],
    [8.7, 11.9, 3.1, 'Asellus Borealis'], [8.8, 11.9, 4.0, 'Asellus Australis'],
    [9.3, 22.0, 3.5, 'Theta Cnc'], [9.5, -14.8, 3.3, 'Zeta Hya'], [10.1, 23.4, 3.8, 'Adhafera'],
    [10.3, 16.8, 2.6, 'Chertan'], [11.2, 15.4, 2.6, 'Ras Elased Australis'], [11.8, 20.2, 2.2, 'Coxa'],
    [12.3, -17.5, 2.9, 'Gamma Crv'], [12.5, -22.6, 2.7, 'Delta Crv'], [12.8, -16.5, 2.6, 'Gienah Corvi'],
    [13.0, 54.9, 3.3, 'Psi UMa'], [13.4, 54.9, 3.0, 'Mu UMa'], [13.8, -15.4, 2.8, 'Kraz'],
    [14.0, 51.7, 3.5, 'Talitha'], [14.3, 46.1, 3.1, 'Alkaphrah'], [14.8, 74.1, 2.1, 'Kochab'],
    [15.0, -58.7, 2.8, 'Menkent'], [15.3, 26.7, 2.2, 'Izar'], [15.6, 33.3, 2.7, 'Seginus'],
    [16.0, -11.2, 3.3, 'Eta Sco'], [16.5, -34.3, 2.4, 'Dschubba'], [16.8, -34.7, 2.9, 'Pi Sco'],
    [17.2, -43.0, 1.6, 'Sargas'], [17.3, -37.1, 1.9, 'Kappa Sco'], [17.6, 12.6, 3.0, 'Beta Her'],
    [17.9, 14.4, 3.4, 'Zeta Her'], [18.4, 21.8, 3.1, 'Pi Her'], [18.9, 4.7, 3.7, 'Theta Aql'],
    [19.1, 13.9, 3.2, 'Delta Aql'], [19.4, 10.6, 2.7, 'Deneb el Okab'], [19.8, 15.1, 3.4, 'Lambda Aql'],
    [20.2, 46.7, 2.9, 'Epsilon Cyg'], [20.8, 33.9, 3.8, 'Eta Cyg'], [21.2, 38.7, 3.2, 'Zeta Cyg'],
    [21.7, 17.3, 3.5, 'Epsilon Peg'], [22.1, 6.2, 3.5, 'Theta Aqr'], [22.4, 10.8, 2.9, 'Sadalmelik'],
    [22.9, -0.3, 2.9, 'Sadalsuud'], [23.1, 28.1, 2.5, 'Scheat'], [23.6, 15.2, 2.8, 'Algenib'],
  ];

  const CONSTELLATIONS = [
    {
      name: 'Orion',
      ra: 5.5,
      dec: 5,
      minFov: 30,
      stars: [
        [5.9, 7.4],
        [5.4, 6.4],
        [5.5, -1.2],
        [5.6, -0.3],
        [5.7, -1.9],
        [5.2, -8.2],
      ],
      lines: [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
        [3, 4],
        [4, 5],
        [3, 5],
      ],
    },
    {
      name: 'Ursa Major',
      ra: 11.0,
      dec: 55,
      minFov: 40,
      stars: [
        [11.0, 61.8],
        [11.9, 53.7],
        [12.3, 57.0],
        [12.9, 55.9],
        [13.8, 49.3],
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [0, 2],
      ],
    },
    {
      name: 'Cassiopeia',
      ra: 1.0,
      dec: 60,
      minFov: 35,
      stars: [
        [0.15, 56.5],
        [0.67, 60.7],
        [1.43, 60.2],
        [1.9, 63.7],
        [2.29, 59.1],
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
    },
    {
      name: 'Cygnus',
      ra: 20.5,
      dec: 40,
      minFov: 35,
      stars: [
        [20.7, 45.3],
        [20.4, 40.3],
        [19.9, 35.1],
        [19.5, 27.9],
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
      ],
    },
    {
      name: 'Leo',
      ra: 10.5,
      dec: 15,
      minFov: 35,
      stars: [
        [10.1, 11.9],
        [11.2, 20.5],
        [11.8, 14.6],
        [10.3, 19.8],
      ],
      lines: [
        [0, 1],
        [1, 3],
        [3, 2],
        [0, 3],
      ],
    },
  ];

  const DEEP_SKY_OBJECTS = [
    {
      name: 'Andromeda Galaxy',
      ra: 0.71,
      dec: 41.3,
      size: 3,
      color: '#a78bfa',
      type: 'galaxy',
    },
    {
      name: 'Orion Nebula',
      ra: 5.58,
      dec: -5.4,
      size: 1,
      color: '#ec4899',
      type: 'nebula',
    },
    {
      name: 'Pleiades',
      ra: 3.78,
      dec: 24.1,
      size: 2,
      color: '#60a5fa',
      type: 'cluster',
    },
    {
      name: 'Triangulum Galaxy',
      ra: 1.56,
      dec: 30.7,
      size: 1.1,
      color: '#8b5cf6',
      type: 'galaxy',
    },
    {
      name: 'Lagoon Nebula',
      ra: 18.05,
      dec: -24.4,
      size: 1.5,
      color: '#f472b6',
      type: 'nebula',
    },
    {
      name: 'Eagle Nebula',
      ra: 18.31,
      dec: -13.8,
      size: 0.5,
      color: '#fb7185',
      type: 'nebula',
    },
    {
      name: 'Ring Nebula',
      ra: 18.89,
      dec: 33.0,
      size: 0.025,
      color: '#c084fc',
      type: 'nebula',
    },
    {
      name: 'Hercules Cluster',
      ra: 16.69,
      dec: 36.5,
      size: 0.5,
      color: '#fbbf24',
      type: 'cluster',
    },
    {
      name: 'Wild Duck Cluster',
      ra: 18.85,
      dec: -6.3,
      size: 0.3,
      color: '#93c5fd',
      type: 'cluster',
    },
    {
      name: 'Omega Centauri',
      ra: 13.44,
      dec: -47.5,
      size: 0.6,
      color: '#fde047',
      type: 'cluster',
    },
    {
      name: 'Dumbbell Nebula',
      ra: 19.99,
      dec: 22.7,
      size: 0.13,
      color: '#a78bfa',
      type: 'nebula',
    },
    {
      name: 'Whirlpool Galaxy',
      ra: 13.49,
      dec: 47.2,
      size: 0.18,
      color: '#8b5cf6',
      type: 'galaxy',
    },
    {
      name: 'Beehive Cluster',
      ra: 8.67,
      dec: 19.7,
      size: 1.5,
      color: '#fbbf24',
      type: 'cluster',
    },
    {
      name: 'Double Cluster',
      ra: 2.35,
      dec: 57.1,
      size: 0.6,
      color: '#93c5fd',
      type: 'cluster',
    },
    {
      name: 'Crab Nebula',
      ra: 5.58,
      dec: 22.0,
      size: 0.1,
      color: '#fb7185',
      type: 'nebula',
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.fillStyle = '#000814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const fovHalfRad = ((fov / 2) * Math.PI) / 180;
      const scale = canvas.height / 2 / Math.tan(fovHalfRad);

      const projectToScreen = (ra, dec) => {
        const azimuth = ra * 15;
        const altitude = dec;

        let azDiff = azimuth - centerAz;
        while (azDiff <= -180) azDiff += 360;
        while (azDiff > 180) azDiff -= 360;

        const azRad = (azDiff * Math.PI) / 180;
        const altRad = (altitude * Math.PI) / 180;
        const centerAltRad = (centerDec * Math.PI) / 180;

        const x0 = Math.cos(altRad) * Math.sin(azRad);
        const y0 = Math.sin(altRad);
        const z0 = Math.cos(altRad) * Math.cos(azRad);

        const x_cam = x0;
        const y_cam = y0 * Math.cos(centerAltRad) - z0 * Math.sin(centerAltRad);
        const z_cam = y0 * Math.sin(centerAltRad) + z0 * Math.cos(centerAltRad);

        const visible = z_cam > 0;
        let screenX = 0;
        let screenY = 0;

        if (visible) {
          screenX = centerX + (x_cam / z_cam) * scale;
          screenY = centerY - (y_cam / z_cam) * scale;
        }

        return { x: screenX, y: screenY, visible };
      };

      STAR_DATA.forEach(([ra, dec, mag, name]) => {
        const pos = projectToScreen(ra, dec);
        if (!pos.visible) return;
        const { x, y } = pos;

        if (
          x >= -500 &&
          x <= canvas.width + 500 &&
          y >= -500 &&
          y <= canvas.height + 500
        ) {
          const size = Math.max(1.5, 5 - mag);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          if (mag < 1.5) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          if (mag < 2.5 && fov < 45 && name) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '13px sans-serif';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 4;
            ctx.fillText(name, x + 8, y - 8);
            ctx.shadowBlur = 0;
          }
        }
      });

      CONSTELLATIONS.forEach((constellation) => {
        if (fov < constellation.minFov) {

          ctx.strokeStyle = 'rgba(100, 180, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);

          constellation.lines.forEach(([startIdx, endIdx]) => {
            const startStar = constellation.stars[startIdx];
            const endStar = constellation.stars[endIdx];

            const startPos = projectToScreen(startStar[0], startStar[1]);
            const endPos = projectToScreen(endStar[0], endStar[1]);

            if (startPos.visible && endPos.visible) {
              ctx.beginPath();
              ctx.moveTo(startPos.x, startPos.y);
              ctx.lineTo(endPos.x, endPos.y);
              ctx.stroke();
            }
          });

          const pos = projectToScreen(constellation.ra, constellation.dec);
          if (!pos.visible) return;
          const { x, y } = pos;

          if (
            x >= -100 &&
            x <= canvas.width + 100 &&
            y >= -100 &&
            y <= canvas.height + 100
          ) {
            ctx.fillStyle = 'rgba(100, 180, 255, 0.8)';
            ctx.font = 'bold 18px serif';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 6;
            ctx.fillText(constellation.name, x, y);
            ctx.shadowBlur = 0;
          }
        }
      });

      DEEP_SKY_OBJECTS.forEach((obj) => {
        const pos = projectToScreen(obj.ra, obj.dec);
        if (!pos.visible) return;
        const { x, y } = pos;

        const radiusPixels = Math.tan(((obj.size / 2) * Math.PI) / 180) * scale;

        if (
          x >= -500 &&
          x <= canvas.width + 500 &&
          y >= -500 &&
          y <= canvas.height + 500 &&
          radiusPixels > 3
        ) {
          ctx.globalAlpha = 0.5;

          if (obj.type === 'galaxy') {
            const gradient = ctx.createRadialGradient(
              x,
              y,
              0,
              x,
              y,
              radiusPixels * 3
            );
            gradient.addColorStop(0, obj.color);
            gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.2)');
            gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(
              x,
              y,
              radiusPixels * 3,
              radiusPixels,
              Math.PI / 4,
              0,
              Math.PI * 2
            );
            ctx.fill();
          } else if (obj.type === 'nebula') {
            const gradient = ctx.createRadialGradient(
              x,
              y,
              0,
              x,
              y,
              radiusPixels
            );
            gradient.addColorStop(0, obj.color);
            gradient.addColorStop(0.6, 'rgba(236, 72, 153, 0.3)');
            gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radiusPixels, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;

          if (fov < 30 && radiusPixels > 15) {
            ctx.fillStyle = obj.color;
            ctx.font = 'bold 14px sans-serif';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 5;
            ctx.fillText(obj.name, x + radiusPixels + 8, y);
            ctx.shadowBlur = 0;
          }
        }
      });

      const centerAltRad = (centerDec * Math.PI) / 180;

      const horizonYOffset = Math.tan(centerAltRad) * scale;
      const horizonScreenY = centerY + horizonYOffset;

      const groundGradient = ctx.createLinearGradient(0, horizonScreenY, 0, canvas.height);
      groundGradient.addColorStop(0, 'rgba(15, 25, 20, 1)');
      groundGradient.addColorStop(0.3, 'rgba(12, 20, 15, 1)');
      groundGradient.addColorStop(0.7, 'rgba(8, 15, 10, 1)');
      groundGradient.addColorStop(1, 'rgba(5, 10, 8, 1)');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(
        0,
        horizonScreenY,
        canvas.width,
        canvas.height - horizonScreenY + 2000
      );

      ctx.fillStyle = 'rgba(10, 18, 12, 1)';
      ctx.beginPath();
      ctx.moveTo(0, horizonScreenY);

      for (let x = 0; x <= canvas.width; x += 50) {
        const hillHeight = Math.sin((x + centerAz * 10) / 150) * 8 +
                          Math.sin((x + centerAz * 5) / 80) * 5;
        ctx.lineTo(x, horizonScreenY + hillHeight);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(8, 15, 10, 1)';
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = horizonScreenY + Math.random() * (canvas.height - horizonScreenY);
        const width = 3 + Math.random() * 4;
        const height = 2 + Math.random() * 3;
        ctx.fillRect(x, y, width, height);
      }

      ctx.fillStyle = 'rgba(20, 30, 22, 1)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = horizonScreenY + Math.random() * (canvas.height - horizonScreenY);
        const width = 2 + Math.random() * 3;
        const height = 1 + Math.random() * 2;
        ctx.fillRect(x, y, width, height);
      }

      ctx.fillStyle = 'rgba(12, 12, 12, 1)';
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = horizonScreenY + Math.random() * (canvas.height - horizonScreenY);
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(25, 35, 28, 0.8)';
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * canvas.width;
        const y = horizonScreenY + Math.random() * (canvas.height - horizonScreenY) * 0.3;
        ctx.fillRect(x, y, 1, 1);
      }

      const glowGradient = ctx.createLinearGradient(0, horizonScreenY - 30, 0, horizonScreenY + 30);
      glowGradient.addColorStop(0, 'rgba(30, 50, 80, 0)');
      glowGradient.addColorStop(0.4, 'rgba(40, 60, 90, 0.08)');
      glowGradient.addColorStop(0.7, 'rgba(30, 50, 70, 0.1)');
      glowGradient.addColorStop(1, 'rgba(15, 25, 20, 0.05)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, horizonScreenY - 30, canvas.width, 60);

      ctx.strokeStyle = 'rgba(30, 45, 35, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonScreenY);
      ctx.lineTo(canvas.width, horizonScreenY);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let az = 0; az < 360; az += 15) {
        const ra = az / 15;
        const pos = projectToScreen(ra, 0);

        if (pos.visible) {
          const { x, y } = pos;
          if (x >= -50 && x <= canvas.width + 50) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();

            let label = '';
            if (az === 0) label = 'N';
            else if (az === 90) label = 'E';
            else if (az === 180) label = 'S';
            else if (az === 270) label = 'W';

            if (label) {
              const labelPos = projectToScreen(ra, 2);
              if (labelPos.visible) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(label, labelPos.x, labelPos.y);
              }
            }
          }
        }
      }

      const measurements = [
        { size: 1 / 60, label: "1' (arcmin)", color: '#8b5cf6' },
        { size: 1 / 3600, label: '1" (arcsec)', color: '#ec4899' },
      ];

      measurements.forEach((m) => {
        const radiusPixels = Math.tan(((m.size / 2) * Math.PI) / 180) * scale;
        if (radiusPixels > 5 && radiusPixels < canvas.height / 2) {
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radiusPixels, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = m.color;
          ctx.font = 'bold 14px monospace';
          ctx.fillText(m.label, centerX + radiusPixels + 10, centerY - 10);
          ctx.globalAlpha = 1.0;
        }
      });
    };

    render();

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;

      setFov((prev) => Math.max(0.001, Math.min(90, prev * zoomFactor)));
    };

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;

        const sensitivity = fov / canvas.height;
        const cosDec = Math.max(0.15, Math.cos((centerDec * Math.PI) / 180));

        const deltaAz = -dx * (sensitivity / cosDec);
        const deltaDec = dy * sensitivity;

        setCenterAz((prev) => (prev + deltaAz + 360) % 360);

        setCenterDec((prev) =>
          Math.max(-89.9, Math.min(89.9, prev + deltaDec))
        );
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
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
  }, [fov, centerAz, centerDec]);

  const getDisplayUnit = () => {
    if (fov >= 1) return { value: fov.toFixed(3), unit: '°', name: 'Degrees' };
    else if (fov >= 1 / 60)
      return { value: (fov * 60).toFixed(2), unit: "'", name: 'Arcminutes' };
    else
      return { value: (fov * 3600).toFixed(1), unit: '"', name: 'Arcseconds' };
  };

  const displayUnit = getDisplayUnit();

  return (
    <div className="night-sky-page">
      <Link to="/" className="back-button">← Home</Link>
      <div className="night-sky-container">
        <canvas
          ref={canvasRef}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />

        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-popup">
              <h2>How to Explore</h2>
              <div className="instructions-content">
                <div className="instruction-item">
                  <span className="instruction-icon">🖱️</span>
                  <p><strong>Scroll</strong> to zoom in and out</p>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">👆</span>
                  <p><strong>Click and drag</strong> to look around the sky</p>
                </div>
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

        <div className="info-panel">
          <h3>Field of View</h3>
          <div className="fov-value">
            {displayUnit.value}
            {displayUnit.unit}
          </div>
          <div className="unit-name">{displayUnit.name}</div>
        </div>

        {/* Zoom Slider - Left Side - Logarithmic Scale */}
        <div className="zoom-slider-container">
          <div className="zoom-label zoom-label-top">Max Zoom</div>
          <input
            type="range"
            min={Math.log10(0.001)}
            max={Math.log10(90)}
            step="0.01"
            value={Math.log10(90) + Math.log10(0.001) - Math.log10(fov)}
            onChange={(e) => setFov(Math.pow(10, Math.log10(90) + Math.log10(0.001) - parseFloat(e.target.value)))}
            className="zoom-slider"
            orient="vertical"
          />
          <div className="zoom-label zoom-label-bottom">Min Zoom</div>
        </div>
      </div>
    </div>
  );
};

export default NightSky;
