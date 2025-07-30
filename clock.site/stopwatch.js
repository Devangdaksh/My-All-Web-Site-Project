let timer;
let milliseconds = 0;
let isRunning = false;
let lastLap = 0; // Track the last completed minute

const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const checkpointBtn = document.getElementById('checkpointBtn');
const checkpointList = document.getElementById('checkpointList');
const pauseBtn = document.getElementById('pauseBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

const hourCircle = document.querySelector('.circle-hour');
const minuteCircle = document.querySelector('.circle-minute');

const HOUR_CIRC = 2 * Math.PI * 100;    // r=100
const MIN_CIRC = 2 * Math.PI * 85;      // r=85

const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

const updateDisplay = () => {
    timerDisplay.textContent = formatTime(milliseconds);

    // Animate circles with modulo for continuous fill
    // Hour: 3600 seconds (1 hour)
    let hourPercent = ((milliseconds / 1000) % 3600) / 3600;
    hourCircle.style.strokeDashoffset = HOUR_CIRC * (1 - hourPercent);

    // Minute: 60 seconds (1 minute)
    let minutePercent = ((Math.floor(milliseconds / 1000) % 60) / 60);
    minuteCircle.style.strokeDashoffset = MIN_CIRC * (1 - minutePercent);

    // Change color after every minute (lap)
    const mins = Math.floor(milliseconds / 60000);
    if (mins !== lastLap) {
        if ((mins + 1) % 2 === 0) {
            // Even lap (after 1, 3, 5... minutes completed)
            minuteCircle.style.stroke = "#a259e6"; // purple
        } else {
            // Odd lap (after 0, 2, 4... minutes completed)
            minuteCircle.style.stroke = "#007BFF"; // blue
        }
        lastLap = mins;
    }
};

const toggleButtons = (running) => {
    startBtn.disabled = running;
    pauseBtn.disabled = false;
    pauseBtn.textContent = running ? 'Pause' : 'Resume';
};

const startTimer = () => {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            milliseconds += 10;
            updateDisplay();
        }, 10);
        toggleButtons(true);
    }
};

const pauseOrResumeTimer = () => {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        pauseBtn.textContent = 'Resume';
        startBtn.disabled = false;
    } else {
        isRunning = true;
        timer = setInterval(() => {
            milliseconds += 10;
            updateDisplay();
        }, 10);
        pauseBtn.textContent = 'Pause';
        startBtn.disabled = true;
    }
};

const resetTimer = () => {
    clearInterval(timer);
    milliseconds = 0;
    isRunning = false;
    updateDisplay();
    checkpointDisplay.textContent = '';
    checkpointList.innerHTML = '';
    startBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
};

const addCheckpoint = () => {
    if (isRunning) {
        const li = document.createElement('li');
        li.textContent = `Checkpoint: ${formatTime(milliseconds)}`;
        checkpointList.appendChild(li);
    }
};

// Initialize button states on load
toggleButtons(false);

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
checkpointBtn.addEventListener('click', addCheckpoint);
pauseBtn.addEventListener('click', pauseOrResumeTimer);
// -------------------------------------------
// Utility: Apply light or dark theme
// -------------------------------------------
function applyTheme(mode) {
    const isDark = mode === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙'; // Toggle icon
}

// -------------------------------------------
// Automatically apply theme based on time
// -------------------------------------------
function autoTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'manual') return; // Skip auto if manual mode set

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Dark mode between 8:30 PM and 6:00 AM
    if (hour > 20 || (hour === 20 && minute >= 30) || hour < 6) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}

// -------------------------------------------
// Apply theme on initial load
// -------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    autoTheme(); // Apply theme on page load
    updateClock(); // Start the clock on page load
    renderAlarmList(); // Render alarms on page load
});

// -------------------------------------------
// Re-evaluate theme every 5 minutes
// -------------------------------------------
setInterval(autoTheme, 5 * 60 * 1000);

// -------------------------------------------
// Manual Dark Mode Toggle Button Handler
// -------------------------------------------
darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', 'manual');
});
