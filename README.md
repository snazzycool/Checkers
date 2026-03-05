# 🎮 International Draughts - Mobile & Web Game

A beautiful, Lichess-inspired International Draughts (10x10 Checkers) game that works on **Web, Android, and iOS**!

![International Draughts](https://img.shields.io/badge/Game-International%20Draughts-amber)
![Platforms](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20iOS-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/License-MIT-green)

## 📱 **Works Everywhere!**

```
┌─────────────────────────────────────────────────────────┐
│                  YOUR GAME, ANYWHERE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   🌐 WEB APP          📱 ANDROID        📱 iOS          │
│   ┌─────────┐        ┌─────────┐       ┌─────────┐     │
│   │ Browser │        │Play Store│       │App Store│     │
│   │  URL    │        │   APK   │       │   IPA   │     │
│   └─────────┘        └─────────┘       └─────────┘     │
│                                                         │
│   All platforms share the SAME code!                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🎯 **Game Features**
- **Full International Draughts Rules** - 10x10 board, 20 pieces per player
- **AI Opponent** - Play against computer with smart moves
- **Chess Clock** - 5, 10, 15, 20, 30 minute time controls
- **Move Validation** - All rules enforced automatically
- **King Promotion** - Pieces become Kings at the end

### 👤 **Player Features**
- **Player Profile** - Unique name, country flag, avatar
- **Rating System** - ELO rating that changes with wins/losses
- **Game History** - Track your performance
- **Offline Play** - Works without internet (vs AI)

### 💬 **Social Features**
- **In-game Chat** - Floating chat popup
- **Quick Messages** - Pre-set messages
- **Leaderboard** - Top players rankings

### 📱 **Mobile Features**
- **PWA Ready** - Install from browser
- **Native App** - Publish to Play Store & App Store
- **Offline Support** - Play anywhere
- **Mobile Optimized** - Touch-friendly design

---

## 🚀 Quick Start

### **Option 1: Run as Web App**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/international-draughts.git
cd international-draughts

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### **Option 2: Build Mobile App**

```bash
# Build static export
bun run export

# Sync with Capacitor
bun run mobile:sync

# Open in Android Studio
bun run mobile:android

# Or open in Xcode (Mac only)
bun run mobile:ios
```

---

## 📖 **Documentation**

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Web deployment guide |
| [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) | Android/iOS publishing guide |

---

## 🎮 How to Play

### Rules of International Draughts
1. **Board**: 10×10 with 20 pieces per player
2. **Movement**: Men move diagonally forward
3. **Capturing**: Men can capture backwards; captures are mandatory
4. **Kings**: Promoted at opposite end, can move multiple squares
5. **Winning**: Capture all opponent pieces or block their moves

### Controls
- **Tap** a piece to select it
- **Tap** highlighted square to move
- **Green dots** = valid moves
- **Red rings** = capture moves

---

## 🏗️ Project Structure

```
international-draughts/
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/game/     # Game components
│   ├── components/ui/       # UI components (shadcn/ui)
│   ├── lib/draughts.ts      # Game logic engine
│   └── store/gameStore.ts   # State management
├── public/
│   ├── icons/               # App icons for mobile
│   └── manifest.json        # PWA manifest
├── android/                 # Android native project (generated)
├── ios/                     # iOS native project (generated)
└── capacitor.config.ts      # Capacitor configuration
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Zustand | State management |
| Capacitor | Mobile wrapper |
| Socket.io | Real-time (optional) |

---

## 📱 Deployment Options

### **Free Option: PWA**
- Deploy to Vercel, Netlify, or any static host
- Users install from browser
- No app store fees!

### **Paid Option: App Stores**
| Store | Cost | Reach |
|-------|------|-------|
| Google Play | $25 one-time | Android users |
| Apple App Store | $99/year | iOS users |

See [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) for step-by-step guide.

---

## 🌐 Environment Variables

Create `.env` file:

```env
# Not required for offline play
# Only needed for online multiplayer features
NEXT_PUBLIC_WS_URL=ws://your-server.com
```

---

## 💰 Cost Summary

| Option | Cost | Best For |
|--------|------|----------|
| Web only (PWA) | $0 | Free distribution |
| Android only | $25 | Google Play |
| iOS only | $99/year | App Store |
| Both stores | $124 first year | Maximum reach |

---

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

---

## 📝 License

MIT License - Free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- Inspired by [Lichess](https://lichess.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

Made with ❤️ for draughts enthusiasts worldwide 🌍
