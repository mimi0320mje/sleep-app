// Sleep App - Main Application Logic

// Audio sources for different sounds (using free CC0 licensed audio)
const AUDIO_SOURCES = {
    ocean: [
        'https://cdn.pixabay.com/media/assets/cdn-shop/20230712/original-86f32b4e-7a5e-47a0-9f04-b4ed85b8e6be.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    ],
    forest: [
        'https://cdn.pixabay.com/media/assets/cdn-shop/20221211/original-dc96e34f-0d6f-485d-b8c1-1d2cee98eb6b.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    ],
    snow: [
        'https://cdn.pixabay.com/media/assets/cdn-shop/20210831/original-2c87fa37-69cf-4e3f-b6c5-d7f47e4186fb.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    ]
};

// Sound metadata
const SOUND_INFO = {
    ocean: { name: 'Ocean Waves', theme: 'ocean-theme', icon: '🌊' },
    forest: { name: 'Forest Ambience', theme: 'forest-theme', icon: '🌲' },
    snow: { name: 'Snow Silence', theme: 'snow-theme', icon: '❄️' }
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
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    loadLocation();
    loadQuote();
    setupEventListeners();
    loadAudio('ocean');
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

    // Load new audio
    loadAudio(sound);

    // If playing, restart with new sound
    if (isPlaying) {
        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(err => console.log('Autoplay prevented:', err));
    }
}

// Audio Management
function loadAudio(sound) {
    const sources = AUDIO_SOURCES[sound];
    if (!sources) return;

    audioPlayer.src = sources[0];
    audioPlayer.crossOrigin = 'anonymous';
    audioPlayer.loop = true;
    audioPlayer.preload = 'auto';

    console.log(`Loading audio: ${sound} from ${sources[0]}`);

    // Fallback to second source if first fails
    audioPlayer.onerror = () => {
        console.warn(`Failed to load ${sources[0]}, trying fallback...`);
        if (sources[1]) {
            audioPlayer.src = sources[1];
            audioPlayer.load();
            console.log(`Switched to fallback: ${sources[1]}`);
        }
    };

    audioPlayer.load();
}

function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.classList.remove('playing');
        playBtn.textContent = '▶';
    } else {
        audioPlayer.play().catch(err => {
            console.log('Play failed:', err);
            alert('Unable to play audio. Check your internet connection.');
        });
        isPlaying = true;
        playBtn.classList.add('playing');
        playBtn.textContent = '⏸';
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

// Daily Quote
async function loadQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        quoteText.textContent = `"${data.content}"`;
        quoteAuthor.textContent = `— ${data.author.split(',')[0]}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        quoteText.textContent = '"The only real failure is not taking care of yourself."';
        quoteAuthor.textContent = '— Unknown';
    }
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

    // Audio events
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        playBtn.classList.add('playing');
        playBtn.textContent = '⏸';
    });

    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        playBtn.classList.remove('playing');
        playBtn.textContent = '▶';
    });

    // Restore volume on load
    const savedVolume = localStorage.getItem('sleepAppVolume');
    if (savedVolume) {
        volumeSlider.value = savedVolume;
        setVolume(savedVolume);
    }

    // System theme change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('sleepAppTheme')) {
            isDarkMode = e.matches;
            updateTheme();
        }
    });
}
