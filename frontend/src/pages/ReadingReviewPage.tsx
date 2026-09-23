import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { AstrologerReadingDetail, AstrologyInterpretation, StructuredReading } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ZodiacBadge } from '../components/ZodiacBadge';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  Send,
  MessageSquare,
} from 'lucide-react';

export const ReadingReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [reading, setReading] = useState<AstrologerReadingDetail | null>(null);
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.astrologer.getReadingDetail(parseInt(id, 10));
      setReading(data);
      if (data.astrologer_note) {
        setNote(data.astrologer_note);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch reading details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanNote = note.trim();
    if (cleanNote.length < 5) {
      setFormError('Note must be at least 5 characters long.');
      return;
    }
    if (cleanNote.length > 2000) {
      setFormError('Note cannot exceed 2000 characters.');
      return;
    }

    if (!id) return;

    setIsSubmitting(true);
    try {
      const updated = await api.astrologer.updateNote(parseInt(id, 10), cleanNote);
      setReading(updated);
      showToast('Astrological review note saved successfully! 🔮', 'success');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save review note.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading reading for review..." />;
  }

  if (error || !reading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px' }}>
        <Link to="/astrologer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Review Queue
        </Link>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#fda4af', marginBottom: '1rem' }}>{error || 'Reading not found'}</p>
          <Link to="/astrologer" className="btn btn-secondary">
            Return to Queue
          </Link>
        </div>
      </div>
    );
  }

  const r = (typeof reading.reading === 'object' ? reading.reading : {}) as Partial<AstrologyInterpretation & StructuredReading>;
  const hasGeminiFields = Boolean(r?.personality || r?.strengths || r?.explanation);
  const strengths = Array.isArray(r?.strengths) ? r.strengths : [];
  const reflections = Array.isArray(r?.areas_for_reflection) ? r.areas_for_reflection : [];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/astrologer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Review Queue
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700 }}>
            Reading #{reading.id}
          </span>
          {reading.astrologer_note ? (
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> Reviewed
            </span>
          ) : (
            <span className="badge badge-astrologer">Pending Review</span>
          )}
        </div>
      </div>

      {/* User & Birth Data Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c4b5fd' }}>
          <User size={18} /> User & Birth Information
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Username</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{reading.username}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{reading.user_email}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={13} /> Birth Date
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {reading.birth_year}-{String(reading.birth_month).padStart(2, '0')}-{String(reading.birth_date).padStart(2, '0')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} /> Birth Time
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {String(reading.birth_hours).padStart(2, '0')}:{String(reading.birth_minutes).padStart(2, '0')} (UTC {reading.timezone && reading.timezone >= 0 ? `+${reading.timezone}` : reading.timezone})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin size={13} /> Coordinates
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Lat: {reading.latitude}, Lon: {reading.longitude}
            </div>
          </div>
        </div>

        {/* Placements Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          {reading.zodiac_sign && <ZodiacBadge label="Zodiac" value={reading.zodiac_sign} type="zodiac" />}
          {reading.moon_sign && <ZodiacBadge label="Moon Sign" value={reading.moon_sign} type="moon" />}
          {reading.nakshatra && <ZodiacBadge label="Nakshatra" value={reading.nakshatra} type="nakshatra" />}
          {reading.ascendant && <ZodiacBadge label="Ascendant" value={reading.ascendant} type="ascendant" />}
        </div>
      </div>

      {/* Generated Reading Content */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d' }}>
          <FileText size={18} /> Astrology Interpretation & Insights
        </h2>

        {r.summary && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Summary</h4>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{r.summary}</p>
          </div>
        )}

        {hasGeminiFields ? (
          <>
            {r.personality && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#7dd3fc', marginBottom: '0.35rem' }}>Personality & Core Self</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.personality}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {strengths.length > 0 && (
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h5 style={{ fontSize: '0.85rem', color: '#34d399', marginBottom: '0.4rem' }}>Key Strengths</h5>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {strengths.map((st, i) => <li key={i}>{st}</li>)}
                  </ul>
                </div>
              )}

              {reflections.length > 0 && (
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <h5 style={{ fontSize: '0.85rem', color: '#fcd34d', marginBottom: '0.4rem' }}>Areas for Reflection</h5>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {reflections.map((rf, i) => <li key={i}>{rf}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {r.relationships && (
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ fontSize: '0.85rem', color: '#f472b6', marginBottom: '0.35rem' }}>Relationships</h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.relationships}</p>
                </div>
              )}

              {r.career && (
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ fontSize: '0.85rem', color: '#6ee7b7', marginBottom: '0.35rem' }}>Career & Vocation</h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.career}</p>
                </div>
              )}
            </div>

            {r.explanation && (
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h5 style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '0.35rem' }}>Chart Placement Explanation</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.explanation}</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {r.sun_interpretation && (
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h5 style={{ fontSize: '0.85rem', color: '#fcd34d', marginBottom: '0.35rem' }}>Sun Interpretation</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.sun_interpretation}</p>
              </div>
            )}
            {r.moon_interpretation && (
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h5 style={{ fontSize: '0.85rem', color: '#7dd3fc', marginBottom: '0.35rem' }}>Moon Interpretation</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.moon_interpretation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviewer Note Editor */}
      <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d' }}>
          <MessageSquare size={18} /> Professional Astrologer Note
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Add personal observations, remedies, or planetary insights visible to the user.
        </p>

        {reading.reviewer_username && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: '#fef3c7',
            marginBottom: '1.5rem',
          }}>
            <CheckCircle2 size={16} color="#fbbf24" />
            <span>
              Last reviewed by <strong>{reading.reviewer_username}</strong> on{' '}
              {reading.reviewed_at ? new Date(reading.reviewed_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        )}

        {formError && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fda4af',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmitNote}>
          <div className="form-group">
            <label className="form-label" htmlFor="astrologer-note">
              Astrologer Note (5–2000 characters)
            </label>
            <textarea
              id="astrologer-note"
              className="form-textarea"
              rows={5}
              placeholder="e.g. Based on your strong Moon placement in Taurus and Rohini Nakshatra, artistic pursuits and stability in partnerships will bring immense fulfillment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-amber"
              disabled={isSubmitting || note.trim().length < 5}
            >
              {isSubmitting ? (
                'Saving Note...'
              ) : (
                <>
                  <Send size={16} />
                  Submit Astrological Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
