import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  ShieldCheck,
  Users,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<{ status: string; database: string } | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const [health, users] = await Promise.allSettled([
          api.health.checkReady(),
          api.admin.getUsers({ page: 1, limit: 1 }),
        ]);

        if (health.status === 'fulfilled') {
          setHealthStatus(health.value);
        } else {
          setHealthStatus({ status: 'offline', database: 'unreachable' });
        }

        if (users.status === 'fulfilled') {
          setTotalUsers(users.value.total);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.65rem',
          background: 'rgba(236, 72, 153, 0.15)',
          borderRadius: 'var(--radius-full)',
          color: '#f472b6',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
        }}>
          <ShieldCheck size={13} />
          Administration
        </div>
        <h1 style={{ fontSize: '2rem' }}>
          System <span className="gradient-text">Administration Portal</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Manage user accounts, assign system roles, and inspect database connectivity.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Checking system diagnostics..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {/* Total Users */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(236, 72, 153, 0.15)',
                border: '1px solid rgba(236, 72, 153, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f472b6',
              }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Registered Users
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                  {totalUsers !== null ? totalUsers : '—'}
                </div>
              </div>
            </div>

            {/* Health / Readiness Probe */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6ee7b7',
              }}>
                <Activity size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Readiness Probe
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  {healthStatus?.database === 'ok' ? (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={12} /> Database Connected
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af' }}>
                      <AlertTriangle size={12} /> Issue Detected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Security Guard */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}>
                <Lock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Sole Admin Protection
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#a5b4fc', marginTop: '0.2rem' }}>
                  Enforced at Database Layer
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            <Link
              to="/admin/users"
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2rem',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>User Management</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Browse accounts, search by email, and modify RBAC permissions.
                  </p>
                </div>
              </div>
              <ArrowRight size={20} color="#a78bfa" />
            </Link>

            <Link
              to="/astrologer"
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2rem',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--amber-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e1b4b',
                }}>
                  <Eye size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Astrologer Queue</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Review submitted readings and write notes.
                  </p>
                </div>
              </div>
              <ArrowRight size={20} color="#f59e0b" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
