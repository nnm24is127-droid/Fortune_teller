import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { PaginatedAstrologerReadings } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import {
  Eye,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
} from 'lucide-react';

export const AstrologerDashboardPage: React.FC = () => {
  const [data, setData] = useState<PaginatedAstrologerReadings | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unreviewed' | 'reviewed'>('all');
  const [sortField, setSortField] = useState<'created_at' | 'id'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const isReviewedParam =
      reviewFilter === 'reviewed' ? true : reviewFilter === 'unreviewed' ? false : undefined;

    try {
      const response = await api.astrologer.getQueue({
        page,
        limit,
        is_reviewed: isReviewedParam,
        sort: sortField,
        order: sortOrder,
      });
      setData(response);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch astrologer review queue.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, reviewFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-full)', color: '#fcd34d', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <Eye size={13} />
            Astrologer Portal
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            Reading <span className="gradient-gold-text">Review Queue</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Review user-generated Kundali readings and attach professional astrological notes.
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          alignItems: 'end',
        }}>
          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} /> Review Status
            </label>
            <select
              className="form-select"
              value={reviewFilter}
              onChange={(e) => {
                setReviewFilter(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">All Readings</option>
              <option value="unreviewed">Pending Review (Unreviewed)</option>
              <option value="reviewed">Completed (Reviewed)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowUpDown size={14} /> Sort By
            </label>
            <select
              className="form-select"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="created_at">Submission Date</option>
              <option value="id">Reading ID</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Order</label>
            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
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

      {/* Table of Readings */}
      {isLoading ? (
        <LoadingSpinner message="Fetching review queue..." />
      ) : !data || data.items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Eye size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Readings in Queue</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto' }}>
            No readings matched the current status filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Placements</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => {
                  const formattedDate = new Date(r.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{r.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          <User size={15} color="#c4b5fd" />
                          {r.username}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {r.zodiac_sign && <span className="badge badge-user">{r.zodiac_sign}</span>}
                          {r.moon_sign && <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc' }}>Moon: {r.moon_sign}</span>}
                          {r.nakshatra && <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>{r.nakshatra}</span>}
                        </div>
                      </td>
                      <td>
                        {r.is_reviewed ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Reviewed
                          </span>
                        ) : (
                          <span className="badge badge-astrologer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formattedDate}
                      </td>
                      <td>
                        <Link
                          to={`/astrologer/readings/${r.id}`}
                          className="btn btn-amber btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          Review <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={data.page}
            totalPages={data.pages}
            totalItems={data.total}
            limit={data.limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
