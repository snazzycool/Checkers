# 📱 Mobile App Deployment Guide

## Complete Guide to Publishing Your International Draughts App

This guide will walk you through converting your web app to a mobile app and publishing it to Google Play Store and Apple App Store.

---

## 🔄 **How Mobile App Conversion Works**

```
┌────────────────────────────────────────────────────────────┐
│                  YOUR APP CONVERSION                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 1: Web App (Already Done! ✅)                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Next.js Application                                  │ │
│  │  - Game Board UI                                      │ │
│  │  - Game Logic (Draughts rules)                        │ │
│  │  - AI Opponent                                        │ │
│  │  - Local Storage for save data                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                          ↓                                 │
│  Step 2: Static Export                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Export to Static HTML/CSS/JS                         │ │
│  │  Command: bun run export                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                          ↓                                 │
│  Step 3: Capacitor Wrapper                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Wraps static files in native container               │ │
│  │  Command: bunx cap sync                               │ │
│  └──────────────────────────────────────────────────────┘ │
│                          ↓                                 │
│  Step 4: Native Projects                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐      │
│  │  Android Project    │    │  iOS Project        │      │
│  │  (Android Studio)   │    │  (Xcode)            │      │
│  │  → APK/AAB file     │    │  → IPA file         │      │
│  └─────────────────────┘    └─────────────────────┘      │
│                          ↓                                 │
│  Step 5: App Stores                                        │
│  ┌─────────────────────┐    ┌─────────────────────┐      │
│  │  Google Play Store  │    │  Apple App Store    │      │
│  │  📱 Android         │    │  📱 iOS             │      │
│  │  $25 one-time fee   │    │  $99/year fee       │      │
│  └─────────────────────┘    └─────────────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 **Prerequisites**

### For Google Play Store (Android):
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Android Studio (free)
- [ ] Java JDK 17+

### For Apple App Store (iOS):
- [ ] Apple Developer Account ($99/year)
- [ ] Mac computer (required for Xcode)
- [ ] Xcode (free from Mac App Store)

---

## 🚀 **Step-by-Step: Build Your Mobile App**

### **Step 1: Install Requirements**

```bash
# Capacitor is already installed in your project

# For Android (you also need Android Studio)
# Download from: https://developer.android.com/studio

# For iOS (you need a Mac with Xcode)
# Download Xcode from Mac App Store
```

### **Step 2: Create App Icons**

Your app needs icons in multiple sizes. Create or generate these:

| Size | Android | iOS |
|------|---------|-----|
| 72x72 | mipmap-hdpi | - |
| 96x96 | mipmap-xhdpi | - |
| 128x128 | mipmap-xxhdpi | - |
| 144x144 | mipmap-xxxhdpi | - |
| 152x152 | - | iPad |
| 167x167 | - | iPad Pro |
| 180x180 | - | iPhone |

**Option A: Generate Icons Online**
1. Go to [makeappicon.com](https://makeappicon.com) (free)
2. Upload a 1024x1024 image
3. Download generated icons
4. Place in `/public/icons/`

**Option B: Use AI to Generate**
Use any AI image generator with prompt:
```
"Checkers board game icon, minimalist, 1024x1024, app icon style, amber and brown colors"
```

### **Step 3: Build and Sync**

```bash
# Build the static export
bun run export

# Add Android platform (first time)
bunx cap add android

# Add iOS platform (first time, Mac only)
bunx cap add ios

# Sync after each build
bun run mobile:sync
```

### **Step 4: Open in IDE**

```bash
# Open Android project
bun run mobile:android

