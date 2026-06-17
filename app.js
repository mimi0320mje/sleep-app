// Sleep App - Main Application Logic

// Sound metadata — real CC-BY nature recordings hosted locally (audio/ folder)
const SOUND_INFO = {
    ocean: { name: 'Ocean Waves', theme: 'ocean-theme', icon: '🌊', file: 'audio/ocean.ogg' },
    forest: { name: 'Forest Ambience', theme: 'forest-theme', icon: '🌲', file: 'audio/forest.ogg' },
    snow: { name: 'Snow Silence', theme: 'snow-theme', icon: '❄️', file: 'audio/snow.ogg' }
};

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const volumeSlider = document.getElementById('volumeSlider');
const currentSoundDisplay = document.getElementById('currentSound');
const soundButtons = document.querySelectorAll('.sound-btn');
const themeToggle = document.getElementById('themeToggle');
const locationInfo = document.getElementById('locationInfo');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const body = document.body;

// State
let currentSound = 'ocean';
let isPlaying = false;
let isDarkMode = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadLocation();
    loadQuote();
    setupEventListeners();
    // Set up the default sound (theme, label, and audio source)
    body.classList.add(SOUND_INFO[currentSound].theme);
    currentSoundDisplay.textContent = SOUND_INFO[currentSound].name;
    audioPlayer.src = SOUND_INFO[currentSound].file;
    audioPlayer.loop = true;
});

// Theme Management
function initTheme() {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('sleepAppTheme');

    if (savedTheme) {
        isDarkMode = savedTheme === 'dark';
    } else {
        isDarkMode = systemDark;
    }

    updateTheme();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('sleepAppTheme', isDarkMode ? 'dark' : 'light');
    updateTheme();
}

function updateTheme() {
    if (isDarkMode) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
    }
}

// Sound Selection
function selectSound(sound) {
    currentSound = sound;

    // Update UI
    soundButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-sound="${sound}"]`).classList.add('active');

    // Update theme
    Object.keys(SOUND_INFO).forEach(key => {
        body.classList.remove(SOUND_INFO[key].theme);
    });
    body.classList.add(SOUND_INFO[sound].theme);

    // Update display
    currentSoundDisplay.textContent = SOUND_INFO[sound].name;

    // Switch the audio source to the new sound, keeping playback state
    audioPlayer.src = SOUND_INFO[sound].file;
    audioPlayer.loop = true;
    if (isPlaying) {
        audioPlayer.play().catch(err => console.error('Play failed:', err));
    }
}

// Audio playback — simple, reliable HTML5 <audio> with local files
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.classList.remove('playing');
        playBtn.textContent = '▶';
    } else {
        // Make sure a source is set (defaults to current sound)
        if (!audioPlayer.src) {
            audioPlayer.src = SOUND_INFO[currentSound].file;
            audioPlayer.loop = true;
        }
        audioPlayer.play().then(() => {
            isPlaying = true;
            playBtn.classList.add('playing');
            playBtn.textContent = '⏸';
        }).catch(err => {
            console.error('Play failed:', err);
            alert('Unable to play audio. Try tapping play again.');
        });
    }
}

// Volume Control
function setVolume(value) {
    audioPlayer.volume = value / 100;
    localStorage.setItem('sleepAppVolume', value);
}

// Geolocation & IP Display
async function loadLocation() {
    try {
        // Using ipwho.is - CORS-friendly API
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const ip = data.ip || '[unknown]';
        const city = data.city || 'Unknown';
        const country = data.country || 'Unknown';
        const timezone = data.timezone || '';

        locationInfo.textContent = `IP: ${ip} | ${city}, ${country}`;

        // Set dark mode based on time of day
        if (timezone && !localStorage.getItem('sleepAppTheme')) {
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 20 || hour < 6) {
                isDarkMode = true;
                updateTheme();
            }
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        locationInfo.textContent = 'IP: [loading...]';

        // Try fallback API
        try {
            const fallback = await fetch('https://api.ipify.org?format=json');
            if (fallback.ok) {
                const data = await fallback.json();
                locationInfo.textContent = `IP: ${data.ip}`;
            }
        } catch (e) {
            locationInfo.textContent = 'IP: [checking...]';
        }
    }
}

// Curated calming quotes — reliable, works offline, free forever
const QUOTES = [
    { text: 'Sleep is the best meditation.', author: 'Dalai Lama' },
    { text: 'Rest when you are weary. Refresh and renew yourself, your body, your mind, your spirit.', author: 'Ralph Marston' },
    { text: 'A good laugh and a long sleep are the two best cures for anything.', author: 'Irish Proverb' },
    { text: 'The night is the hardest time to be alive, but the dawn always comes.', author: 'Unknown' },
    { text: 'Let go of the day. Tomorrow is a fresh start.', author: 'Unknown' },
    { text: 'Quiet the mind, and the soul will speak.', author: 'Ma Jaya Sati Bhagavati' },
    { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott' },
    { text: 'Within you there is a stillness and a sanctuary to which you can retreat at any time.', author: 'Hermann Hesse' },
    { text: 'Each night, when I go to sleep, I die. And the next morning, when I wake up, I am reborn.', author: 'Mahatma Gandhi' },
    { text: 'Peace begins with a single breath.', author: 'Unknown' },
    { text: 'There is a time for many words, and there is also a time for sleep.', author: 'Homer' },
    { text: 'Take rest; a field that has rested gives a bountiful crop.', author: 'Ovid' },
    { text: 'Calmness is the cradle of power.', author: 'Josiah Gilbert Holland' },
    { text: 'Tension is who you think you should be. Relaxation is who you are.', author: 'Chinese Proverb' },
    { text: 'The day is over. You did enough. Rest now.', author: 'Unknown' }
];

// Daily Quote — same quote all day, rotates each calendar day
function loadQuote() {
    // Pick a quote based on the day of the year (stable for the whole day)
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const quote = QUOTES[dayOfYear % QUOTES.length];

    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
}

// Event Listeners
function setupEventListeners() {
    // Play button
    playBtn.addEventListener('click', togglePlayPause);

    // Sound selection
    soundButtons.forEach(btn => {
        btn.addEventListener('click', () => selectSound(btn.dataset.sound));
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Restore volume on load (or apply the slider's default so it matches)
    const savedVolume = localStorage.getItem('sleepAppVolume');
    if (savedVolume) {
        volumeSlider.value = savedVolume;
        setVolume(savedVolume);
    } else {
        setVolume(volumeSlider.value);
    }

    // System theme change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('sleepAppTheme')) {
            isDarkMode = e.matches;
            updateTheme();
        }
    });
}
