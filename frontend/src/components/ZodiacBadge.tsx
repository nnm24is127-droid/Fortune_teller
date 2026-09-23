import React from 'react';
import { Sun, Moon, Compass, Star, Sparkles } from 'lucide-react';

interface ZodiacBadgeProps {
  label: string;
  value: string;
  type?: 'zodiac' | 'sun' | 'moon' | 'nakshatra' | 'ascendant';
}

export const ZodiacBadge: React.FC<ZodiacBadgeProps> = ({
  label,
  value,
  type = 'zodiac',
}) => {
  let icon = <Sparkles size={16} />;
  let gradient = 'linear-gradient(135deg, rgba(0, 180, 216, 0.15), rgba(0, 119, 182, 0.15))';
  let borderColor = 'rgba(0, 180, 216, 0.35)';
  let textColor = '#CAF0F8';

  if (type === 'sun') {
    icon = <Sun size={16} />;
    gradient = 'linear-gradient(135deg, rgba(144, 224, 239, 0.18), rgba(0, 180, 216, 0.18))';
    borderColor = 'rgba(144, 224, 239, 0.45)';
    textColor = '#CAF0F8';
  } else if (type === 'moon') {
    icon = <Moon size={16} />;
    gradient = 'linear-gradient(135deg, rgba(0, 119, 182, 0.22), rgba(3, 4, 94, 0.4))';
    borderColor = 'rgba(0, 180, 216, 0.4)';
    textColor = '#90E0EF';
  } else if (type === 'nakshatra') {
    icon = <Star size={16} />;
    gradient = 'linear-gradient(135deg, rgba(0, 180, 216, 0.18), rgba(3, 4, 94, 0.35))';
    borderColor = 'rgba(144, 224, 239, 0.4)';
    textColor = '#90E0EF';
  } else if (type === 'ascendant') {
    icon = <Compass size={16} />;
    gradient = 'linear-gradient(135deg, rgba(202, 240, 248, 0.12), rgba(0, 119, 182, 0.25))';
    borderColor = 'rgba(202, 240, 248, 0.35)';
    textColor = '#CAF0F8';
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.65rem',
      padding: '0.5rem 0.85rem',
      background: gradient,
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      color: textColor,
      boxShadow: '0 2px 8px rgba(3, 4, 94, 0.35)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#00B4D8' }}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {value}
        </span>
      </div>
    </div>
  );
};
