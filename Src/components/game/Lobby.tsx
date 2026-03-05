'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { authApi, User } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Bot, 
  Clock, 
  Loader2,
  Trophy,
  LogIn,
  LogOut,
  UserPlus,
  Volume2,
  VolumeX,
  Music,
  BarChart3,
  ChevronDown,
  Mail,
  Lock,
  UserCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Time controls
const TIME_CONTROLS = [
  { name: '5 min', seconds: 300, icon: Clock },
  { name: '10 min', seconds: 600, icon: Clock },
  { name: '15 min', seconds: 900, icon: Clock },
  { name: '20 min', seconds: 1200, icon: Clock },
  { name: '30 min', seconds: 1800, icon: Trophy },
];

// Countries
const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

// Avatars
const AVATARS = ['👤', '🎮', '🎯', '🎲', '🏆', '⭐', '🌟', '🔥', '💪', '🧠', '👾', '🤖', '🎭', '👑', '💎', '🦊', '🐱', '🐶', '🦁', '🐻'];

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { level: 'easy' as const, name: 'Easy', emoji: '🟢', description: 'Beginner friendly' },
  { level: 'medium' as const, name: 'Medium', emoji: '🟡', description: 'Balanced challenge' },
  { level: 'hard' as const, name: 'Hard', emoji: '🔴', description: 'Expert level' },
];

// Rating tiers
const getRatingTier = (rating: number) => {
  if (rating >= 2400) return { name: 'Diamond', color: 'text-cyan-500' };
  if (rating >= 2100) return { name: 'Gold', color: 'text-yellow-500' };
  if (rating >= 1800) return { name: 'Silver', color: 'text-gray-400' };
  if (rating >= 1500) return { name: 'Bronze', color: 'text-orange-400' };
  return { name: 'New Player', color: 'text-green-500' };
};

