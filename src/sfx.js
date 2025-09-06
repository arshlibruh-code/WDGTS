// Simple Sound Effects - Programmatic Audio Generation
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Audio parameters (globally controllable)
window.audioParams = {
    frequency: 800,
    duration: 0.1,
    volume: 0.4,
    attack: 0.01,
    release: 0.05,
    baseWave: 'sine',
    beatCount: 1,
    filterType: 'highpass',
    filterFreq: 1000,
    filterQ: 10
};


// Create single whoosh sound with custom duration
function createWhooshWithDuration(startTime, duration) {
    // Create audio nodes
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    // OSCILLATOR SETTINGS
    oscillator.type = window.audioParams.baseWave;
    oscillator.frequency.setValueAtTime(window.audioParams.frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        window.audioParams.frequency * 0.25, 
        startTime + duration
    );
    
    // FILTER SETTINGS
    filter.type = window.audioParams.filterType;
    filter.frequency.value = window.audioParams.filterFreq;
    filter.Q.value = window.audioParams.filterQ;
    
    // VOLUME ENVELOPE
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(window.audioParams.volume, startTime + window.audioParams.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    // CONNECT AUDIO CHAIN
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // PLAY SOUND
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

// Play multiple whooshes based on beat pattern
function playWhoosh() {
    const now = audioCtx.currentTime;
    const beatCount = window.audioParams.beatCount || 1;
    const totalDuration = window.audioParams.duration; // Use the duration setting as total time
    
    // Calculate gap between beats to fit all beats within the total duration
    const gap = beatCount > 1 ? (totalDuration * 0.1) / (beatCount - 1) : 0; // 10% of duration for gaps
    const beatDuration = (totalDuration - (gap * (beatCount - 1))) / beatCount;
    
    // Play sounds based on selected beat pattern
    for (let i = 0; i < beatCount; i++) {
        const startTime = now + (i * (beatDuration + gap));
        createWhooshWithDuration(startTime, beatDuration);
    }
}

// Make it globally available
window.playWhoosh = playWhoosh;

console.log('🎵 SFX loaded - SIMPLE WAVE TABS ready!');
