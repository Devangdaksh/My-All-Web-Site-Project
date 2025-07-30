/*------------------------------
Get references to all necessary DOM elements
------------------------------*/
const clockDisplay = document.getElementById('clockDisplay');
const alarmTimeInput = document.getElementById('alarmTime');
const alarmLabelInput = document.getElementById('alarmLabel');
const setAlarmBtn = document.getElementById('setAlarmBtn');
const clearAlarmBtn = document.getElementById('clearAlarmBtn');
const alarmStatus = document.getElementById('alarmStatus');
const alarmSound = document.getElementById('alarmSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const alarmList = document.getElementById('alarmList');
const darkModeToggle = document.getElementById('darkModeToggle');
const alarmModal = document.getElementById('alarmModal');
const modalLabel = document.getElementById('modalLabel');
const stopAlarmBtn = document.getElementById('stopAlarmBtn');

/*-----------------
Alarm storage
-----------------*/
let alarms = []; // Each alarm is an object with: hours, minutes, label, triggered
let autoDismissTimeout; // Stores timeout reference for auto-dismissal

/*---------------------------------
Converts time to 12-hour format with AM/PM, and optional seconds
---------------------------------*/
function formatTimeWithAmPm(hour, minute, second = 0) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12 || 12;
    return (
        (displayHour < 10 ? '0' : '') + displayHour + ':' +
        (minute < 10 ? '0' : '') + minute +
        (second !== null ? ':' + (second < 10 ? '0' : '') + second : '') +
        ' ' + ampm
    );
}

/*---------------------------------
Updates the digital and analog clock every second and checks for alarm triggers
---------------------------------*/
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    /*-------------------
    Update digital clock display
    -------------------*/
    clockDisplay.textContent = formatTimeWithAmPm(hours, minutes, seconds);

    /*-------------------
     Update analog clock hands
    -------------------*/
    const hourDeg = ((hours % 12) + minutes / 60) * 30;
    const minuteDeg = (minutes + seconds / 60) * 6;
    const secondDeg = seconds * 6;

    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

    /*-------------------
     Trigger alarms that match current hour and minute
    -------------------*/
    alarms.forEach((alarm, idx) => {
        if (!alarm.triggered && hours === alarm.hours && minutes === alarm.minutes && seconds === 0) {
            triggerAlarm(idx);
        }
    });
}

/*-----------------------------
Activates the alarm: shows modal, plays sounds, sets auto-dismiss
---------------------------------*/
function triggerAlarm(idx) {
    alarms[idx].triggered = true;
    const displayLabel = alarms[idx].label ? ` (${alarms[idx].label})` : '';

    alarmModal.style.display = 'flex';
    modalLabel.textContent = `⏰ Alarm${displayLabel} is ringing!`;

    alarmSound.loop = true;
    alarmSound.play();

    backgroundMusic.loop = true;
    backgroundMusic.play();

    clearAlarmBtn.disabled = false;
    setAlarmBtn.disabled = false;

    autoDismissTimeout = setTimeout(() => stopAlarm(), 60000);
}

/*-------------------------
Stops the alarm sound and modal, and resets UI
---------------------------------*/
function stopAlarm() {
    alarmModal.style.display = 'none';
    alarmSound.pause();
    alarmSound.currentTime = 0;
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    alarmStatus.textContent = "Alarm stopped.";
    renderAlarmList();
    clearTimeout(autoDismissTimeout);
}

/*----------------------------------------
Removes a specific alarm or all alarms if index is not provided
---------------------------------*/
function clearAlarm(idx) {
    if (typeof idx === 'number') {
        alarms.splice(idx, 1);
    } else {
        alarms = [];
        alarmSound.pause();
        alarmSound.currentTime = 0;
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        alarmStatus.textContent = "All alarms cleared.";
    }
    renderAlarmList();
}

/*--------------------------
 Displays the current list of alarms in the UI
---------------------------------*/
function renderAlarmList() {
    alarmList.innerHTML = '';
    alarms.forEach((alarm, idx) => {
        const li = document.createElement('li');
        const labelText = alarm.label ? ` - "${alarm.label}"` : '';
        li.textContent = `${String(alarm.hours).padStart(2, '0')}:${String(alarm.minutes).padStart(2, '0')}${labelText}`;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = () => clearAlarm(idx);
        li.appendChild(removeBtn);
        alarmList.appendChild(li);
    });
    clearAlarmBtn.disabled = alarms.length === 0;
}

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