export function GameLobby() {
  const {
    playerName,
    setPlayerName,
    playerCountry,
    setPlayerCountry,
    playerAvatar,
    setPlayerAvatar,
    playerStats,
    difficulty,
    setDifficulty,
    selectedTimeControl,
    setSelectedTimeControl,
    soundEnabled,
    toggleSound,
    musicEnabled,
    toggleMusic,
    isLoggedIn,
    setLoggedIn,
    setMode,
    resetGame,
    setPlayerColor,
    setTimeControl,
    token,
    userId,
    setPlayerStats,
    isFindingMatch,
    setIsFindingMatch
  } = useGameStore();
  
  const multiplayer = useMultiplayer();
  
  const [name, setName] = useState(playerName);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerCountry, setRegisterCountry] = useState(playerCountry);
  const [registerAvatar, setRegisterAvatar] = useState(playerAvatar);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Click sound
  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }, [soundEnabled]);
  
  // Validate email
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // Handle login
  const handleLogin = async () => {
    setAuthError('');
    setAuthSuccess('');
    
    if (!email.trim() || !isValidEmail(email)) {
      setAuthError('Please enter a valid email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authApi.login({ email, password });
      
      if (response.error) {
        setAuthError(response.error);
      } else if (response.data) {
        const { user, token: newToken } = response.data as any;
        setPlayerName(user.username);
        setPlayerCountry(user.country || '');
        setPlayerAvatar(user.avatar || '👤');
        setPlayerStats({
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          gamesLost: user.gamesLost,
          rating: user.rating
        });
        setLoggedIn(true, user.id, user.email, newToken);
        setAuthSuccess('Welcome back, ' + user.username + '!');
        setTimeout(() => { setAuthOpen(false); setAuthSuccess(''); }, 1200);
      }
    } catch (e) {
      setAuthError('Failed to connect to server');
    }
    
    setIsLoading(false);
  };
  
  // Handle registration
  const handleRegister = async () => {
    setAuthError('');
    setAuthSuccess('');
    
    if (!registerName.trim() || registerName.length < 3) {
      setAuthError('Username must be at least 3 characters');
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setAuthError('Please enter a valid email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authApi.register({
        username: registerName,
        email,
        password,
        country: registerCountry,
        avatar: registerAvatar
      });
      
      if (response.error) {
        setAuthError(response.error);
      } else if (response.data) {
        const { user, token: newToken } = response.data as any;
        setPlayerName(user.username);
        setPlayerCountry(user.country || '');
        setPlayerAvatar(user.avatar || '👤');
        setPlayerStats({
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          gamesLost: user.gamesLost,
          rating: user.rating
        });
        setLoggedIn(true, user.id, user.email, newToken);
        setAuthSuccess('Account created! Welcome, ' + user.username + '!');
        setTimeout(() => { setAuthOpen(false); setAuthSuccess(''); }, 1200);
      }
    } catch (e) {
      setAuthError('Failed to connect to server');
    }
    
    setIsLoading(false);
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    // Simulated Google sign-in (in production, use real Google OAuth)
    const googleEmail = 'player' + Math.floor(Math.random() * 10000) + '@google.com';
    const googleName = 'Player' + Math.floor(Math.random() * 10000);
    
    try {
      const response = await authApi.googleSignIn({
        email: googleEmail,
        name: googleName,
        googleId: 'google-' + Date.now()
      });
      
      if (response.error) {
        setAuthError(response.error);
      } else if (response.data) {
        const { user, token: newToken } = response.data as any;
        setPlayerName(user.username);
        setPlayerAvatar(user.avatar || '🎮');
        setPlayerStats({
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          gamesLost: user.gamesLost,
          rating: user.rating
        });
        setLoggedIn(true, user.id, user.email, newToken);
        setAuthSuccess('Signed in with Google!');
        setTimeout(() => { setAuthOpen(false); setAuthSuccess(''); }, 1200);
      }
    } catch (e) {
      setAuthError('Failed to sign in with Google');
    }
    
    setIsLoading(false);
  };
  
  // Handle logout
  const handleLogout = () => {
    playClickSound();
    multiplayer.disconnect();
    setLoggedIn(false);
  };
  
  // Handle find game (online multiplayer)
  const handleFindGame = () => {
    playClickSound();
    if (!name.trim()) return;
    setPlayerName(name);
    
    if (!multiplayer.isConnected) {
      multiplayer.connect();
    }
    
    multiplayer.findGame();
    setIsFindingMatch(true);
  };
  
  // Cancel matchmaking
  const handleCancelFind = () => {
    playClickSound();
    multiplayer.cancelFind();
  };
  
  // Handle play computer
  const handlePlayComputer = () => {
    playClickSound();
    if (!name.trim()) return;
    setPlayerName(name);
    setPlayerColor('white');
    setTimeControl(selectedTimeControl);
    resetGame();
    setMode('vs-computer');
  };
  
  // Handle open leaderboard
  const handleOpenLeaderboard = () => {
    playClickSound();
    setMode('leaderboard');
  };
  
  const ratingTier = getRatingTier(playerStats.rating);
  
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="flex-1">
          <h1 className="text-xl sm:text-4xl font-bold mb-1">
            <span className="text-amber-600">International</span> Draughts
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground">10x10 Checkers • Play online or vs computer</p>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Connection status */}
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
            multiplayer.isConnected 
              ? "bg-green-100 dark:bg-green-900/30 text-green-600" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-500"
          )}>
            {multiplayer.isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => { playClickSound(); toggleSound(); }} className="h-8 w-8 sm:h-9 sm:w-9">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { playClickSound(); toggleMusic(); }} className="h-8 w-8 sm:h-9 sm:w-9">
            <Music className={cn("h-4 w-4", musicEnabled ? "text-amber-500" : "text-muted-foreground")} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenLeaderboard} className="hidden sm:flex">
            <Trophy className="h-4 w-4 mr-1" /> Rankings
          </Button>
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2">
                  <span className="text-lg">{playerAvatar}</span>
                  <span className="hidden sm:inline max-w-20 truncate">{playerName}</span>
                  <span className={cn("text-xs font-medium", ratingTier.color)}>{playerStats.rating}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{playerAvatar}</span>
                    <div>
                      <p className="text-sm font-medium">{playerName}</p>
                      <p className={cn("text-xs", ratingTier.color)}>{playerStats.rating} • {ratingTier.name}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Games</span><span>{playerStats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Wins</span><span className="text-green-500">{playerStats.gamesWon}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Losses</span><span className="text-red-500">{playerStats.gamesLost}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleOpenLeaderboard}>
                  <Trophy className="h-4 w-4 mr-2" /> Leaderboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={playClickSound}>
                  <BarChart3 className="h-4 w-4 mr-2" /> Statistics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={authOpen} onOpenChange={(open) => { setAuthOpen(open); if (open) { setAuthError(''); setAuthSuccess(''); }}}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => playClickSound()}>
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">{authMode === 'login' ? 'Welcome Back!' : 'Create Account'}</DialogTitle>
                  <DialogDescription>
                    {authMode === 'login' ? 'Sign in to track your progress and compete on the leaderboard' : 'Join thousands of players competing in International Draughts'}
                  </DialogDescription>
                </DialogHeader>
                
                {authError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />{authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />{authSuccess}
                  </div>
                )}
                
                <Tabs value={authMode} onValueChange={(v) => { setAuthMode(v as 'login' | 'register'); setAuthError(''); }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <Button variant="outline" className="w-full h-11" onClick={handleGoogleSignIn} disabled={isLoading}>
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                    <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div></div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
                        <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full h-11" onClick={handleLogin} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}Sign In
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4 mt-4">
                    <Button variant="outline" className="w-full h-11" onClick={handleGoogleSignIn} disabled={isLoading}>
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign up with Google
                    </Button>
                    <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div></div>
                    <div className="space-y-2">
                      <Label>Username *</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Your unique username" value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type={showPassword ? "text" : "password"} placeholder="Min 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type={showPassword ? "text" : "password"} placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}{showPassword ? 'Hide' : 'Show'} passwords
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={registerCountry} onValueChange={setRegisterCountry}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Avatar</Label>
                        <Select value={registerAvatar} onValueChange={setRegisterAvatar}>
                          <SelectTrigger><SelectValue><span className="text-lg">{registerAvatar}</span></SelectValue></SelectTrigger>
                          <SelectContent>
                            <div className="grid grid-cols-5 gap-1 p-1">
                              {AVATARS.map(avatar => (
                                <SelectItem key={avatar} value={avatar} className="text-center"><span className="text-xl">{avatar}</span></SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full h-11" onClick={handleRegister} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}Create Account
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Mobile Leaderboard Button */}
      <Button variant="outline" className="w-full mb-4 sm:hidden" onClick={handleOpenLeaderboard}>
        <Trophy className="h-4 w-4 mr-2" /> View Leaderboard
      </Button>
      
      {/* Name Input */}
      {!isLoggedIn && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Your Name</CardTitle>
            <CardDescription className="text-xs">Sign in to track your progress and rating</CardDescription>
          </CardHeader>
          <CardContent>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name..." className="max-w-sm" />
          </CardContent>
        </Card>
      )}
      
      {/* Quick Stats (if logged in) */}
      {isLoggedIn && (
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{playerAvatar}</div>
                <div>
                  <div className="font-bold text-lg">{playerName}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={cn("font-medium", ratingTier.color)}>{playerStats.rating}</span>
                    <span>•</span>
                    <span>{playerStats.gamesPlayed} games</span>
                    <span>•</span>
                    <span className="text-green-500">{playerStats.gamesWon}W</span>
                    <span className="text-red-500">{playerStats.gamesLost}L</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Crown className={cn("h-5 w-5", ratingTier.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Online Play */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Play Online
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Find an opponent and play in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Time Control</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {TIME_CONTROLS.map(tc => (
                  <Button key={tc.seconds} variant={selectedTimeControl === tc.seconds ? "default" : "outline"}
                    className={cn("text-xs sm:text-sm py-2 transition-all", selectedTimeControl === tc.seconds && "ring-2 ring-amber-400 ring-offset-1")}
                    onClick={() => { playClickSound(); setSelectedTimeControl(tc.seconds); }}>
                    <tc.icon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{tc.name}</span>
                    <span className="sm:hidden">{tc.name.replace(' min', '')}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {isFindingMatch ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                  <span className="text-sm">Finding opponent...</span>
                </div>
                <Button variant="outline" className="w-full" onClick={handleCancelFind}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            ) : (
              <Button className="w-full" size="lg" onClick={handleFindGame} disabled={!name.trim() || !multiplayer.isConnected && multiplayer.isConnecting}>
                {multiplayer.isConnecting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
                ) : (
                  <><Users className="h-4 w-4 mr-2" />Find Game</>
                )}
              </Button>
            )}
            
            {!multiplayer.isConnected && !multiplayer.isConnecting && (
              <p className="text-xs text-center text-muted-foreground">
                Click to connect to game server
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Play vs Computer */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Play vs Computer
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Practice against an AI opponent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_LEVELS.map(({ level, name, emoji, description }) => (
                  <button key={level} onClick={() => { playClickSound(); setDifficulty(level); }}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      difficulty === level 
                        ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}>
                    {difficulty === level && (
                      <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full",
                        level === 'easy' ? "bg-green-500" : level === 'medium' ? "bg-yellow-500" : "bg-red-500")}>
                        <div className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-75" />
                      </div>
                    )}
                    <span className="text-2xl sm:text-3xl mb-1">{emoji}</span>
                    <span className="text-xs sm:text-sm font-medium">{name}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{description}</span>
                    {difficulty === level && <div className="absolute inset-0 rounded-lg bg-primary/5" />}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" size="lg" variant="secondary" onClick={handlePlayComputer} disabled={!name.trim()}>
              <Bot className="h-4 w-4 mr-2" />
              Play vs Computer ({DIFFICULTY_LEVELS.find(d => d.level === difficulty)?.name})
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Rules */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">International Draughts Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <ul className="space-y-0.5 sm:space-y-1">
              <li>• 10x10 board with 20 pieces per player</li>
              <li>• White moves first</li>
              <li>• Men move diagonally forward only</li>
              <li>• Men can capture backwards</li>
            </ul>
            <ul className="space-y-0.5 sm:space-y-1">
              <li>• Kings can move multiple squares diagonally</li>
              <li>• Captures are mandatory</li>
              <li>• Multi-captures in one turn</li>
              <li>• Win by capturing all opponent pieces</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
