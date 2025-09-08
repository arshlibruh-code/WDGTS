// Simple Sound System - Single Source of Truth for ALL Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Sound Library - ALL SOUNDS IN ONE PLACE
const sounds = {
  // Map interaction sounds
  click: {
    type: 'square',
    frequency: 5555,
    duration: 0.02,
    volume: 0.125
  },
  
  zoomIn: {
    type: 'sawtooth',
    frequency: 5600,
    duration: 0.02,
    volume: 0.05
  },
  
  zoomOut: {
    type: 'sawtooth',
    frequency: 5000,
    duration: 0.02,
    volume: 0.05
  },
  
  // Map interaction sounds
  pitch: {
    type: 'sine',
    frequency: 1600,
    duration: 0.02,
    volume: 0.05
  },
  
  bearing: {
    type: 'triangle',
    frequency: 800,
    duration: 0.02,
    volume: 0.05
  },
  
  // Future sounds go here
  // hover: { type: 'sine', frequency: 800, duration: 0.05, volume: 0.1 },
  // select: { type: 'triangle', frequency: 1200, duration: 0.1, volume: 0.2 },
  // error: { type: 'square', frequency: 200, duration: 0.3, volume: 0.3 }
};

// Simple sound player - ONE FUNCTION TO RULE THEM ALL
function playSound(soundName) {
  const sound = sounds[soundName];
  if (!sound) {
    console.warn(`🔇 Sound "${soundName}" not found. Available sounds:`, Object.keys(sounds));
    return;
  }
  
  const now = audioCtx.currentTime;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  // Apply sound settings
  oscillator.type = sound.type;
  oscillator.frequency.value = sound.frequency;
  gainNode.gain.value = sound.volume;
  
  // Connect and play
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start(now);
  oscillator.stop(now + sound.duration);
  
  console.log(`🔊 Played: ${soundName}`);
}

// Make it globally available
window.playSound = playSound;
window.sounds = sounds; // For debugging and future sound design

console.log('🎵 Simple Sounds loaded! Available sounds:', Object.keys(sounds));
