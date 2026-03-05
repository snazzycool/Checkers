// Backend API Types
// These types are shared between frontend and backend

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  country: string | null;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  createdAt?: Date;
  lastSeenAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface LeaderboardEntry extends User {
  rank: number;
  winRate: number;
  trend?: 'up' | 'down' | 'same';
}

export interface GameHistory {
  id: string;
  white: {
    id: string;
    username: string;
    avatar: string;
    country: string | null;
    rating: number;
  };
  black: {
    id: string;
    username: string;
    avatar: string;
    country: string | null;
    rating: number;
  };
  winner: 'white' | 'black' | 'draw' | null;
  resultReason: string | null;
  timeControl: number;
  movesCount: number;
  endedAt: Date;
}

export interface GlobalStats {
  totalUsers: number;
  totalGames: number;
  averageRating: number;
}

// Rating tiers
export const RATING_TIERS = [
  { min: 2400, name: 'Diamond', icon: '💎', color: 'text-cyan-500' },
  { min: 2100, name: 'Gold', icon: '🥇', color: 'text-yellow-500' },
  { min: 1800, name: 'Silver', icon: '🥈', color: 'text-gray-400' },
  { min: 1500, name: 'Bronze', icon: '🥉', color: 'text-orange-400' },
  { min: 0, name: 'New Player', icon: '🌱', color: 'text-green-500' },
] as const;

export function getRatingTier(rating: number) {
  return RATING_TIERS.find(tier => rating >= tier.min) || RATING_TIERS[RATING_TIERS.length - 1];
}

// Country flags
export const COUNTRY_FLAGS: Record<string, string> = {
  'NG': '🇳🇬', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
  'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'BR': '🇧🇷', 'RU': '🇷🇺',
  'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'AU': '🇦🇺',
  'CA': '🇨🇦', 'MX': '🇲🇽', 'AR': '🇦🇷', 'ZA': '🇿🇦', 'EG': '🇪🇬',
  'KE': '🇰🇪', 'GH': '🇬🇭', 'ET': '🇪🇹', '': '🌍'
};

export function getCountryFlag(country: string | null): string {
  return COUNTRY_FLAGS[country || ''] || '🌍';
}
