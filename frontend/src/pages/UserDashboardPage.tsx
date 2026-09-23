import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import { ReadingHistoryItem } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ZodiacBadge } from '../components/ZodiacBadge';
import {
  Sparkles,
  Compass,
  FileText,
  History,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const [recentReadings, setRecentReadings] = useState<ReadingHistoryItem[]>([]);
  const [totalReadings, setTotalReadings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const historyData = await api.astrology.getHistory({ page: 1, limit: 3 });
        setRecentReadings(historyData.items);
        setTotalReadings(historyData.total);
      } catch (err: any) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to fetch dashboard data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '2.25rem' }}>
              Welcome back, <span className="gradient-text">{user?.username}</span>
            </h1>
            <span className={`badge ${role === 'admin' ? 'badge-admin' : role === 'astrologer' ? 'badge-astrologer' : 'badge-user'}`}>
              {role}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your celestial overview and latest Vedic astrology readings.
          </p>
        </div>

        <Link to="/reading/new" className="btn btn-primary btn-lg">
          <Compass size={18} />
          Generate New Reading
        </Link>
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

      {/* Stats & Quick Actions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
      }}>
        {/* Total Readings */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.22), rgba(0, 119, 182, 0.22))',
            border: '1px solid rgba(0, 180, 216, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00B4D8',
          }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Readings
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isLoading ? '...' : totalReadings}
            </div>
          </div>
        </div>

        {/* User Role Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(144, 224, 239, 0.2), rgba(0, 180, 216, 0.2))',
            border: '1px solid rgba(144, 224, 239, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#90E0EF',
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account Tier
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span className={`badge ${role === 'admin' ? 'badge-admin' : role === 'astrologer' ? 'badge-astrologer' : 'badge-user'}`}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Role Portal Shortcuts if Astrologer/Admin */}
        {(role === 'astrologer' || role === 'admin') && (
          <Link
            to="/astrologer"
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              border: '1px solid rgba(0, 180, 216, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 180, 216, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00B4D8',
              }}>
                <Eye size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#CAF0F8', fontSize: '0.95rem' }}>Astrologer Queue</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review pending readings</div>
              </div>
            </div>
            <ArrowRight size={18} color="#00B4D8" />
          </Link>
        )}

        {role === 'admin' && (
          <Link
            to="/admin/users"
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              border: '1px solid rgba(0, 119, 182, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 119, 182, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#90E0EF',
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#CAF0F8', fontSize: '0.95rem' }}>Admin Portal</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage system users</div>
              </div>
            </div>
            <ArrowRight size={18} color="#90E0EF" />
          </Link>
        )}
      </div>

      {/* Recent Readings Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <h2 style={{ fontSize: '1.4rem' }}>Recent Readings</h2>
          {totalReadings > 0 && (
            <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: '#90E0EF' }}>
              View all history <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading your recent readings..." />
        ) : recentReadings.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'rgba(0, 180, 216, 0.1)',
              border: '1px solid rgba(0, 180, 216, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00B4D8',
              marginBottom: '1rem',
            }}>
              <History size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#CAF0F8' }}>No Readings Generated Yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
              Enter your birth date, time, and coordinates to calculate your celestial Vedic profile.
            </p>
            <Link to="/reading/new" className="btn btn-primary">
              <Compass size={18} />
              Generate Your First Reading
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentReadings.map((reading) => {
              const formattedDate = new Date(reading.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={reading.id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(3, 8, 48, 0.7)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}>
                        #{reading.id}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Calendar size={15} />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {reading.astrologer_note ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={13} />
                        Astrologer Reviewed
                      </span>
                    ) : (
                      <span className="badge badge-user">Standard Reading</span>
                    )}
                  </div>

                  {/* Badges row */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    marginTop: '1rem',
                  }}>
                    {reading.zodiac_sign && <ZodiacBadge label="Zodiac" value={reading.zodiac_sign} type="zodiac" />}
                    {reading.moon_sign && <ZodiacBadge label="Moon Sign" value={reading.moon_sign} type="moon" />}
                    {reading.nakshatra && <ZodiacBadge label="Nakshatra" value={reading.nakshatra} type="nakshatra" />}
                    {reading.ascendant && <ZodiacBadge label="Ascendant" value={reading.ascendant} type="ascendant" />}
                  </div>

                  {/* Astrologer note excerpt if available */}
                  {reading.astrologer_note && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(0, 180, 216, 0.1)',
                      border: '1px solid rgba(0, 180, 216, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#CAF0F8',
                    }}>
                      <strong style={{ color: '#90E0EF' }}>Astrologer Note: </strong>
                      {reading.astrologer_note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