/*----------------------------------
 Replace native time input with custom dropdown selectors
---------------------------------*/
if (alarmTimeInput) {
    alarmTimeInput.style.display = 'none';

    const timeSelectorWrapper = document.createElement('div');
    timeSelectorWrapper.style.display = 'flex';
    timeSelectorWrapper.style.justifyContent = 'center';
    timeSelectorWrapper.style.alignItems = 'center';
    timeSelectorWrapper.style.gap = '5px';
    timeSelectorWrapper.style.marginTop = '10px';

    const hourSelect = document.createElement('select');
    hourSelect.id = 'alarmHour';
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        hourSelect.appendChild(option);
    }

    const minuteSelect = document.createElement('select');
    minuteSelect.id = 'alarmMinute';
    for (let i = 0; i < 60; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        minuteSelect.appendChild(option);
    }

    const ampmSelect = document.createElement('select');
    ampmSelect.id = 'alarmAmPm';
    ['AM', 'PM'].forEach(period => {
        const option = document.createElement('option');
        option.value = period;
        option.textContent = period;
        ampmSelect.appendChild(option);
    });

    timeSelectorWrapper.appendChild(hourSelect);
    timeSelectorWrapper.appendChild(document.createTextNode(':'));
    timeSelectorWrapper.appendChild(minuteSelect);
    timeSelectorWrapper.appendChild(ampmSelect);
    alarmTimeInput.parentElement.appendChild(timeSelectorWrapper);
}

/*-------------------------------
 Handle alarm creation on button click
---------------------------------*/
setAlarmBtn.addEventListener('click', () => {
    const hour = parseInt(document.getElementById('alarmHour').value, 10);
    const minute = parseInt(document.getElementById('alarmMinute').value, 10);
    const ampm = document.getElementById('alarmAmPm').value;

    let hours = hour;
    if (ampm === 'PM' && hour !== 12) hours += 12;
    if (ampm === 'AM' && hour === 12) hours = 0;

    const labelValue = alarmLabelInput.value.trim();

    const exists = alarms.some(a => a.hours === hours && a.minutes === minute && a.label === labelValue);
    if (exists) {
        alarmStatus.textContent = `Alarm already set for ${formatTimeWithAmPm(hours, minute)}${labelValue ? ` - "${labelValue}"` : ''}`;
        return;
    }

    alarms.push({ hours, minutes: minute, label: labelValue, triggered: false });

    alarmStatus.textContent = `Alarm set for ${formatTimeWithAmPm(hours, minute)}${labelValue ? ` - "${labelValue}"` : ''}`;
    renderAlarmList();

    document.getElementById('alarmHour').selectedIndex = 0;
    document.getElementById('alarmMinute').selectedIndex = 0;
    document.getElementById('alarmAmPm').selectedIndex = 0;
    alarmLabelInput.value = '';
});

/*---------------------------
 Clear all alarms when button is clicked
---------------------------------*/
clearAlarmBtn.addEventListener('click', () => {
    clearAlarm();
});

/*---------------------------
 Toggle dark/light mode manually
---------------------------------*/
darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', 'manual'); // Lock to manual mode
});

/*---------------------------
 Stop alarm sound and modal when stop button is clicked
---------------------------------*/
stopAlarmBtn.addEventListener('click', stopAlarm);

/*---------------------------
 Initial rendering of alarms
---------------------------------*/
renderAlarmList();

/*---------------------------
 Display a modal preview of the alarm (unused in current logic)
---------------------------------*/
function showAlarmModal(alarm) {
    modalLabel.textContent = formatTimeWithAmPm(alarm.hour, alarm.minute) + ' - ' + alarm.label;
    alarmModal.style.display = 'block';
}
/*-----------------
 Close the alarm modal when clicking outside of it
---------------------------------*/
alarmModal.addEventListener('click', (event) => {
    if (event.target === alarmModal) {
        alarmModal.style.display = 'none';
    }
});

/* -------------------------------------------
 Initialize clock and set interval to update every second
 -------------------------------------------*/
updateClock(); // Initial call
setInterval(updateClock, 1000); // Update every second