// Sleep App - Main Application Logic

// Sound metadata — real CC-BY nature recordings hosted locally (audio/ folder)
// Each scene layers a PRIMARY loop + a SECONDARY texture of a different length.
// Different loop lengths decorrelate, so the combined sound rarely repeats.
// `place` ties the location readout to a real-world ocean/forest/snow spot,
// with an IANA timezone so we can show its live local time.
const SOUND_INFO = {
    ocean: {
        name: 'Ocean Waves', theme: 'ocean-theme', icon: '🌊',
        file: 'audio/ocean.ogg', file2: 'audio/ocean2.ogg', vol2: 0.35,
        place: { name: 'Maldives', lat: 3.2028, lon: 73.2207, tz: 'Indian/Maldives' }
    },
    forest: {
        name: 'Forest Ambience', theme: 'forest-theme', icon: '🌲',
        file: 'audio/forest.ogg', file2: 'audio/forest2.ogg', vol2: 0.45,
        place: { name: 'Black Forest, Germany', lat: 48.2700, lon: 8.2000, tz: 'Europe/Berlin' }
    },
    snow: {
        name: 'Snow Silence', theme: 'snow-theme', icon: '❄️',
        file: 'audio/snow.ogg', file2: 'audio/snow2.ogg', vol2: 0.30,
        place: { name: 'Lapland, Finland', lat: 67.8200, lon: 24.8100, tz: 'Europe/Helsinki' }
    }
};

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');   // primary layer
const audioLayer2 = new Audio();                              // secondary texture layer
audioLayer2.loop = true;
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
    loadQuote();
    setupEventListeners();
    // Set up the default sound (theme, label, audio sources, location)
    body.classList.add(SOUND_INFO[currentSound].theme);
    currentSoundDisplay.textContent = SOUND_INFO[currentSound].name;
    applySources(currentSound);
    startLocationClock();
});

// Point both audio layers at the files for the given scene
function applySources(sound) {
    const info = SOUND_INFO[sound];
    audioPlayer.src = info.file;
    audioPlayer.loop = true;
    audioLayer2.src = info.file2;
    audioLayer2.loop = true;
}

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

    // Switch both audio layers to the new scene, keeping playback state
    applySources(sound);
    applyVolume();
    if (isPlaying) {
        audioPlayer.play().catch(err => console.error('Play failed:', err));
        audioLayer2.play().catch(err => console.error('Layer2 play failed:', err));
    }

    // Refresh the location readout to this scene's place immediately
    renderLocation();
}

// Audio playback — two layered HTML5 <audio> loops per scene
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        audioLayer2.pause();
        isPlaying = false;
        playBtn.classList.remove('playing');
        playBtn.textContent = '▶';
    } else {
        if (!audioPlayer.src) applySources(currentSound);
        applyVolume();
        Promise.all([
            audioPlayer.play(),
            audioLayer2.play()
        ]).then(() => {
            isPlaying = true;
            playBtn.classList.add('playing');
            playBtn.textContent = '⏸';
        }).catch(err => {
            console.error('Play failed:', err);
            alert('Unable to play audio. Try tapping play again.');
        });
    }
}

// Volume Control — master slider scales both layers (secondary is mixed lower)
function setVolume(value) {
    localStorage.setItem('sleepAppVolume', value);
    applyVolume();
}

function applyVolume() {
    const master = (localStorage.getItem('sleepAppVolume') ?? volumeSlider.value) / 100;
    audioPlayer.volume = master;
    audioLayer2.volume = master * (SOUND_INFO[currentSound].vol2 ?? 0.4);
}

// Location readout — themed to the current scene's real-world place,
// with a LIVE local clock that ticks every second (the "real-time" part).
function renderLocation() {
    const place = SOUND_INFO[currentSound].place;

    // Live local time at that place (uses the IANA timezone)
    let clock = '--:--:--';
    try {
        clock = new Intl.DateTimeFormat('en-GB', {
            timeZone: place.tz, hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date());
    } catch (e) { /* timezone unsupported — leave placeholder */ }

    // Format coordinates like a clean location readout
    const lat = `${Math.abs(place.lat).toFixed(2)}°${place.lat >= 0 ? 'N' : 'S'}`;
    const lon = `${Math.abs(place.lon).toFixed(2)}°${place.lon >= 0 ? 'E' : 'W'}`;

    locationInfo.textContent = `📍 ${place.name} · ${lat} ${lon} · ${clock}`;
}

// Tick the clock once a second so the local time stays live
function startLocationClock() {
    renderLocation();
    setInterval(renderLocation, 1000);
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
