import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Map,
} from 'lucide-react';

const PRESET_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278, tz: 0.0 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060, tz: -5.0 },
  { name: 'San Francisco, USA', lat: 37.7749, lon: -122.4194, tz: -8.0 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, tz: 9.0 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, tz: 10.0 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, tz: 4.0 },
];

export const GenerateReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [year, setYear] = useState<number>(1995);
  const [month, setMonth] = useState<number>(5);
  const [date, setDate] = useState<number>(15);
  const [hours, setHours] = useState<number>(14);
  const [minutes, setMinutes] = useState<number>(30);
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.2090);
  const [timezone, setTimezone] = useState<number>(5.5);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCityPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PRESET_CITIES.find((c) => c.name === e.target.value);
    if (selected) {
      setLatitude(selected.lat);
      setLongitude(selected.lon);
      setTimezone(selected.tz);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic date validation
    if (year < 1900 || year > 2100) {
      setError('Birth year must be between 1900 and 2100.');
      return;
    }
    if (month < 1 || month > 12) {
      setError('Birth month must be between 1 and 12.');
      return;
    }
    if (date < 1 || date > 31) {
      setError('Birth date must be between 1 and 31.');
      return;
    }

    const maxDays = new Date(year, month, 0).getDate();
    if (date > maxDays) {
      setError(`Invalid calendar date: Month ${month} in year ${year} has at most ${maxDays} days.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.astrology.createReading({
        year: Number(year),
        month: Number(month),
        date: Number(date),
        hours: Number(hours),
        minutes: Number(minutes),
        latitude: Number(latitude),
        longitude: Number(longitude),
        timezone: Number(timezone),
      });

      showToast('Astrology reading generated successfully! 🔮', 'success');
      navigate('/reading/result', { state: { readingData: response } });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to generate reading. Please check coordinates and API status.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div className="glass-card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '3.5rem 2rem' }}>
          <LoadingSpinner size="lg" message="Computing Vedic Kundali & generating Gemini AI interpretation..." />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Calculating planetary degrees via Navamsha API and synthesizing psychological insights with Gemini AI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-gradient)',
          color: '#fff',
          boxShadow: '0 0 25px var(--primary-glow)',
          marginBottom: '1rem',
        }}>
          <Compass size={28} />
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Generate <span className="gradient-text">Astrology Reading</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto', fontSize: '0.95rem' }}>
          Enter precise birth date, time, and coordinates to calculate your Kundali planetary chart.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fda4af',
          fontSize: '0.9rem',
          marginBottom: '2rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2.5rem' }}>
        {/* Section 1: Date of Birth */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CAF0F8', marginBottom: '1rem', fontWeight: 600 }}>
            <Calendar size={18} color="#00B4D8" />
            <span>Date of Birth</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="birth-year">Year (1900–2100)</label>
              <input
                id="birth-year"
                type="number"
                className="form-input"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 1995)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="birth-month">Month (1–12)</label>
              <input
                id="birth-month"
                type="number"
                className="form-input"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="birth-date">Day (1–31)</label>
              <input
                id="birth-date"
                type="number"
                className="form-input"
                min={1}
                max={31}
                value={date}
                onChange={(e) => setDate(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Time of Birth */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#90E0EF', marginBottom: '1rem', fontWeight: 600 }}>
            <Clock size={18} color="#90E0EF" />
            <span>Time of Birth (24-Hour Format)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="birth-hours">Hour (0–23)</label>
              <input
                id="birth-hours"
                type="number"
                className="form-input"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="birth-minutes">Minute (0–59)</label>
              <input
                id="birth-minutes"
                type="number"
                className="form-input"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Place & Coordinates */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CAF0F8', fontWeight: 600 }}>
              <MapPin size={18} color="#00B4D8" />
              <span>Location & Coordinates</span>
            </div>

            {/* City Preset dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Map size={16} color="var(--text-muted)" />
              <select
                className="form-select"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
                onChange={handleCityPreset}
                defaultValue=""
              >
                <option value="" disabled>Choose city preset...</option>
                {PRESET_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="latitude">Latitude (−90 to +90)</label>
              <input
                id="latitude"
                type="number"
                step="0.0001"
                className="form-input"
                min={-90}
                max={90}
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="longitude">Longitude (−180 to +180)</label>
              <input
                id="longitude"
                type="number"
                step="0.0001"
                className="form-input"
                min={-180}
                max={180}
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="timezone">UTC Offset (e.g. 5.5 for IST)</label>
              <input
                id="timezone"
                type="number"
                step="0.5"
                className="form-input"
                min={-12}
                max={14}
                value={timezone}
                onChange={(e) => setTimezone(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', padding: '0.95rem' }}
        >
          <Sparkles size={20} />
          Calculate Vedic Reading
        </button>
      </form>
    </div>
  );
};
