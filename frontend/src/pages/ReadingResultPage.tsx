import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ReadingResponse, AstrologyInterpretation, StructuredReading } from '../types';
import { ZodiacBadge } from '../components/ZodiacBadge';
import {
  Sparkles,
  User,
  Heart,
  Briefcase,
  BookOpen,
  Shield,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Compass,
} from 'lucide-react';

export const ReadingResultPage: React.FC = () => {
  const location = useLocation();
  const readingData = (location.state as any)?.readingData as ReadingResponse | undefined;

  if (!readingData) {
    return <Navigate to="/dashboard" replace />;
  }

  const { profile, reading, reading_id } = readingData;
  const interp = (reading || (readingData as any).interpretation) as Partial<AstrologyInterpretation & StructuredReading>;

  const strengths = Array.isArray(interp?.strengths) ? interp.strengths : [];
  const reflections = Array.isArray(interp?.areas_for_reflection) ? interp.areas_for_reflection : [];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '980px' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to History
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            padding: '0.35rem 0.75rem',
            background: 'rgba(3, 8, 48, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            Reading #{reading_id}
          </span>
          <Link to="/reading/new" className="btn btn-secondary btn-sm">
            <RotateCcw size={15} />
            New Calculation
          </Link>
        </div>
      </div>

      {/* Hero Result Banner */}
      <div className="glass-card" style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        marginBottom: '2.5rem',
        background: 'linear-gradient(180deg, rgba(0, 180, 216, 0.18) 0%, rgba(3, 8, 48, 0.85) 100%)',
        border: '1px solid rgba(0, 180, 216, 0.4)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: 'var(--primary-gradient)',
          color: '#03045E',
          boxShadow: '0 0 30px var(--primary-glow)',
          marginBottom: '1rem',
        }}>
          <Sparkles size={32} />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Your <span className="gradient-text">Astrological Profile</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
          Vedic sidereal calculations interpreted through AI-assisted psychological reflection.
        </p>

        {/* Badges Grid */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '2rem',
        }}>
          <ZodiacBadge label="Western Zodiac" value={profile.zodiac_sign} type="zodiac" />
          <ZodiacBadge label="Vedic Sun Sign" value={profile.sun_sign} type="sun" />
          <ZodiacBadge label="Vedic Moon Sign" value={profile.moon_sign} type="moon" />
          <ZodiacBadge label="Birth Nakshatra" value={profile.nakshatra} type="nakshatra" />
          <ZodiacBadge label="Ascendant (Lagna)" value={profile.ascendant} type="ascendant" />
        </div>
      </div>

      {/* Interpretation Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '3rem' }}>
        
        {/* Executive Summary Card */}
        {interp?.summary && (
          <div className="glass-card" style={{ borderLeft: '4px solid #00B4D8', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#CAF0F8', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.2rem' }}>
              <Sparkles size={22} color="#00B4D8" />
              <span>Core Summary</span>
            </div>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.75, fontSize: '1.05rem' }}>
              {interp.summary}
            </p>
          </div>
        )}

        {/* Personality & Core Self */}
        {interp?.personality && (
          <div className="glass-card" style={{ borderLeft: '4px solid #90E0EF', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#90E0EF', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.15rem' }}>
              <User size={22} color="#90E0EF" />
              <span>Personality & Core Self</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>
              {interp.personality}
            </p>
          </div>
        )}

        {/* Strengths & Areas for Reflection 2-Column Grid */}
        {(strengths.length > 0 || reflections.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(0, 180, 216, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#CAF0F8', marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  <CheckCircle2 size={20} color="#00B4D8" />
                  <span>Key Strengths & Talents</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {strengths.map((st, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      <span style={{ color: '#00B4D8', fontWeight: 'bold', marginTop: '0.1rem' }}>✦</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Reflection */}
            {reflections.length > 0 && (
              <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(144, 224, 239, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#90E0EF', marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Lightbulb size={20} color="#90E0EF" />
                  <span>Areas for Reflection & Growth</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {reflections.map((ref, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      <span style={{ color: '#90E0EF', fontWeight: 'bold', marginTop: '0.1rem' }}>❖</span>
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Relationships & Career Grid */}
        {(interp?.relationships || interp?.career) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            {/* Relationships */}
            {interp?.relationships && (
              <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '4px solid #0077B6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#90E0EF', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Heart size={20} color="#0077B6" />
                  <span>Relationships & Dynamics</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.95rem' }}>
                  {interp.relationships}
                </p>
              </div>
            )}

            {/* Career */}
            {interp?.career && (
              <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '4px solid #00B4D8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#CAF0F8', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Briefcase size={20} color="#00B4D8" />
                  <span>Career & Work Style</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.95rem' }}>
                  {interp.career}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Astrological Explanation */}
        {interp?.explanation && (
          <div className="glass-card" style={{ borderLeft: '4px solid #90E0EF', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#CAF0F8', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.1rem' }}>
              <BookOpen size={20} color="#90E0EF" />
              <span>How Your Chart Informs This Interpretation</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {interp.explanation}
            </p>
          </div>
        )}

        {/* Fallback for legacy structured reading fields if present */}
        {interp?.overall_interpretation && !interp?.explanation && (
          <div className="glass-card" style={{ borderLeft: '4px solid #00B4D8', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#CAF0F8', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.15rem' }}>
              <Compass size={20} color="#00B4D8" />
              <span>Synthesis & Life Path Guidance</span>
            </div>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '1rem' }}>
              {interp.overall_interpretation}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer Box */}
      <div style={{
        padding: '1.25rem',
        background: 'rgba(3, 8, 48, 0.4)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        lineHeight: 1.5,
      }}>
        <Shield size={18} color="#00B4D8" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>Self-Reflection Disclaimer: </strong>
          {interp?.disclaimer || 'AstroTeller is for entertainment and self-reflection only. Interpretations are not scientifically validated predictions.'}
        </div>
      </div>
    </div>
  );
};
