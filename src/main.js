import './style.css'
import './config.js'
import './map.js'
import './sounds.js'
import MapControls from './controls.js'

// Initialize controls after map is loaded
window.addEventListener('load', () => {
  // Wait for map to be ready
  setTimeout(() => {
    if (window.map) {
      new MapControls(window.map);
    }
  }, 1000);
});

