import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 19, 0.95)',
      padding: '3rem 0 2rem 0',
      color: 'var(--text-secondary)',
      fontSize: '0.875rem',
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="#a78bfa" />
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                Astro<span className="gradient-text">Teller</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '0.85rem' }}>
              Production-grade Vedic astrology platform powered by FastAPI and the Navamsha Astrology engine.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>Architecture</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li>FastAPI + Pydantic v2</li>
              <li>SQLAlchemy ORM + SQLite</li>
              <li>Argon2 Password Hashing</li>
              <li>Role-Based Access Control</li>
            </ul>
          </div>

          {/* Disclaimer Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
              <Shield size={16} />
              Educational & Entertainment Notice
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              AstroTeller is intended for entertainment, education, and personal self-reflection. It does not provide scientifically validated predictions or professional financial/medical advice.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            &copy; {new Date().getFullYear()} AstroTeller. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with <Heart size={14} color="#f43f5e" /> for clean full-stack engineering.
          </div>
        </div>
      </div>
    </footer>
  );
};
