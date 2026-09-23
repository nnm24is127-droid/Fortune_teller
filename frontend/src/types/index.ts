export type Role = 'user' | 'astrologer' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AstrologyProfile {
  zodiac_sign: string;
  sun_sign: string;
  moon_sign: string;
  nakshatra: string;
  ascendant: string;
}

export interface StructuredReading {
  summary: string;
  sun_interpretation: string;
  moon_interpretation: string;
  nakshatra_interpretation: string;
  ascendant_interpretation: string;
  overall_interpretation: string;
  disclaimer: string;
}

export interface AstrologyInterpretation {
  summary: string;
  personality: string;
  strengths: string[];
  areas_for_reflection: string[];
  relationships: string;
  career: string;
  explanation: string;
  disclaimer?: string;
}

export interface ReadingResponse {
  message: string;
  reading_id: number;
  profile: AstrologyProfile;
  reading?: AstrologyInterpretation | StructuredReading | string;
  interpretation?: AstrologyInterpretation;
}

export interface ReadingHistoryItem {
  id: number;
  zodiac_sign?: string;
  moon_sign?: string;
  nakshatra?: string;
  ascendant?: string;
  reading?: AstrologyInterpretation | StructuredReading | string;
  interpretation?: AstrologyInterpretation;
  astrologer_note?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PaginatedReadingHistory {
  items: ReadingHistoryItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AstrologerReadingItem {
  id: number;
  user_id: number;
  username: string;
  zodiac_sign?: string;
  moon_sign?: string;
  nakshatra?: string;
  ascendant?: string;
  created_at: string;
  is_reviewed: boolean;
}

export interface PaginatedAstrologerReadings {
  items: AstrologerReadingItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AstrologerReadingDetail {
  id: number;
  user_id: number;
  username: string;
  user_email: string;
  birth_year?: number;
  birth_month?: number;
  birth_date?: number;
  birth_hours?: number;
  birth_minutes?: number;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  zodiac_sign?: string;
  moon_sign?: string;
  nakshatra?: string;
  ascendant?: string;
  reading?: AstrologyInterpretation | StructuredReading | string;
  interpretation?: AstrologyInterpretation;
  astrologer_note?: string;
  reviewed_by?: number;
  reviewer_username?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PaginatedUserList {
  items: User[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface KundaliFormData {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface ErrorEnvelope {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}
