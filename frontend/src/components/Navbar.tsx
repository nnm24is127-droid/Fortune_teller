import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Compass,
  History,
  User,
  ShieldCheck,
  Eye,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const roleBadgeClass =
    role === 'admin'
      ? 'badge-admin'
      : role === 'astrologer'
      ? 'badge-astrologer'
      : 'badge-user';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 9, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.25rem',
      }}>
        {/* Brand */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)',
            boxShadow: '0 0 15px var(--primary-glow)',
            color: '#fff',
          }}>
            <Sparkles size={20} />
          </div>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            color: '#fff',
          }}>
            Astro<span className="gradient-text">Teller</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive('/dashboard') ? '#CAF0F8' : 'var(--text-secondary)',
                }}
              >
                <LayoutDashboard size={16} color={isActive('/dashboard') ? '#00B4D8' : undefined} />
                Dashboard
              </Link>

              <Link
                to="/reading/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive('/reading/new') ? '#CAF0F8' : 'var(--text-secondary)',
                }}
              >
                <Compass size={16} color={isActive('/reading/new') ? '#00B4D8' : undefined} />
                New Reading
              </Link>

              <Link
                to="/history"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive('/history') ? '#CAF0F8' : 'var(--text-secondary)',
                }}
              >
                <History size={16} color={isActive('/history') ? '#00B4D8' : undefined} />
                History
              </Link>

              {(role === 'astrologer' || role === 'admin') && (
                <Link
                  to="/astrologer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: isActive('/astrologer') ? '#CAF0F8' : 'var(--text-secondary)',
                  }}
                >
                  <Eye size={16} color={isActive('/astrologer') ? '#90E0EF' : undefined} />
                  Review Queue
                </Link>
              )}

              {role === 'admin' && (
                <Link
                  to="/admin/users"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: isActive('/admin/users') ? '#CAF0F8' : 'var(--text-secondary)',
                  }}
                >
                  <ShieldCheck size={16} color={isActive('/admin/users') ? '#0077B6' : undefined} />
                  User Admin
                </Link>
              )}

              {/* User Profile & Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-subtle)' }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                  }}>
                    <User size={15} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user?.username}
                    </span>
                    <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      {role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 0.65rem' }}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div style={{
          background: 'var(--bg-dark)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <User size={18} />
                <span style={{ fontWeight: 600 }}>{user?.username}</span>
                <span className={`badge ${roleBadgeClass}`}>{role}</span>
              </div>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/reading/new" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={18} /> Generate Reading
              </Link>
              <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} /> Reading History
              </Link>
              {(role === 'astrologer' || role === 'admin') && (
                <Link to="/astrologer" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d' }}>
                  <Eye size={18} /> Astrologer Queue
                </Link>
              )}
              {role === 'admin' && (
                <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6' }}>
                  <ShieldCheck size={18} /> User Management
                </Link>
              )}
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-secondary">
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary">
                <UserPlus size={16} /> Get Started
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
