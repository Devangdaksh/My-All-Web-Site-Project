// Handles timer creation, countdown, progress bar, alarm sound, and theme switching.

const timersContainer = document.getElementById("timersContainer");
const addTimerBtn = document.getElementById("addTimer");
const alarm = document.getElementById("alarm");
const darkModeToggle = document.getElementById("darkModeToggle");

// Format seconds into HH:MM:SS string
function formatTime(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Handle Add Timer button click: validate input, create timer, reset fields
addTimerBtn.addEventListener("click", () => {
  let h = parseInt(document.getElementById("hours").value) || 0;
  let m = parseInt(document.getElementById("minutes").value) || 0;
  let s = parseInt(document.getElementById("seconds").value) || 0;

  // Clamp input values to allowed ranges
  h = Math.min(Math.max(h, 0), 99);
  m = Math.min(Math.max(m, 0), 59);
  s = Math.min(Math.max(s, 0), 59);

  const label = document.getElementById("label").value.trim() || "Unnamed Timer";
  const totalSeconds = h * 3600 + m * 60 + s;
  if (totalSeconds <= 0) return alert("Enter a valid time!");

  const timer = createTimer(totalSeconds, label);
  if (timer && typeof timer.start === "function") timer.start();

  // Clear input fields after adding timer
  document.getElementById("hours").value = "";
  document.getElementById("minutes").value = "";
  document.getElementById("seconds").value = "";
  document.getElementById("label").value = "";
});

// Create a timer UI element and logic for countdown, progress, and controls
function createTimer(totalSeconds, labelText) {
  const timerBox = document.createElement("div");
  timerBox.className = "timer-box";

  const labelTime = document.createElement("div");
  labelTime.className = "label-time";

  const labelEl = document.createElement("div");
  labelEl.className = "timer-label";
  labelEl.textContent = labelText;

  const timeDisplay = document.createElement("div");
  timeDisplay.className = "timer-time";
  timeDisplay.textContent = formatTime(totalSeconds);

  // Progress bar setup
  const progress = document.createElement("div");
  progress.className = "progress";
  const progressFill = document.createElement("div");
  progressFill.className = "progress-fill";
  progress.appendChild(progressFill);

  labelTime.append(labelEl, timeDisplay, progress);

  const controls = document.createElement("div");
  controls.className = "controls";

  const startBtn = document.createElement("button");
  startBtn.textContent = "Start";

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  controls.append(startBtn, resetBtn, deleteBtn);

  // Remove timer from DOM and stop interval
  function remove() {
    clearInterval(interval);
    timerBox.remove();
  }

  deleteBtn.addEventListener("click", remove);

  timerBox.append(labelTime, controls);
  timersContainer.append(timerBox);

  let timeLeft = totalSeconds;
  let interval = null;
  let running = false;

  // Update progress bar color and width based on remaining time
  function updateProgressBar(fill, percent) {
    fill.style.width = percent + "%";
    if (percent <= 20) {
      fill.style.backgroundColor = "red";
    } else if (percent <= 50) {
      fill.style.backgroundColor = "orange";
    } else {
      fill.style.backgroundColor = "limegreen";
    }
  }

  // Update timer display and progress bar
  function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    const percent = Math.floor((timeLeft / totalSeconds) * 100);
    updateProgressBar(progressFill, percent);
  }

  // Reset timer to original value and update UI
  function reset() {
    clearInterval(interval);
    running = false;
    timeLeft = totalSeconds;
    updateProgressBar(progressFill, 100);
    updateDisplay();
    startBtn.textContent = "Start";
  }

  // Start countdown interval, handle completion and alarm
  function start() {
    if (running || timeLeft <= 0) return;
    running = true;
    startBtn.textContent = "Pause";

    interval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(interval);
        running = false;
        startBtn.textContent = "Start";
        updateDisplay();
        alarm.play();
        alert(`"${labelText}" timer is done!`);
        reset(); // Auto-reset after completion
      }
    }, 1000);
  }

  // Pause countdown interval
  function pause() {
    running = false;
    clearInterval(interval);
    startBtn.textContent = "Resume";
  }

  startBtn.addEventListener("click", () => {
    running ? pause() : start();
  });

  resetBtn.addEventListener("click", reset);

  updateProgressBar(progressFill, 100); // Set initial progress bar
  updateDisplay(); // Set initial time display

  // Return start method for auto-start
  return { start };
}

// ------------------------------
// Theme Handling
// ------------------------------

// Apply dark or light theme to body and toggle icon
function applyTheme(mode) {
    const isDark = mode === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
}

// Automatically switch theme based on time unless manual override
function autoTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'manual') return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Enable dark mode between 8:30 PM and 6:00 AM
    if (hour > 20 || (hour === 20 && minute >= 30) || hour < 6) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}

// On page load: set theme, start clock, render alarms
document.addEventListener('DOMContentLoaded', () => {
    autoTheme();
    updateClock();
    renderAlarmList();
});

// Re-check theme every 5 minutes for auto mode
setInterval(autoTheme, 5 * 60 * 1000);

// Manual dark mode toggle button
darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', 'manual');
});
