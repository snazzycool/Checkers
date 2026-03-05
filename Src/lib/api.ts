// Backend API URL - uses the gateway's XTransformPort parameter
const BACKEND_PORT = 3001;

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: ApiMethod;
  body?: any;
  headers?: Record<string, string>;
  token?: string | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Helper to build URL with port transformation
function buildUrl(endpoint: string): string {
  // Use relative path with XTransformPort for gateway
  return `/api${endpoint}?XTransformPort=${BACKEND_PORT}`;
}

// Main API request function
export async function api<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, token } = options;

  const url = buildUrl(endpoint);
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'An error occurred',
        status: response.status
      };
    }

    return {
      data,
      status: response.status
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: 'Network error. Please check your connection.',
      status: 0
    };
  }
}

// Auth API
export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    country?: string;
    avatar?: string;
  }) => api('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    api('/auth/login', { method: 'POST', body: data }),

  googleSignIn: (data: { googleId?: string; email: string; name?: string; photoUrl?: string }) =>
    api('/auth/google', { method: 'POST', body: data }),

  getCurrentUser: (token: string) =>
    api('/auth/me', { token }),

  updateProfile: (token: string, data: { username?: string; country?: string; avatar?: string }) =>
    api('/users/profile', { method: 'PATCH', body: data, token })
};

// User API
export const userApi = {
  getUser: (id: string) => api(`/users/${id}`),
  
  getRank: (userId: string) => api(`/leaderboard/rank/${userId}`)
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: (options?: { limit?: number; offset?: number; country?: string }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.country) params.set('country', options.country);
    
    const query = params.toString();
    return api(`/leaderboard${query ? '?' + query : ''}`);
  }
};

// Game API
export const gameApi = {
  submitGame: (token: string, data: {
    opponentId: string;
    winner: 'white' | 'black' | 'draw' | null;
    resultReason?: string;
    timeControl: number;
    movesCount?: number;
    moves?: any[];
  }) => api('/games', { method: 'POST', body: data, token }),

  getRecentGames: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return api(`/games/recent${params}`);
  },

  getUserGames: (userId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return api(`/games/user/${userId}${params}`);
  }
};

// Stats API
export const statsApi = {
  getStats: () => api('/stats')
};

// Types
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
  createdAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  country: string | null;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  rank: number;
  winRate: number;
}

export interface Game {
  id: string;
  white: User;
  black: User;
  winner: string | null;
  resultReason: string | null;
  timeControl: number;
  movesCount: number;
  endedAt: string;
}
