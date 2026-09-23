import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container" style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
    }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{
          fontSize: '5rem',
          fontWeight: 900,
          fontFamily: 'var(--font-display)',
          lineHeight: 1,
          marginBottom: '1rem',
        }}>
          <span className="gradient-text">404</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Lost in the Cosmos</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          The celestial coordinates you are searching for do not exist or have shifted out of alignment.
        </p>

        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Return to AstroTeller
        </Link>
      </div>
    </div>
  );
};
