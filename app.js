// Sleep App - Main Application Logic

// Web Audio API for generating ambient sounds
let audioContext = null;
let oscillators = [];
let gainNodes = [];
let noiseBuffer = null;

// Sound metadata
const SOUND_INFO = {
    ocean: { name: 'Ocean Waves', theme: 'ocean-theme', icon: '🌊', freq: [80, 120, 100] },
    forest: { name: 'Forest Ambience', theme: 'forest-theme', icon: '🌲', freq: [150, 200, 180] },
    snow: { name: 'Snow Silence', theme: 'snow-theme', icon: '❄️', freq: [200, 250, 220] }
};

// DOM Elements
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
let masterGain = null;

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

    // If playing, switch to new sound
    if (isPlaying) {
        playAmbientSound(sound);
    }
}

// Initialize Web Audio API
function initAudio() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);

    // Create white noise buffer for ambient sounds
    createNoiseBuffer();
}

// Create white noise for realistic ambient sounds
function createNoiseBuffer() {
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    window.noiseBuffer = noiseBuffer;
}

// Play ambient sound using Web Audio API
function playAmbientSound(soundType) {
    if (!audioContext) initAudio();

    // Stop any existing sounds
    stopSound();

    const frequencies = SOUND_INFO[soundType].freq;

    // Create noise source
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = window.noiseBuffer;
    noiseSource.loop = true;

    // Create filter for different characteristics
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';

    if (soundType === 'ocean') {
        filter.frequency.value = 800;
        filter.Q.value = 1;
    } else if (soundType === 'forest') {
        filter.frequency.value = 1200;
        filter.Q.value = 0.5;
    } else if (soundType === 'snow') {
        filter.frequency.value = 6000;
        filter.Q.value = 0.3;
    }

    // Connect nodes
    noiseSource.connect(filter);
    filter.connect(masterGain);

    // Add subtle low frequency oscillators for ambient feel
    const osc = audioContext.createOscillator();
    osc.frequency.value = frequencies[0];
    osc.type = 'sine';

    const oscGain = audioContext.createGain();
    oscGain.gain.value = 0.02;

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    noiseSource.start(0);
    osc.start(0);

    oscillators.push(osc);
    gainNodes.push(oscGain);
    oscillators.push(noiseSource);
}

function stopSound() {
    oscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
    });
    oscillators = [];
    gainNodes = [];
}

function togglePlayPause() {
    if (isPlaying) {
        stopSound();
        isPlaying = false;
        playBtn.classList.remove('playing');
        playBtn.textContent = '▶';
    } else {
        try {
            initAudio();
            playAmbientSound(currentSound);
            isPlaying = true;
            playBtn.classList.add('playing');
            playBtn.textContent = '⏸';
        } catch (err) {
            console.error('Play failed:', err);
            alert('Unable to play audio. Your browser may not support Web Audio API.');
        }
    }
}

// Volume Control
function setVolume(value) {
    if (masterGain) {
        masterGain.gain.value = value / 100;
    }
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
