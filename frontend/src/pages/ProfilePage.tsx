import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import { User } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  RotateCcw,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user: authUser, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<User | null>(authUser);
  const [isLoading, setIsLoading] = useState<boolean>(!authUser);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.users.getMe();
      setProfile(data);
      await refreshProfile();
      showToast('Profile refreshed successfully.', 'info');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load user profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authUser) {
      loadProfile();
    }
  }, [authUser]);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving your profile..." />;
  }

  const role = profile?.role || 'user';
  const roleBadgeClass =
    role === 'admin'
      ? 'badge-admin'
      : role === 'astrologer'
      ? 'badge-astrologer'
      : 'badge-user';

  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '720px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <UserIcon size={28} color="#a78bfa" />
            User <span className="gradient-text">Profile</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Your account identity and role authorization settings.
          </p>
        </div>

        <button onClick={loadProfile} className="btn btn-secondary btn-sm">
          <RotateCcw size={15} />
          Refresh Profile
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fda4af',
          marginBottom: '2rem',
        }}>
          {error}
        </div>
      )}

      {profile && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {/* Avatar and Primary Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: '0 0 25px var(--primary-glow)',
            }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{profile.username}</h2>
                <span className={`badge ${roleBadgeClass}`}>
                  {role}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={15} /> {profile.email}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                User Identifier
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                #{profile.id}
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} /> Member Since
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Security & Access Box */}
          <div style={{
            padding: '1.25rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
          }}>
            <Shield size={20} color="#818cf8" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#c4b5fd', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Role-Based Access Policy
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Your current role is <strong>{role}</strong>. Role upgrades must be authorized and applied by a system Administrator.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
