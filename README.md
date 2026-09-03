# Astronomy Visualized

An interactive web application for creating educational astronomy visualizations. Explore the cosmos through immersive simulations that demonstrate fundamental astronomical concepts.

## Features

### 🚀 Orbital Mechanics Simulator
Experience realistic Newtonian physics in space:
- Control a rocket with limited fuel using mouse-based thrust controls
- Navigate through a solar system with gravity assists from multiple planets
- Realistic gravity calculations using the inverse square law
- Real-time HUD showing fuel levels and distance traveled
- Challenge yourself to travel as far as possible with limited resources

**Physics Implementation:**
- Planets orbit the sun using calculated circular orbital velocities
- Rocket affected by gravitational forces from both the sun and planets
- Simplified multi-body physics for stable, long-term simulations

### 🌌 Night Sky Viewer (Angular Size Simulator)
Explore the night sky and understand angular measurements:
- Pan around a realistic star field with 27 bright stars from the Yale Bright Star Catalog
- Zoom in and out to see angular measurements from degrees to arcseconds
- View real deep sky objects including:
  - Andromeda Galaxy
  - Orion Nebula
  - Pleiades Star Cluster
- Visual measurement overlays for 1°, 1' (arcminute), and 1" (arcsecond)
- Dynamic unit switching based on zoom level

**Educational Value:**
- Understand the scale of celestial objects
- Learn about angular measurements used in astronomy
- See how objects appear at different magnifications

## Technology Stack

- **React 19.2.8** - Modern UI framework
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Canvas API** - High-performance rendering for physics simulations
- **CSS3** - Custom animations and glassmorphic design

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
2. Read the instructions popup and click "Begin Simulation"
3. Move your mouse to aim the rocket
4. Click to fire the thrusters (uses fuel)
5. Use gravity assists from planets to travel farther
6. Press 'R' or click the reset button to restart

### Night Sky Viewer
1. Click on "Angular Size" from the home page
2. Read the instructions popup and click "Start Exploring"
3. Scroll to zoom in and out
4. Click and drag to look around the sky
5. Observe how angular measurements scale with zoom level

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
│   │   ├── AngularSize.jsx    # Night sky viewer
│   │   └── AngularSize.css
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- Additional simulators for other astronomical concepts
- Scoring system for the orbital mechanics simulator
- More deep sky objects and constellations
- Mobile-responsive controls
- Save/load simulation states
- Educational tooltips and guided tours

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Star data from the Yale Bright Star Catalog
- Celestial object positions from astronomical databases
- Inspired by the need for accessible, interactive astronomy education tools

## Author

Van Nipper

---

**Note:** This is an educational project designed to make astronomy concepts more accessible and engaging through interactive visualization.