# Open iOS project (Mac only)
bun run mobile:ios
```

---

## 🤖 **Publish to Google Play Store**

### **Step 1: Create Developer Account**

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay $25 one-time fee
3. Complete account setup

### **Step 2: Create App in Console**

1. Click **Create App**
2. Fill in app details:
   - App name: "International Draughts"
   - Language: English
   - Free or Paid: Free
3. Accept terms and click **Create App**

### **Step 3: Complete Store Listing**

Fill in these sections:

**Main Store Listing:**
- App name: International Draughts
- Short description: "Play 10x10 International Draughts online or vs AI"
- Full description: (use the description from README.md)
- App icon: Upload your 512x512 icon
- Screenshots: Take screenshots of your app running

**Content Rating:**
- Complete the questionnaire (it's a board game, no violence)

**Target Audience:**
- Select appropriate age groups

### **Step 4: Build Signed APK/AAB**

In Android Studio:

1. Open your project: `android/` folder
2. Build → Generate Signed Bundle/APK
3. Create new keystore (save this file!)
4. Select **Android App Bundle**
5. Build release version

### **Step 5: Upload to Play Store**

1. In Play Console, go to **Release** → **Production**
2. Click **Create New Release**
3. Upload your `.aab` file
4. Fill in release notes
5. Click **Start Rollout**

**Your app will be reviewed (1-7 days)**

---

## 🍎 **Publish to Apple App Store**

### **Step 1: Create Developer Account**

1. Go to [developer.apple.com](https://developer.apple.com)
2. Enroll ($99/year)
3. Complete setup

### **Step 2: Create App in App Store Connect**

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **+** → **New App**
3. Fill in details:
   - App name: International Draughts
   - Primary language: English
   - Bundle ID: com.draughts.game

### **Step 3: Build in Xcode**

1. Open `ios/App/App.xcworkspace`
2. Select your team
3. Set version and build number
4. Product → Archive
5. Upload to App Store

### **Step 4: Complete Store Listing**

Fill in:
- Screenshots for different devices
- App description
- Keywords
- Support URL
- Privacy policy URL

### **Step 5: Submit for Review**

1. In App Store Connect, go to your app
2. Add build from Xcode
3. Click **Submit for Review**

**Your app will be reviewed (1-3 days typically)**

---

## 💰 **Cost Breakdown**

| Item | Cost | Frequency |
|------|------|-----------|
| Google Play Developer Account | $25 | One-time |
| Apple Developer Account | $99 | Yearly |
| App icon design (optional) | $0-50 | One-time |
| Screenshot design (optional) | $0-20 | One-time |
| **Total First Year** | **$124-194** | - |
| **Yearly Renewal** | **$99** | Apple only |

---

## ⚠️ **Important Notes**

### **What Works Offline:**
- ✅ Play vs AI (Computer opponent)
- ✅ Game rules and validation
- ✅ Timer functionality
- ✅ Move history
- ✅ Local player stats

### **What Requires Internet:**
- ❌ Multiplayer (online games)
- ❌ Real-time chat
- ❌ Global leaderboard sync

### **For Full Online Features:**
You would need to host a backend server:
- Option 1: Railway ($5/month)
- Option 2: Render (free tier available)
- Option 3: Your own server

---

## 📱 **Alternative: PWA (No App Store Needed)**

If you don't want to pay developer fees, your app is already a **Progressive Web App**:

1. Deploy to any web host (Vercel, Netlify, etc.)
2. Users can "Install" it from their browser
3. Works like a native app on home screen
4. Completely free!

**Installation Instructions for Users:**
- **Android**: Chrome menu → "Add to Home Screen"
- **iOS**: Safari share button → "Add to Home Screen"

---

## 🎯 **Quick Decision Guide**

| Situation | Recommended Path |
|-----------|-----------------|
| Want to reach Android users only | Google Play ($25) |
| Want to reach iOS users only | App Store ($99/year) |
| Want maximum reach | Both stores |
| Don't want to pay fees | PWA (free!) |
| Need online multiplayer | PWA + Backend hosting |

---

## 🆘 **Need Help?**

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Apple App Store Help](https://developer.apple.com/help/app-store-connect)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

## ✅ **Checklist Before Publishing**

- [ ] App icons created (all sizes)
- [ ] App tested on real devices
- [ ] Screenshots taken (3-8 per device size)
- [ ] Description written
- [ ] Privacy policy URL ready
- [ ] Support email/URL ready
- [ ] Developer account created
- [ ] Keystore saved securely (Android)
- [ ] Certificates created (iOS)

---

Good luck with your app launch! 🚀
