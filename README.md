# Scam Shield - AI-Powered Text Message Scam Detector

<div align="center">
  <h3>Protect yourself from the $1 billion text scam epidemic</h3>
  <p>Using Claude AI to instantly identify scam messages and keep you safe</p>
</div>

## 📱 About Scam Shield

Scam Shield is a React Native mobile application that uses Claude AI (Anthropic) to analyze suspicious text messages and determine if they're scams, suspicious, or legitimate. With over $1 billion stolen through text scams in the last 3 years, this app provides critical protection for mobile users.

### Key Features

- **Instant Analysis**: Paste any suspicious message for immediate AI-powered scanning
- **Offline Detection**: Basic pattern matching works without internet connection
- **Scan History**: Track all your scanned messages with detailed results
- **Educational Content**: Learn about common scam types and red flags
- **Share Warnings**: Alert friends and family about detected scams
- **Privacy-First**: Messages analyzed anonymously, history stored locally

## 🚀 Quick Start

### Prerequisites

- Node.js 20.11+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scam-shield.git
   cd scam-shield
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Anthropic API key:
   ```
   EXPO_PUBLIC_ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 🏗️ Project Structure

```
scam-shield/
├── app/                    # Expo Router screens
│   ├── _layout.jsx        # Root layout with tabs
│   ├── index.jsx          # Main scanner screen
│   ├── history.jsx        # Scan history screen
│   └── info.jsx           # Education/info screen
├── components/            # Reusable UI components
│   └── ResultCard.jsx     # Displays scan results
├── api/                   # API integration
│   ├── claude.js          # Claude AI integration
│   └── serverless-example.js # Production serverless function
├── constants/             # App constants
│   ├── colors.js          # Color theme
│   └── scamPatterns.js    # Offline scam detection patterns
├── utils/                 # Utility functions
│   └── storage.js         # AsyncStorage helpers
├── assets/                # Images and fonts
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🔑 API Configuration

### Development Setup

For development, you can use the API key directly in your `.env` file. The app will make direct calls to Claude API.

⚠️ **WARNING**: Never commit your `.env` file or expose your API key in production builds!

### Production Setup

For production, you MUST use a serverless function to protect your API key:

1. **Deploy the serverless function** (see `api/serverless-example.js`)

   **Vercel deployment:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

   **Netlify deployment:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. **Update your environment variable**
   ```
   EXPO_PUBLIC_API_ENDPOINT=https://your-api.vercel.app/api/analyze
   ```

3. **Modify `api/claude.js`** to use the serverless endpoint:
   ```javascript
   const SERVERLESS_ENDPOINT = process.env.EXPO_PUBLIC_API_ENDPOINT;
   ```

## 📲 Building for Production

### iOS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android Build

```bash
# Build for Android
eas build --platform android
```

### Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Test message pasting from clipboard
- [ ] Verify scam detection accuracy with known scam messages
- [ ] Test offline pattern matching (airplane mode)
- [ ] Verify history saves correctly
- [ ] Test on various screen sizes
- [ ] Verify haptic feedback works
- [ ] Test share functionality

### Example Test Messages

**Known Scam:**
```
USPS: Your package is awaiting delivery. Please pay the $1.99 shipping fee: bit.ly/fake123
```

**Toll Scam:**
```
E-ZPass: You have an unpaid toll of $11.69. Pay immediately to avoid $50 late fee: suspicious-link.com
```

**Legitimate:**
```
Your Amazon order #123-456 has been delivered to your front door.
```

## 🎯 Key Features Explained

### Offline Pattern Matching

The app includes built-in pattern matching for common scam indicators:
- Known scam amounts ($11.69, $12.51)
- Urgent language patterns
- Suspicious URLs
- Impersonation attempts

This provides basic protection even without internet access.

### Claude AI Integration

When online, the app uses Claude's advanced language model to:
- Analyze message context and intent
- Identify sophisticated scam tactics
- Provide confidence scores
- Recommend specific actions

### Privacy & Security

- **No personal data collection**: Messages are analyzed anonymously
- **Local storage only**: History never leaves your device
- **Secure API calls**: Production uses serverless functions
- **No tracking**: No analytics or user tracking by default

## 🛠️ Customization

### Changing Colors

Edit `constants/colors.js` to customize the app theme:

```javascript
export const Colors = {
  primary: '#3B82F6',     // Main brand color
  danger: '#EF4444',      // Scam indicators
  warning: '#F59E0B',     // Suspicious indicators
  success: '#10B981',     // Safe indicators
};
```

### Adding Scam Patterns

Edit `constants/scamPatterns.js` to add new detection patterns:

```javascript
tollScamAmounts: [
  /\$11\.69/,
  /\$12\.51/,
  // Add new amounts here
],
```

### Modifying the Claude Prompt

Edit the prompt in `api/claude.js` to adjust analysis criteria:

```javascript
const SCAM_DETECTION_PROMPT = `
  // Modify analysis criteria here
`;
```

## 🐛 Troubleshooting

### Common Issues

**"API key not configured"**
- Ensure `.env` file exists with valid API key
- Restart Expo server after adding environment variables

**"Analysis failed"**
- Check internet connection
- Verify API key is valid
- Check Claude API status

**Clipboard not working**
- Grant clipboard permissions in device settings
- Update Expo Go app to latest version

**Build errors**
- Clear cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 📚 Architecture Decisions

### Why Expo Managed Workflow?
- Easier deployment and updates
- Built-in OTA updates
- Simplified build process
- Better for entry-level developers

### Why JavaScript (not TypeScript)?
- Lower learning curve
- Faster prototyping
- Simpler for educational purposes
- Reduces complexity for beginners

### Why React Native Paper?
- Material Design out of the box
- Comprehensive component library
- Good accessibility support
- Active maintenance

### Why Claude AI?
- Excellent at text analysis
- Strong safety features
- Good at identifying deception
- Cost-effective Haiku model

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is MIT licensed. See LICENSE file for details.

## 🙏 Acknowledgments

- Anthropic for Claude AI
- Expo team for the amazing framework
- React Native community
- Everyone fighting against scams

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues first
- Provide detailed reproduction steps

## 🚨 Disclaimer

While Scam Shield uses advanced AI to detect scams, it's not 100% accurate. Always use your judgment and verify suspicious messages through official channels. This app is a tool to help identify potential scams but should not be your only line of defense.

---

<div align="center">
  <p><strong>Stay Safe. Stay Protected. Use Scam Shield.</strong></p>
  <p>Built with ❤️ to protect people from text scams</p>
</div># Shield
