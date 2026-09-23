import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Consulting celestial coordinates...',
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 44 : 32;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem',
      gap: '1rem',
      textAlign: 'center',
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: iconSize * 1.8,
          height: iconSize * 1.8,
          borderRadius: '50%',
          border: '2px solid rgba(139, 92, 246, 0.2)',
          borderTopColor: '#a78bfa',
          animation: 'spinSlow 1.5s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          color: '#fbbf24',
          animation: 'pulseGlow 2s infinite ease-in-out',
        }}>
          <Sparkles size={iconSize} />
        </div>
      </div>
      {message && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: size === 'sm' ? '0.85rem' : '0.95rem',
          fontWeight: 500,
        }}>
          {message}
        </p>
      )}
    </div>
  );
};
