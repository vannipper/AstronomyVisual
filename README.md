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
2. Read the instructions popup and click "Start Simulation"
3. Move your mouse to aim the rocket
4. Click and hold to fire the thrusters (uses fuel)
5. Use gravity assists from planets to travel farther
6. Press 'R' or click the reset button to restart
7. Press the "← Home" button to return to the main menu

### Night Sky Viewer
1. Click on "Night Sky" from the home page
2. Read the instructions popup and click "Start Exploring"
3. Scroll to zoom in and out (changes Field of View)
4. Click and drag to look around the sky
5. Identify constellations and named stars
6. Press the "← Home" button to return to the main menu

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- Additional simulators for other astronomical concepts (phases of the moon, eclipses, etc.)
- Scoring system and challenges for the orbital mechanics simulator
- More constellations from both hemispheres
- Deep sky objects (galaxies, nebulae, star clusters)
- Mobile-responsive touch controls
- Save/load simulation states
- Educational tooltips and guided constellation tours
- Real-time sky view based on user location and time

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
