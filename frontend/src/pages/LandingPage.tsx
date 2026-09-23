import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Compass,
  Moon,
  Sun,
  ShieldCheck,
  Eye,
  Database,
  Lock,
  ArrowRight,
  Star,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '6rem 0 5rem 0',
        textAlign: 'center',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(0, 180, 216, 0.14)',
            border: '1px solid rgba(0, 180, 216, 0.35)',
            borderRadius: 'var(--radius-full)',
            color: '#CAF0F8',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
          }}>
            <Sparkles size={16} color="#00B4D8" />
            <span>Production-Grade Vedic Astrology & AI Reflections</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto 1.5rem auto',
          }}>
            Discover Your Celestial Blueprint with <span className="gradient-text">AstroTeller</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6,
          }}>
            Generate accurate Vedic astrology readings, compute planetary positions (Sun, Moon, Nakshatra, Ascendant), and receive structured interpretations.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Feature Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '5rem',
            textAlign: 'left',
          }}>
            <div className="glass-card">
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.22), rgba(0, 119, 182, 0.22))',
                border: '1px solid rgba(0, 180, 216, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CAF0F8',
                marginBottom: '1.25rem',
              }}>
                <Sun size={24} color="#00B4D8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#CAF0F8' }}>Accurate Birth Charts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Computes planetary degrees, Sun & Moon zodiac placements, Nakshatra, and Ascendant (Lagna) using the Navamsha Astrology API.
              </p>
            </div>

            <div className="glass-card">
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(144, 224, 239, 0.2), rgba(0, 180, 216, 0.2))',
                border: '1px solid rgba(144, 224, 239, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#90E0EF',
                marginBottom: '1.25rem',
              }}>
                <Compass size={24} color="#90E0EF" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#CAF0F8' }}>AI & Structured Synthesis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Empathetic psychological reflection, strengths, growth areas, and life path guidance synthesized into clear, modular cards.
              </p>
            </div>

            <div className="glass-card">
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(0, 119, 182, 0.3), rgba(3, 4, 94, 0.5))',
                border: '1px solid rgba(0, 180, 216, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CAF0F8',
                marginBottom: '1.25rem',
              }}>
                <Eye size={24} color="#00B4D8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#CAF0F8' }}>Astrologer Review Queue</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Professional astrologers can review submitted readings, append personalized notes, and mark readings as formally reviewed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Control Showcase */}
      <section style={{
        padding: '5rem 0',
        background: 'rgba(3, 4, 94, 0.25)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
              Engineered with Robust <span className="gradient-text">Role-Based Access</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              AstroTeller enforces security and separation of concerns across three distinct user roles.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {/* User */}
            <div className="glass-card" style={{ borderTop: '3px solid #00B4D8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-user">Role: User</span>
                <Moon size={20} color="#00B4D8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#CAF0F8' }}>Self-Service Readings</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> Generate birth readings anytime</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> View private reading history & filters</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> View attached astrologer notes</li>
              </ul>
            </div>

            {/* Astrologer */}
            <div className="glass-card" style={{ borderTop: '3px solid #90E0EF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-astrologer">Role: Astrologer</span>
                <Star size={20} color="#90E0EF" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#CAF0F8' }}>Professional Reviewer</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> Access global pending review queue</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> Inspect birth data & chart profile</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> Add expert interpretation notes</li>
              </ul>
            </div>

            {/* Admin */}
            <div className="glass-card" style={{ borderTop: '3px solid #0077B6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-admin">Role: Admin</span>
                <ShieldCheck size={20} color="#CAF0F8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#CAF0F8' }}>System Administration</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> Full user management & search</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> Upgrade / demote user roles</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#34d399" /> System health & readiness probes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Tech Stack Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
            padding: '3rem',
            border: '1px solid var(--border-highlight)',
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00B4D8', marginBottom: '0.75rem', fontWeight: 600 }}>
                <Lock size={18} />
                <span>Zero Secrets Compromise</span>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Security & Privacy First</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                User passwords are cryptographic hashes (Argon2id) and never stored in plaintext. JWT tokens are verified on every private endpoint with explicit role guards.
              </p>
              <Link to="/register" className="btn btn-primary">
                Create Your Account Now
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(3, 4, 94, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <Database size={24} color="#00B4D8" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: '#CAF0F8' }}>SQLAlchemy + SQLite Persistence</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Persistent storage mounted via Docker volume.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(3, 4, 94, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <Sparkles size={24} color="#90E0EF" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: '#CAF0F8' }}>FastAPI + Pydantic v2</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automatic schema validation and OpenAPI doc generation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
