import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="container" style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
    }}>
      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{
          width: '4.5rem',
          height: '4.5rem',
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fda4af',
          marginBottom: '1.5rem',
        }}>
          <ShieldAlert size={36} />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Access Restricted</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
          You do not have the required permissions to view this celestial chamber. This page requires elevated role privileges.
        </p>

        <div style={{
          padding: '0.85rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
        }}>
          Logged in as <strong>{user?.username}</strong> (Current Role: <span className="badge badge-user">{role}</span>)
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary">
            <Home size={16} />
            Return to Dashboard
          </Link>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};
