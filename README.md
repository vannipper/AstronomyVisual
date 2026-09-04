# Astronomy Visualized

An interactive web application for creating educational astronomy visualizations. Explore the cosmos through immersive simulations that demonstrate fundamental astronomical concepts.

## Features

### 🚀 Orbital Mechanics Simulator
Experience realistic Newtonian physics in space:
- Control a rocket with limited fuel using mouse-based thrust controls
- Navigate through a solar system with gravity assists from multiple planets
- Realistic gravity calculations using the inverse square law
- Time warp controls (0x to 64x speed) for efficient trajectory planning
- Right-click on orbital path to warp directly to positions
- Real-time orbital prediction showing your future trajectory
- Collision detection with planets and the sun (automatic reset)
- Real-time HUD showing fuel levels and distance traveled
- Challenge yourself to travel as far as possible with limited resources

**Physics Implementation:**
- Planets orbit the sun using calculated circular orbital velocities
- Rocket affected by gravitational forces from both the sun and planets
- Sphere of influence (SOI) system for planetary gravity transitions
- Simplified multi-body physics for stable, long-term simulations
- Predictive trajectory calculation showing 6000+ steps ahead

**Controls:**
- **Mouse Movement** - Aim rocket direction
- **Left Click / Hold** - Fire thrusters (consumes fuel)
- **Right Click on Orbital Line** - Warp to that position
- **Scroll Wheel** - Zoom in/out
- **< and >** - Decrease/increase time warp (0x, 1x, 2x, 4x, 8x, 16x, 32x, 64x)
- **R** - Reset simulation

### 🌌 Night Sky Viewer
Explore the night sky and understand celestial navigation:
- Pan around a realistic hemispherical star field with 130+ real stars from astronomical catalogs
- Interactive zoom with Field of View (FOV) display ranging from 180° to 1°
- Accurate constellation patterns with connecting lines:
  - Ursa Major (Big Dipper), Ursa Minor (Little Dipper)
  - Orion, Cassiopeia, Leo, Gemini
  - Cygnus, Lyra, Scorpius, and more
- Real astronomical data with right ascension and declination coordinates
- Star brightness scaled by actual magnitude values
- Intuitive click-and-drag navigation

**Educational Value:**
- Learn to identify major constellations in the night sky
- Understand celestial coordinate systems (RA/Dec)
- Visualize how field of view affects what you can see
- Experience how stars appear at different magnitudes

## Technology Stack

- **React 19.2.8** - Modern UI framework
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Canvas API** - High-performance rendering for physics simulations
- **CSS3** - Custom animations and responsive design
- **Optimizations** - Squared distance comparisons, cached predictions, pre-computed planet properties

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AstronomyVisualized.git
cd AstronomyVisualized
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Usage

### Orbital Mechanics Simulator
1. Click on "Orbital Mechanics" from the home page
2. Read the instructions popup and click "Start Simulation"
3. Move your mouse to aim the rocket
4. Left-click and hold to fire the thrusters (uses fuel)
5. Use time warp (< and > keys) to speed up or pause the simulation
6. Right-click on your predicted orbital line to warp to that position
7. Watch for red orbital lines indicating collision trajectories
8. Use gravity assists from planets to travel farther while conserving fuel
9. Press 'R' or click the reset button to restart
10. Press the home button to return to the main menu

### Night Sky Viewer
1. Click on "Night Sky" from the home page
2. Read the instructions popup and click "Start Exploring"
3. Scroll to zoom in and out (changes Field of View)
4. Click and drag to look around the sky
5. Identify constellations and named stars
6. Press the home button to return to the main menu

## Project Structure

```
AstronomyVisualized/
├── public/              # Static assets
├── src/
│   ├── pages/
│   │   ├── Home.jsx           # Landing page with visualization cards
│   │   ├── Home.css
│   │   ├── OrbitSim.jsx       # Orbital mechanics simulator
│   │   ├── OrbitSim.css
│   │   ├── NightSky.jsx       # Night sky viewer
│   │   └── NightSky.css
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Performance Optimizations

The Orbital Mechanics Simulator includes several performance optimizations:
- Predictive trajectory calculated every 3rd frame instead of every frame
- Squared distance comparisons to avoid expensive Math.sqrt() calls
- Pre-computed planet properties (mu, radiusSq, soiSq)
- Typed arrays for trajectory data storage
- Batched React state updates
- Responsive design for mobile and desktop

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- Additional simulators for other astronomical concepts (phases of the moon, eclipses, etc.)
- Scoring system and challenges for the orbital mechanics simulator
- More constellations from both hemispheres
- Deep sky objects (galaxies, nebulae, star clusters)
- Educational tooltips and guided tours
- Real-time sky view based on user location and time
- Multiplayer orbital racing challenges

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Real star data with accurate celestial coordinates (RA/Dec)
- Constellation patterns based on traditional asterisms
- Physics simulations based on Newtonian mechanics
- Inspired by the need for accessible, interactive astronomy education tools

## Author

Van Nipper

---

**Note:** This is an educational project designed to make astronomy concepts more accessible and engaging through interactive visualization.
