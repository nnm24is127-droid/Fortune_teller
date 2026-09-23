import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { PaginatedReadingHistory, StructuredReading, AstrologyInterpretation } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import { ZodiacBadge } from '../components/ZodiacBadge';
import {
  History,
  Compass,
  Filter,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Heart,
  Briefcase,
} from 'lucide-react';

const MOON_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const ReadingHistoryPage: React.FC = () => {
  const [data, setData] = useState<PaginatedReadingHistory | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [moonSign, setMoonSign] = useState<string>('');
  const [sortField, setSortField] = useState<'created_at' | 'id'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.astrology.getHistory({
        page,
        limit,
        moon_sign: moonSign || undefined,
        sort: sortField,
        order: sortOrder,
      });
      setData(response);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch reading history.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, moonSign, sortField, sortOrder]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <History size={28} color="#a78bfa" />
            Reading <span className="gradient-text">History</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Explore your past Vedic calculations, AI interpretations, and astrologer review notes.
          </p>
        </div>

        <Link to="/reading/new" className="btn btn-primary">
          <Compass size={18} />
          New Reading
        </Link>
      </div>

      {/* Filters & Sorting Controls */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          alignItems: 'end',
        }}>
          {/* Moon Sign Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} /> Filter by Moon Sign
            </label>
            <select
              className="form-select"
              value={moonSign}
              onChange={(e) => {
                setMoonSign(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Moon Signs</option>
              {MOON_SIGNS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowUpDown size={14} /> Sort Field
            </label>
            <select
              className="form-select"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as 'created_at' | 'id');
                setPage(1);
              }}
            >
              <option value="created_at">Date Created</option>
              <option value="id">Reading ID</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Order</label>
            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc');
                setPage(1);
              }}
            >
              <option value="desc">Newest First (Descending)</option>
              <option value="asc">Oldest First (Ascending)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
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

      {/* Content list */}
      {isLoading ? (
        <LoadingSpinner message="Loading your reading history..." />
      ) : !data || data.items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <History size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Readings Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
            {moonSign ? `No readings found for Moon sign "${moonSign}". Try clearing the filter.` : 'You haven\'t created any readings yet.'}
          </p>
          <Link to="/reading/new" className="btn btn-primary">
            <Compass size={18} />
            Generate a Reading
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {data.items.map((item) => {
            const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const isExpanded = expandedId === item.id;
            const r = (typeof item.reading === 'object' ? item.reading : {}) as Partial<AstrologyInterpretation & StructuredReading>;

            const hasGeminiFields = Boolean(r?.personality || r?.strengths || r?.explanation);
            const strengths = Array.isArray(r?.strengths) ? r.strengths : [];
            const reflections = Array.isArray(r?.areas_for_reflection) ? r.areas_for_reflection : [];

            return (
              <div key={item.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.4rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}>
                      #{item.id}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Calendar size={15} />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {item.astrologer_note ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={13} />
                        Reviewed
                      </span>
                    ) : (
                      <span className="badge badge-user">Standard</span>
                    )}

                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem 0.75rem' }}
                    >
                      {isExpanded ? (
                        <>
                          Hide Details <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Badges preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '1rem' }}>
                  {item.zodiac_sign && <ZodiacBadge label="Zodiac" value={item.zodiac_sign} type="zodiac" />}
                  {item.moon_sign && <ZodiacBadge label="Moon Sign" value={item.moon_sign} type="moon" />}
                  {item.nakshatra && <ZodiacBadge label="Nakshatra" value={item.nakshatra} type="nakshatra" />}
                  {item.ascendant && <ZodiacBadge label="Ascendant" value={item.ascendant} type="ascendant" />}
                </div>

                {/* Astrologer note alert */}
                {item.astrologer_note && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.85rem 1.15rem',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: '#fef3c7',
                  }}>
                    <strong style={{ color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      <User size={14} /> Astrologer Note:
                    </strong>
                    {item.astrologer_note}
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}>
                    {r.summary && (
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#c4b5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={16} /> Summary
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {r.summary}
                        </p>
                      </div>
                    )}

                    {hasGeminiFields ? (
                      <>
                        {r.personality && (
                          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <h5 style={{ fontSize: '0.85rem', color: '#7dd3fc', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <User size={14} /> Personality & Core Self
                            </h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.personality}</p>
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                          {strengths.length > 0 && (
                            <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <h5 style={{ fontSize: '0.85rem', color: '#34d399', marginBottom: '0.4rem' }}>Key Strengths</h5>
                              <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                              </ul>
                            </div>
                          )}

                          {reflections.length > 0 && (
                            <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                              <h5 style={{ fontSize: '0.85rem', color: '#fcd34d', marginBottom: '0.4rem' }}>Areas for Reflection</h5>
                              <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {reflections.map((rf, idx) => <li key={idx}>{rf}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                          {r.relationships && (
                            <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                              <h5 style={{ fontSize: '0.85rem', color: '#f472b6', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Heart size={14} /> Relationships
                              </h5>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.relationships}</p>
                            </div>
                          )}

                          {r.career && (
                            <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                              <h5 style={{ fontSize: '0.85rem', color: '#6ee7b7', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Briefcase size={14} /> Career & Vocation
                              </h5>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.career}</p>
                            </div>
                          )}
                        </div>

                        {r.explanation && (
                          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <h5 style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '0.25rem' }}>Chart Explanation</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.explanation}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Legacy Fallback */
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        {r.sun_interpretation && (
                          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <h5 style={{ fontSize: '0.85rem', color: '#fcd34d', marginBottom: '0.25rem' }}>Sun Interpretation</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.sun_interpretation}</p>
                          </div>
                        )}
                        {r.moon_interpretation && (
                          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <h5 style={{ fontSize: '0.85rem', color: '#7dd3fc', marginBottom: '0.25rem' }}>Moon Interpretation</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.moon_interpretation}</p>
                          </div>
                        )}
                        {r.nakshatra_interpretation && (
                          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <h5 style={{ fontSize: '0.85rem', color: '#f472b6', marginBottom: '0.25rem' }}>Nakshatra Influence</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.nakshatra_interpretation}</p>
                          </div>
                        )}
                        {r.ascendant_interpretation && (
                          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <h5 style={{ fontSize: '0.85rem', color: '#6ee7b7', marginBottom: '0.25rem' }}>Ascendant / Lagna</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.ascendant_interpretation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={data.page}
            totalPages={data.pages}
            totalItems={data.total}
            limit={data.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};
