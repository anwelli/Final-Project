// Timer functionality for Azuka Dashboard
class Timer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.timerInterval = null;
        this.alarmSound = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadAlarmSound();
        this.updateDisplay();
    }
    
    initializeElements() {
        // Timer display and controls
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('timerStart');
        this.pauseBtn = document.getElementById('timerPause');
        this.resetBtn = document.getElementById('timerReset');
        
        // Timer modal
        this.timerModal = document.getElementById('timerModal');
        
        // Preset buttons
        this.presetButtons = document.querySelectorAll('.preset-btn');
        
        // Custom timer inputs
        this.customMinutes = document.getElementById('customMinutes');
        this.customSeconds = document.getElementById('customSeconds');
        this.setCustomBtn = document.getElementById('setCustomTimer');
        
        // Alarm settings
        this.enableSound = document.getElementById('enableSound');
        this.enableNotification = document.getElementById('enableNotification');
        this.alarmSoundSelect = document.getElementById('alarmSound');
    }
    
    bindEvents() {
        // Timer control buttons
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Preset buttons
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.minutes);
                this.setTimer(minutes * 60);
            });
        });
        
        // Custom timer
        this.setCustomBtn.addEventListener('click', () => {
            const minutes = parseInt(this.customMinutes.value) || 0;
            const seconds = parseInt(this.customSeconds.value) || 0;
            this.setTimer((minutes * 60) + seconds);
        });
        
        // Quick start timer from sidebar
        const quickStartBtn = document.getElementById('quickStartTimer');
        if (quickStartBtn) {
            quickStartBtn.addEventListener('click', () => {
                this.showTimerModal();
                this.setTimer(25 * 60); // Default to 25 minutes
            });
        }
        
        // Close timer modal
        const closeBtns = this.timerModal.querySelectorAll('.close-modal');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.hideTimerModal());
        });
    }
    
    loadAlarmSound() {
        // Create audio context for alarm sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createAlarmSounds();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    createAlarmSounds() {
        // Create different alarm sounds
        this.sounds = {
            bell: this.createBellSound(),
            chime: this.createChimeSound(),
            beep: this.createBeepSound(),
            notification: this.createNotificationSound()
        };
    }
    
    createBellSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }
    
    createChimeSound() {
        // Simple chime sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 440;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }
    
    createBeepSound() {
        // Simple beep sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.value = 1000;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    createNotificationSound() {
        // Notification sound (can be replaced with actual audio file)
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    setTimer(seconds) {
        this.timeLeft = seconds;
        this.totalTime = seconds;
        this.updateDisplay();
        this.resetTimer();
    }
    
    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtonStates();
        this.timerDisplay.parentElement.classList.add('timer-running');
        this.timerDisplay.parentElement.classList.remove('timer-complete');
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }
    
    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.updateButtonStates();
        this.timerDisplay.parentElement.classList.remove('timer-running');
    }
    
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.timerDisplay.parentElement.classList.remove('timer-complete');
    }
    
    timerComplete() {
        this.pauseTimer();
        this.timerDisplay.parentElement.classList.remove('timer-running');
        this.timerDisplay.parentElement.classList.add('timer-complete');
        
        // Play alarm sound
        if (this.enableSound.checked && this.audioContext) {
            const soundType = this.alarmSoundSelect.value;
            this.playAlarmSound(soundType);
        }
        
        // Show browser notification
        if (this.enableNotification.checked && 'Notification' in window) {
            this.showBrowserNotification();
        }
        
        // Update focus time in stats
        this.updateFocusTime();
        
        // Restart timer with break if it was a focus session
        if (this.totalTime >= 25 * 60) { // If it was a long session (25+ min)
            setTimeout(() => {
                if (confirm('Focus session complete! Take a 5-minute break?')) {
                    this.setTimer(5 * 60); // 5 minute break
                    this.startTimer();
                }
            }, 1000);
        }
    }
    
    playAlarmSound(soundType) {
        if (!this.audioContext) return;
        
        switch(soundType) {
            case 'bell':
                this.createBellSound();
                break;
            case 'chime':
                this.createChimeSound();
                break;
            case 'beep':
                for(let i = 0; i < 3; i++) {
                    setTimeout(() => this.createBeepSound(), i * 300);
                }
                break;
            case 'notification':
                this.createNotificationSound();
                break;
        }
    }
    
    showBrowserNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
                body: 'Your focus session has ended.',
                icon: '/favicon.ico'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Timer Complete!', {
                        body: 'Your focus session has ended.',
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    }
    
    updateFocusTime() {
        // Calculate focus time in hours
        const focusHours = this.totalTime / 3600; // Convert seconds to hours
        const statElement = document.getElementById('statFocusTime');
        
        if (statElement) {
            // Get current focus time
            const currentText = statElement.textContent;
            const currentHours = parseFloat(currentText) || 0;
            const newHours = currentHours + focusHours;
            
            // Update display
            statElement.textContent = `${newHours.toFixed(1)}h`;
            
            // Save to localStorage
            const today = new Date().toDateString();
            const storedData = JSON.parse(localStorage.getItem('azukaFocusTime') || '{}');
            storedData[today] = (storedData[today] || 0) + focusHours;
            localStorage.setItem('azukaFocusTime', JSON.stringify(storedData));
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateButtonStates() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        
        if (this.isRunning) {
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Running';
            this.startBtn.classList.add('timer-btn-secondary');
            this.startBtn.classList.remove('timer-btn-primary');
        } else {
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            this.startBtn.classList.add('timer-btn-primary');
            this.startBtn.classList.remove('timer-btn-secondary');
        }
    }
    
    showTimerModal() {
        this.timerModal.style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block';
    }
    
    hideTimerModal() {
        this.timerModal.style.display = 'none';
        document.getElementById('modalOverlay').style.display = 'none';
    }
    
    // Public method to start timer from other parts of the app
    quickStart(minutes = 25) {
        this.setTimer(minutes * 60);
        this.startTimer();
        this.showTimerModal();
    }
}

// Initialize timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timer = new Timer();
    
    // Request notification permission on page load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});