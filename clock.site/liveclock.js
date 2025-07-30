/*-------------------------------------------
Run this script once the HTML content is fully loaded
--------------------------------------------*/
document.addEventListener('DOMContentLoaded', () => {
    
    /*-------------------
    Element References 
    --------------------*/
    const hourHand = document.getElementById('hourHand');         
    const minuteHand = document.getElementById('minuteHand');     
    const secondHand = document.getElementById('secondHand');     
    const digitalClock = document.getElementById('digitalClock'); 
    const dateDisplay = document.getElementById('dateDisplay');   
    const ampmToggle = document.getElementById('ampmToggle');   

    /*----------------------------------
      Updates both the analog and digital clocks every second.
      Also updates the date display.
     ----------------------------------*/
    function updateClocks() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        /*----------------------
         Analog Clock Rotation Calculation 
         ---------------------*/
        const hourDeg = ((hours % 12) + minutes / 60) * 30; 
        const minuteDeg = (minutes + seconds / 60) * 6;      
        const secondDeg = seconds * 6;                       

        /*-------------------------
        Apply rotation to clock hands 
        -----------------------*/
        hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

        /* ------------------------------
         Digital Clock with Optional AM/PM Display 
         ------------------------- */
        let displayHours = hours;
        let ampm = '';

        if (ampmToggle.checked) {
            ampm = hours >= 12 ? 'PM' : 'AM';
            displayHours = hours % 12;
            if (displayHours === 0) displayHours = 12; // 12 AM or 12 PM
        }

        digitalClock.textContent = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${ampm ? ' ' + ampm : ''}`;

        /*------------------- 
        Date Display 
        -------------------*/
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        dateDisplay.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    // Call updateClocks once immediately and then every second
    setInterval(updateClocks, 1000);
    updateClocks();

    // Re-render clock when AM/PM toggle is changed
    ampmToggle.addEventListener('change', updateClocks);

    /*------------------ 
    Dark Mode Toggle Logic 
    ------------------------*/
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = document.body.classList.contains('dark-mode')
            ? '☀️'
            : '🌙';
    });

    /*----------------------------------
      Automatically enable dark mode after 8:30 PM and revert during the day.
      Runs every minute to check time.
     --------------------------------------*/
    function autoDarkMode() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isNight = hour > 20 || (hour === 20 && minute >= 30);

        if (isNight && !document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        } else if (!isNight && document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            darkModeToggle.textContent = '🌙';
        }
    }

    autoDarkMode();                    
    setInterval(autoDarkMode, 60000); 

    /*------------------- 
    OPTIONAL CLOCK NUMBER POSITIONING 
    ---------------------*/
    const numbers = document.querySelectorAll('.clock-number');
    const numRadius = 42; // Relative radius (in percent of container) for number positioning

    numbers.forEach(num => {
        const n = parseInt(num.dataset.num, 10);                  // Get clock number (1-12)
        const angle = (n - 3) * (Math.PI / 6);                    // Shift by -90° to start at top
        const x = 50 + numRadius * Math.cos(angle);              // X position as % of container
        const y = 50 + numRadius * Math.sin(angle);              // Y position as % of container
        num.style.left = `${x}%`;
        num.style.top = `${y}%`;
    });

    /*-------------------------
    OPTIONAL CLOCK TICK MARK POSITIONING
    -------------------------*/
    const ticks = document.querySelectorAll('.tick');
    const tickRadius = 48; // Slightly larger than number radius

    ticks.forEach((tick, i) => {
        const angle = (i - 3) * (Math.PI / 6);                    // Rotate to correct tick angle
        const x = 50 + tickRadius * Math.cos(angle);
        const y = 50 + tickRadius * Math.sin(angle);

        // Style each tick mark with centered transform and rotation
        tick.style.position = 'absolute';
        tick.style.left = `${x}%`;
        tick.style.top = `${y}%`;
        tick.style.width = '3%';
        tick.style.height = '8%';
        tick.style.background = 'currentColor';
        tick.style.transform = `translate(-50%, -50%) rotate(${i * 30}deg)`;
        tick.style.borderRadius = '2px';
        tick.style.opacity = '0.7';
        tick.style.pointerEvents = 'none';
        tick.style.zIndex = '0';
    });
});
// End of liveclock.js