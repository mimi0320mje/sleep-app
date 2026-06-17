# Sleep App 🌙

A calming, mobile-friendly web app for ambient sounds, meditation music, and sleep aids.

## Features

- **Ambient White Noise**: Ocean waves, forest ambience, snow silence with real-time streaming
- **Time-Based Theming**: Automatic dark mode at night, customizable light/dark toggle
- **Meditation Music**: Curated links to YouTube and Spotify meditation playlists
- **Location Display**: Shows your IP address and geolocation (city, country)
- **Daily Quote**: Inspiring quotes to help you relax
- **Clean, Responsive Design**: Optimized for mobile with a calming aesthetic
- **Persistent Settings**: Your volume, theme, and sound choices are saved locally

## How to Use

1. Open `index.html` in your web browser (mobile or desktop)
2. Select your preferred ambient sound (Ocean, Forest, or Snow)
3. Adjust the volume to your liking
4. Click the play button to start
5. Toggle between light and dark mode with the theme button (🌙/☀️)
6. Explore meditation music links in the "Meditation Music" section

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no build system required)
- **APIs Used** (all free tier):
  - [ipwho.is](https://ipwho.is) - Geolocation (CORS-friendly)
  - YouTube & Spotify - Meditation music links
- **Ambient audio**: real nature recordings hosted locally in `audio/` (no external dependency, works offline)
- **Quotes**: curated local set that rotates daily (no API, always available)

## Audio Credits

Ambient sounds are from the [Google Sound Library](https://developers.google.com/assistant/tools/sound-library),
licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/):

- `audio/ocean.ogg` — "Waves Crashing On Rock Beach"
- `audio/forest.ogg` — "Summer Forest"
- `audio/snow.ogg` — "Strong Wind"

## Architecture

```
sleep-app/
├── index.html      # Main HTML with embedded styles
├── app.js          # Core functionality (audio, themes, APIs)
├── README.md       # This file
└── .gitignore      # Git ignore rules
```

## Free Resources

All features use **100% free services**:
- Geolocation: ip-api.com (45 req/min free)
- Quotes: quotable.io (unlimited free)
- Ambient audio: Pixabay, Freesound CC0 sources
- Hosting: GitHub Pages
- Meditation music: YouTube, Spotify (user-directed)

## Browser Support

- Modern browsers with HTML5 Audio support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: iOS Safari, Chrome Mobile, Firefox Mobile

## Privacy

- No user data is stored except locally (theme, volume)
- Geolocation is approximate (city-level, from your public IP)
- All API calls are read-only

## Customization

You can customize the colors and sounds by editing the CSS variables in `index.html`:

```css
:root {
    --ocean-dark: #0f3a5f;
    --forest-dark: #1a3a2a;
    --snow-dark: #f5f5f5;
    /* ... */
}
```

To add new sounds, edit the `AUDIO_SOURCES` object in `app.js`:

```javascript
const AUDIO_SOURCES = {
    ocean: ['https://your-audio-url.mp3'],
    // Add more sounds here
};
```

## Troubleshooting

**Audio not playing?**
- Check your internet connection
- Ensure browser allows autoplay (some browsers block it by default)
- Try a different sound source

**Location not showing?**
- The app uses your public IP to estimate location (not GPS)
- Some VPNs or networks may block geolocation APIs

**Quote not loading?**
- This is non-critical; the app includes a fallback quote
- Check your internet connection

## Future Enhancements

- Offline support with service workers
- Custom audio upload
- Sleep timer with fade-out
- Multiple meditation music streaming options
- Sound mixing (combine multiple sounds)
- Haptic feedback (mobile)

## License

This project uses free, open resources. Attribution appreciated but not required.

---

Made with ❤️ for better sleep.
