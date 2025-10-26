# Defendr - AI-Powered Scam Detection

Protect yourself from text scams, phishing, and fraud with instant AI-powered message analysis.

## Features

- 🤖 **AI-Powered Analysis** - Uses Claude AI to detect scams
- ⚡ **Instant Results** - Get verdict in seconds
- 🔒 **Privacy-First** - No personal data stored
- 📱 **Simple to Use** - Copy, paste, analyze
- 🎯 **High Accuracy** - Advanced pattern detection
- ✈️ **Offline Mode** - Basic checking without internet

## Tech Stack

- **Frontend:** React Native + Expo
- **Router:** Expo Router (file-based)
- **Backend:** Supabase Edge Functions
- **AI:** Anthropic Claude API
- **Styling:** React Native StyleSheet
- **Animations:** React Native Animated API
- **Error Tracking:** Sentry (optional)

## Project Structure

```
defendr/
├── app/                    # Expo Router pages
│   ├── index.jsx          # Scanner screen
│   ├── history.jsx        # Scan history
│   ├── info.jsx           # About & how-to
│   └── settings.jsx       # App settings
├── components/            # Reusable components
│   ├── ResultCard.jsx     # Analysis result display
│   ├── SplashScreen.jsx   # Loading screen
│   └── OnboardingScreen.jsx
├── constants/             # App constants
│   ├── colors.js          # Color palette
│   └── glassStyles.js     # Styling constants
├── services/              # Business logic
│   ├── scamDetection.js   # AI analysis
│   └── storage.js         # Async storage
├── supabase/              # Backend
│   └── functions/
│       └── analyze/       # Edge function
├── assets/                # Images & icons
└── .env                   # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 20.19.4+
- npm or yarn
- EAS CLI: `npm install -g eas-cli`
- Expo Go app (for testing)

### Installation

```bash
# Clone repository
git clone https://github.com/djdallas/defendr.git
cd defendr

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env
```

### Local Development

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Backend Setup

See [SETUP.md](./SETUP.md) for complete Supabase and Sentry configuration.

Quick start:
```bash
# Deploy Supabase function
supabase functions deploy analyze

# Set API key secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## Building & Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete build and App Store submission guide.

Quick build:
```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production
```

## Configuration

### Environment Variables

**Local (.env):**
```bash
EXPO_PUBLIC_API_ENDPOINT=https://xxx.supabase.co/functions/v1/analyze
```

**Production (eas.json):**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_ENDPOINT": "https://xxx.supabase.co/functions/v1/analyze",
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your_anon_key"
      }
    }
  }
}
```

## Documentation

- [SETUP.md](./SETUP.md) - Backend setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Build & App Store submission
- [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) - Privacy policy
- [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md) - Terms of service

## Features Roadmap

### Current (v1.0)
- ✅ AI scam detection
- ✅ Scan history
- ✅ Offline mode
- ✅ Privacy-first design

### Planned (v1.1+)
- [ ] Reported scam database
- [ ] Share scam warnings
- [ ] Browser extension
- [ ] Email scam detection

## Contributing

This is a personal project, but suggestions are welcome! Open an issue to discuss.

## License

Private project. All rights reserved.

## Support

- **Issues:** [GitHub Issues](https://github.com/djdallas/defendr/issues)
- **Email:** your@email.com

## Acknowledgments

- Powered by [Anthropic Claude](https://www.anthropic.com/)
- Built with [Expo](https://expo.dev/)
- Backend by [Supabase](https://supabase.com/)

---

**Stay safe. Stay protected. Use Defendr.**
