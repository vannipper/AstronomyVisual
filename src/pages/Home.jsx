import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const visualizations = [
    {
      id: 'orbit',
      title: 'Orbital Mechanics',
      path: '/orbit',
      color: '#3b82f6'
    },
    {
      id: 'angular',
      title: 'Angular Size',
      path: '/angular-size',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Astronomy Visualized</h1>
      </header>

      <main className="home-content">
        <div className="viz-grid">
          {visualizations.map((viz) => (
            <Link
              key={viz.id}
              to={viz.path}
              className="viz-card"
              style={{ '--card-color': viz.color }}
            >
              <div className="card-content">
                <h2>{viz.title}</h2>
              </div>
              <div className="card-accent" />
            </Link>
          ))}
        </div>
      </main>

      <footer className="home-footer">
        <p>Educational astronomical visualization platform</p>
      </footer>
    </div>
  );
}

export default Home;
