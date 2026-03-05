// Local Storage API
// This provides offline-first storage that works in the APK
// When a backend is available, it will sync data

import { User, LeaderboardEntry } from './types';

const STORAGE_KEYS = {
  USERS: 'draughts-users',
  CURRENT_USER: 'draughts-current-user',
  TOKEN: 'draughts-token',
  GAMES: 'draughts-games',
  LEADERBOARD: 'draughts-leaderboard',
};

// ============================================
// USER MANAGEMENT
// ============================================

export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserByUsername(username: string): User | undefined {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function createUser(params: {
  username: string;
  email: string;
  password?: string;
  country?: string;
  avatar?: string;
  authProvider?: string;
  googleId?: string;
}): User {
  const users = getUsers();
  
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    email: params.email,
    username: params.username,
    avatar: params.avatar || '👤',
    country: params.country || null,
    rating: 1500,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    createdAt: new Date(),
    lastSeenAt: new Date(),
  };
  
  // Store with password separately (not in User type)
  const userWithPassword = {
    ...newUser,
    password: params.password || null,
    authProvider: params.authProvider || 'email',
    googleId: params.googleId || null,
  };
  
  saveUsers([...users, userWithPassword]);
  
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  const updatedUser = {
    ...users[index],
    ...updates,
    lastSeenAt: new Date(),
  };
  
  users[index] = updatedUser;
  saveUsers(users);
  
  return updatedUser;
}

export function updateUserStats(
  id: string, 
  won: boolean, 
  ratingChange: number
): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  const user = users[index];
  const updatedUser = {
    ...user,
    gamesPlayed: user.gamesPlayed + 1,
    gamesWon: user.gamesWon + (won ? 1 : 0),
    gamesLost: user.gamesLost + (won ? 0 : 1),
    rating: Math.max(100, user.rating + ratingChange),
    lastSeenAt: new Date(),
  };
  
  users[index] = updatedUser;
  saveUsers(users);
  
  return updatedUser;
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

// ============================================
// LEADERBOARD
// ============================================

export function getLeaderboard(country?: string): LeaderboardEntry[] {
  const users = getUsers();
  
  let filtered = users;
  if (country) {
    filtered = users.filter(u => u.country === country);
  }
  
  // Sort by rating descending
  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);
  
  // Add rank and win rate
  return sorted.map((user, index) => ({
    ...user,
    rank: index + 1,
    winRate: user.gamesPlayed > 0 
      ? Math.round((user.gamesWon / user.gamesPlayed) * 100) 
      : 0,
  }));
}

export function getUserRank(userId: string): number {
  const leaderboard = getLeaderboard();
  const entry = leaderboard.find(u => u.id === userId);
  return entry?.rank || leaderboard.length + 1;
}

// ============================================
// GAMES
// ============================================

export interface GameRecord {
  id: string;
  whiteId: string;
  blackId: string;
  winner: 'white' | 'black' | 'draw' | null;
  resultReason: string;
  timeControl: number;
  movesCount: number;
  endedAt: Date;
}

export function getGames(): GameRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAMES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGame(game: GameRecord) {
  const games = getGames();
  games.unshift(game);
  // Keep only last 100 games
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games.slice(0, 100)));
}

export function getUserGames(userId: string): GameRecord[] {
  return getGames().filter(
    g => g.whiteId === userId || g.blackId === userId
  );
}

// ============================================
// STATS
// ============================================

export function getGlobalStats() {
  const users = getUsers();
  const games = getGames();
  
  const totalRating = users.reduce((sum, u) => sum + u.rating, 0);
  
  return {
    totalUsers: users.length,
    totalGames: games.length,
    averageRating: users.length > 0 ? Math.round(totalRating / users.length) : 1500,
  };
}

// ============================================
// SEED DATA
// ============================================

export function seedDemoData() {
  const users = getUsers();
  
  // Only seed if no users exist
  if (users.length > 0) return;
  
  const demoUsers: Array<Parameters<typeof createUser>[0] & { rating?: number; gamesPlayed?: number; gamesWon?: number }> = [
    { username: 'GrandMaster', email: 'gm@demo.com', password: 'demo123', country: 'RU', avatar: '👑', rating: 2450, gamesPlayed: 520, gamesWon: 410 },
    { username: 'DraughtsKing', email: 'dk@demo.com', password: 'demo123', country: 'NL', avatar: '🏆', rating: 2380, gamesPlayed: 430, gamesWon: 330 },
    { username: 'CheckerChamp', email: 'cc@demo.com', password: 'demo123', country: 'BR', avatar: '⭐', rating: 2320, gamesPlayed: 380, gamesWon: 280 },
    { username: 'BoardMaster', email: 'bm@demo.com', password: 'demo123', country: 'US', avatar: '🎯', rating: 2280, gamesPlayed: 290, gamesWon: 210 },
    { username: 'PieceTaker', email: 'pt@demo.com', password: 'demo123', country: 'NG', avatar: '🔥', rating: 2240, gamesPlayed: 450, gamesWon: 320 },
    { username: 'KingMaker', email: 'km@demo.com', password: 'demo123', country: 'GB', avatar: '🧠', rating: 2190, gamesPlayed: 320, gamesWon: 220 },
    { username: 'JumpMaster', email: 'jm@demo.com', password: 'demo123', country: 'DE', avatar: '💪', rating: 2150, gamesPlayed: 280, gamesWon: 190 },
    { username: 'DraughtsPro', email: 'dp@demo.com', password: 'demo123', country: 'FR', avatar: '🎮', rating: 2120, gamesPlayed: 240, gamesWon: 160 },
    { username: 'StrategyKing', email: 'sk@demo.com', password: 'demo123', country: 'ZA', avatar: '🌟', rating: 2080, gamesPlayed: 190, gamesWon: 130 },
    { username: 'MoveMaster', email: 'mm@demo.com', password: 'demo123', country: 'EG', avatar: '🎭', rating: 2050, gamesPlayed: 220, gamesWon: 145 },
  ];
  
  demoUsers.forEach(user => {
    const { rating, gamesPlayed, gamesWon, ...params } = user;
    const newUser = createUser(params);
    updateUser(newUser.id, { 
      rating: rating || 1500, 
      gamesPlayed: gamesPlayed || 0,
      gamesWon: gamesWon || 0,
      gamesLost: (gamesPlayed || 0) - (gamesWon || 0)
    });
  });
  
  console.log('Demo data seeded!');
}

// Run seed on load
if (typeof window !== 'undefined') {
  seedDemoData();
}
