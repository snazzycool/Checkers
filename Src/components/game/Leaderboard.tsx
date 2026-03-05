'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  TrendingUp, 
  TrendingDown,
  Crown,
  Flame,
  Search,
  Users,
  Target,
  Zap,
  Calendar,
  Clock,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { leaderboardApi, gameApi, statsApi, LeaderboardEntry, Game } from '@/lib/api';

// Country flags mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'NG': '🇳🇬', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
  'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'BR': '🇧🇷', 'RU': '🇷🇺',
  'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'AU': '🇦🇺',
  'CA': '🇨🇦', 'MX': '🇲🇽', 'AR': '🇦🇷', 'ZA': '🇿🇦', 'EG': '🇪🇬',
  'KE': '🇰🇪', 'GH': '🇬🇭', 'ET': '🇪🇹', '': '🌍'
};

// Rating tiers
const RATING_TIERS = [
  { min: 2400, name: 'Diamond', icon: '💎', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { min: 2100, name: 'Gold', icon: '🥇', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { min: 1800, name: 'Silver', icon: '🥈', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  { min: 1500, name: 'Bronze', icon: '🥉', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { min: 0, name: 'New Player', icon: '🌱', color: 'text-green-500', bg: 'bg-green-500/10' },
];

// Fallback leaderboard data (when backend is offline)
const FALLBACK_LEADERBOARD = [
  { rank: 1, name: 'GrandMaster', country: 'RU', rating: 2450, games: 520, wins: 410, avatar: '👑' },
  { rank: 2, name: 'DraughtsKing', country: 'NL', rating: 2380, games: 430, wins: 330, avatar: '🏆' },
  { rank: 3, name: 'CheckerChamp', country: 'BR', rating: 2320, games: 380, wins: 280, avatar: '⭐' },
  { rank: 4, name: 'BoardMaster', country: 'US', rating: 2280, games: 290, wins: 210, avatar: '🎯' },
  { rank: 5, name: 'PieceTaker', country: 'NG', rating: 2240, games: 450, wins: 320, avatar: '🔥' },
  { rank: 6, name: 'KingMaker', country: 'GB', rating: 2190, games: 320, wins: 220, avatar: '🧠' },
  { rank: 7, name: 'JumpMaster', country: 'DE', rating: 2150, games: 280, wins: 190, avatar: '💪' },
  { rank: 8, name: 'DraughtsPro', country: 'FR', rating: 2120, games: 240, wins: 160, avatar: '🎮' },
  { rank: 9, name: 'StrategyKing', country: 'ZA', rating: 2080, games: 190, wins: 130, avatar: '🌟' },
  { rank: 10, name: 'MoveMaster', country: 'EG', rating: 2050, games: 220, wins: 145, avatar: '🎭' },
];

interface LeaderboardPlayer {
  id?: string;
  rank: number;
  name: string;
  country: string | null;
  rating: number;
  games: number;
  wins: number;
  avatar: string;
  winRate: number;
  isPlayer?: boolean;
}

interface RecentGame {
  id: string;
  white: { name: string; rating: number };
  black: { name: string; rating: number };
  result: 'white' | 'black' | 'draw';
  timeControl: number;
  moves: number;
  date: string;
}

export function Leaderboard() {
  const { setMode, playerName, playerStats, playerCountry, playerAvatar, isLoggedIn } = useGameStore();
  const playerRating = playerStats.rating;
  const [selectedTab, setSelectedTab] = useState('top');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  
  // Get rating tier
  const getRatingTier = (rating: number) => {
    return RATING_TIERS.find(tier => rating >= tier.min) || RATING_TIERS[RATING_TIERS.length - 1];
  };
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch from real backend
        const [leaderboardResult, gamesResult] = await Promise.all([
          leaderboardApi.getLeaderboard({ 
            limit: 100, 
            country: selectedCountry !== 'all' ? selectedCountry : undefined 
          }),
          gameApi.getRecentGames(20)
        ]);
        
        if (leaderboardResult.data) {
          const lbData = leaderboardResult.data.leaderboard.map((player: any) => ({
            id: player.id,
            rank: player.rank,
            name: player.username,
            country: player.country,
            rating: player.rating,
            games: player.gamesPlayed,
            wins: player.gamesWon,
            avatar: player.avatar,
            winRate: player.winRate
          }));
          setLeaderboardData(lbData);
          setBackendOnline(true);
        } else {
          setLeaderboardData(FALLBACK_LEADERBOARD);
          setBackendOnline(false);
        }
        
        if (gamesResult.data) {
          const games = gamesResult.data.games.map((game: any) => ({
            id: game.id,
            white: { name: game.white.username, rating: game.white.rating },
            black: { name: game.black.username, rating: game.black.rating },
            result: game.winner as 'white' | 'black' | 'draw',
            timeControl: game.timeControl,
            moves: game.movesCount,
            date: game.endedAt ? new Date(game.endedAt).toLocaleDateString() : 'Unknown'
          }));
          setRecentGames(games);
        } else {
          setRecentGames([
            { id: '1', white: { name: 'GrandMaster', rating: 2450 }, black: { name: 'DraughtsKing', rating: 2380 }, result: 'white', timeControl: 300, moves: 42, date: '2 min ago' },
            { id: '2', white: { name: 'CheckerChamp', rating: 2320 }, black: { name: 'BoardMaster', rating: 2280 }, result: 'black', timeControl: 600, moves: 56, date: '5 min ago' },
            { id: '3', white: { name: 'PieceTaker', rating: 2240 }, black: { name: 'KingMaker', rating: 2190 }, result: 'white', timeControl: 900, moves: 38, date: '12 min ago' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Use fallback data
        setLeaderboardData(FALLBACK_LEADERBOARD);
        setRecentGames([
          { id: '1', white: { name: 'GrandMaster', rating: 2450 }, black: { name: 'DraughtsKing', rating: 2380 }, result: 'white', timeControl: 300, moves: 42, date: '2 min ago' },
          { id: '2', white: { name: 'CheckerChamp', rating: 2320 }, black: { name: 'BoardMaster', rating: 2280 }, result: 'black', timeControl: 600, moves: 56, date: '5 min ago' },
          { id: '3', white: { name: 'PieceTaker', rating: 2240 }, black: { name: 'KingMaker', rating: 2190 }, result: 'white', timeControl: 900, moves: 38, date: '12 min ago' },
        ]);
        setBackendOnline(false);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [selectedCountry]);
  
  // Calculate player's rank (derived, not in useEffect)
  const playerRank = leaderboardData.length > 0
    ? leaderboardData.filter(p => p.rating > playerRating).length + 1
    : null;
  
  // Filter leaderboard by search
  const displayData = searchQuery.trim()
    ? leaderboardData.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : leaderboardData;
  
  // Add player to display if logged in
  const fullDisplayData = isLoggedIn && playerRank
    ? [...displayData, { 
        rank: playerRank, 
        name: playerName, 
        country: playerCountry, 
        rating: playerRating, 
        games: playerStats.gamesPlayed, 
        wins: playerStats.gamesWon, 
        avatar: playerAvatar, 
        winRate: playerStats.gamesPlayed > 0 ? Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 100) : 0,
        isPlayer: true 
      }].sort((a, b) => b.rating - a.rating).map((p, i) => ({ ...p, rank: i + 1 }))
    : displayData;
  
  const playerTier = getRatingTier(playerRating);
  
  // Format time control
  const formatTimeControl = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };
  
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Button variant="ghost" onClick={() => setMode('lobby')} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-500" />
            Leaderboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs",
            backendOnline ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {backendOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {backendOnline ? 'Live' : 'Offline'}
          </div>
          <Badge variant="outline" className="hidden sm:flex gap-1">
            <Users className="h-3 w-3" />
            {leaderboardData.length + (isLoggedIn ? 1 : 0)} players
          </Badge>
        </div>
      </div>
      
      {/* Your Stats Card (if logged in) */}
      {isLoggedIn && (
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-amber-400">
                  <AvatarFallback className="text-2xl sm:text-3xl bg-amber-100 dark:bg-amber-900">{playerAvatar}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 text-base sm:text-lg">
                  {COUNTRY_FLAGS[playerCountry || ''] || '🌍'}
                </span>
                <div className="absolute -top-1 -left-1 text-sm">{playerTier.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-lg sm:text-xl truncate">{playerName}</span>
                  <Badge className={cn("text-xs", playerTier.color)}>{playerTier.name}</Badge>
                  <Badge variant="secondary" className="text-xs">You</Badge>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span className={cn("font-bold", playerTier.color)}>{playerRating}</span> Rating
                  </span>
                  {playerRank && (
                    <span className="flex items-center gap-1">
                      <Medal className="h-3 w-3 sm:h-4 sm:w-4" />
                      Rank #{playerRank}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-3xl font-bold text-amber-600">{playerRating}</div>
                <div className="text-xs text-muted-foreground">ELO Rating</div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold">{playerStats.gamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Games</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-500">{playerStats.gamesWon}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-500">{playerStats.gamesLost}</div>
                <div className="text-xs text-muted-foreground">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-amber-500">
                  {playerStats.gamesPlayed > 0 ? Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="top" className="gap-1">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Top</span> Players
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-1">
            <Clock className="h-4 w-4" />
            Recent Games
          </TabsTrigger>
        </TabsList>
        
        {/* Top Players */}
        <TabsContent value="top">
          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search players..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                <SelectItem value="US">🇺🇸 USA</SelectItem>
                <SelectItem value="GB">🇬🇧 UK</SelectItem>
                <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                <SelectItem value="FR">🇫🇷 France</SelectItem>
                <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                <SelectItem value="ZA">🇿🇦 South Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {fullDisplayData.slice(0, 50).map((player, index) => {
                    const tier = getRatingTier(player.rating);
                    const isPlayer = player.isPlayer;
                    
                    return (
                      <div 
                        key={`${player.rank}-${player.name}`}
                        className={cn(
                          "flex items-center gap-3 p-3 sm:p-4 transition-colors",
                          index < 3 && "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10",
                          isPlayer && "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500"
                        )}
                      >
                        {/* Rank */}
                        <div className="w-8 sm:w-10 flex justify-center shrink-0">
                          {player.rank === 1 ? (
                            <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                          ) : player.rank === 2 ? (
                            <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                          ) : player.rank === 3 ? (
                            <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                          ) : (
                            <span className="font-bold text-muted-foreground">{player.rank}</span>
                          )}
                        </div>
                        
                        {/* Avatar & Country */}
                        <div className="relative shrink-0">
                          <Avatar className={cn(
                            "h-9 w-9 sm:h-10 sm:w-10",
                            isPlayer && "ring-2 ring-amber-500"
                          )}>
                            <AvatarFallback className={cn("text-lg sm:text-xl", tier.bg)}>{player.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-1 -right-1 text-xs">
                            {COUNTRY_FLAGS[player.country || ''] || '🌍'}
                          </span>
                        </div>
                        
                        {/* Name & Stats */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-semibold truncate text-sm sm:text-base",
                              isPlayer && "text-amber-600"
                            )}>
                              {player.name}
                            </span>
                            <span className="text-xs">{tier.icon}</span>
                            {isPlayer && <Badge variant="secondary" className="text-xs">You</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{player.games} games</span>
                            <span>•</span>
                            <span>{player.winRate}% win</span>
                          </div>
                        </div>
                        
                        {/* Rating */}
                        <div className="text-right shrink-0">
                          <div className={cn("font-bold text-lg sm:text-xl", tier.color)}>{player.rating}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{tier.name}</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {fullDisplayData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No players found matching your search</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Recent Games */}
        <TabsContent value="recent">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Live Games
              </CardTitle>
              <CardDescription>Recent completed games from players worldwide</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentGames.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent games</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentGames.map((game) => (
                    <div key={game.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                      {/* Players */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm sm:text-base">
                          <span className={cn(
                            "truncate font-medium",
                            game.result === 'white' && "text-green-600 font-bold"
                          )}>
                            {game.white.name}
                          </span>
                          <span className="text-muted-foreground text-xs">vs</span>
                          <span className={cn(
                            "truncate font-medium",
                            game.result === 'black' && "text-green-600 font-bold"
                          )}>
                            {game.black.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeControl(game.timeControl)}</span>
                          <span>•</span>
                          <span>{game.moves} moves</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{game.date}</span>
                        </div>
                      </div>
                      
                      {/* Result */}
                      <div className="flex items-center gap-2">
                        {game.result === 'draw' ? (
                          <Badge variant="outline" className="text-xs">½-½</Badge>
                        ) : (
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            game.result === 'white' ? "border-green-500 text-green-600" : "border-green-500 text-green-600"
                          )}>
                            {game.result === 'white' ? '1-0' : '0-1'}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Rating Info */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Rating Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {RATING_TIERS.map((tier) => (
              <div key={tier.name} className={cn("text-center p-2 rounded-lg", tier.bg)}>
                <div className="text-xl mb-1">{tier.icon}</div>
                <div className={cn("font-bold text-sm", tier.color)}>{tier.name}</div>
                <div className="text-xs text-muted-foreground">
                  {tier.min === 0 ? '< 1500' : `${tier.min}+`}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Players are ranked by <strong>ELO rating</strong>. Win games to gain rating points,
            lose games to lose points. The amount depends on your opponent's rating - 
            beating a higher-rated player gives more points!
          </p>
          {!isLoggedIn && (
            <div className="mt-3 p-3 bg-muted rounded-lg text-sm text-center">
              <p>Sign in to track your rating and compete on the leaderboard!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
