// Simple Real-time Map Controls
import TerraDrawManager from './terradraw.js';
import { config } from './config.js';

class MapControls {
  constructor(map) {
    this.map = map;
    this.fadeTimer = null; // Add timer for coordinate fade-out
    this.zoomFadeTimer = null; // Add timer for zoom fade-out
    this.pitchFadeTimer = null; // Add timer for pitch fade-out
    this.compassFadeTimer = null; // Add timer for compass ring fade-out
    this.altitudeFadeTimer = null; // Timer for altitude fade-out
    this.elevationDebounceTimer = null; // Timer for elevation API debouncing
    this.scaleDebounceTimer = null; // Timer for scale updates
    this.scaleFadeTimer = null; // Timer for scale fade-out
    this.terraDrawManager = null;
    this.loadControls();
  }

  async loadControls() {
    try {
      const response = await fetch('/src/controls.html');
      const html = await response.text();
      document.body.insertAdjacentHTML('beforeend', html);
      
      // Wait for DOM to be ready, then setup events
      setTimeout(() => {
        this.setupEvents();
        this.updateDisplay();
        this.initTerraDraw();
        this.setupTerraDrawToolbar();
        this.initSFXPanel();
      }, 50);
    } catch (error) {
      console.error('Failed to load controls:', error);
    }
  }

  setupEvents() {
    // Real-time sliders
    document.getElementById('lng').addEventListener('input', (e) => {
      const lng = parseFloat(e.target.value);
      document.getElementById('lng-val').textContent = lng.toFixed(6);
      this.map.setCenter([lng, this.map.getCenter().lat]);
    });

    document.getElementById('lat').addEventListener('input', (e) => {
      const lat = parseFloat(e.target.value);
      document.getElementById('lat-val').textContent = lat.toFixed(6);
      this.map.setCenter([this.map.getCenter().lng, lat]);
    });

    document.getElementById('zoom').addEventListener('input', (e) => {
      const zoom = parseFloat(e.target.value);
      document.getElementById('zoom-val').textContent = zoom.toFixed(3);
      this.map.setZoom(zoom);
    });

    document.getElementById('pitch').addEventListener('input', (e) => {
      const pitch = parseFloat(e.target.value);
      document.getElementById('pitch-val').textContent = pitch.toFixed(3);
      this.map.setPitch(pitch);
    });

    document.getElementById('bearing').addEventListener('input', (e) => {
      const bearing = parseFloat(e.target.value);
      document.getElementById('bearing-val').textContent = bearing.toFixed(3);
      this.map.setBearing(bearing);
    });

    document.getElementById('style').addEventListener('change', (e) => {
      const style = this.getStyle(e.target.value);
      this.map.setStyle(style);
    });

    document.getElementById('reset').addEventListener('click', () => {
      this.reset();
    });

    // Update display when map moves - show coordinates on movement
    this.map.on('move', () => {
      this.showCoordinates();
      this.showScaleLevel();
      this.updateDisplay();
      this.showAltitudeLevel();
      this.showPitchDetailsLevel();
    });
    this.map.on('zoom', () => {
      // Track zoom direction for SFX with mechanical snap points
      const currentZoom = this.map.getZoom();
      
      if (this.previousZoom !== null && this.sfxEnabled) {
        // Snap to 1st decimal precision (mechanical compass ring feel)
        const currentSnap = Math.floor(currentZoom * 10) / 10;  // 1.234 → 1.2
        const previousSnap = Math.floor(this.previousZoom * 10) / 10;  // 1.199 → 1.1
        
        // Only play sound when crossing 0.1 boundaries
        if (currentSnap !== previousSnap) {
          if (currentSnap > previousSnap) {
            // ZOOM IN - crossed to higher snap point
            this.playZoomSound('in');
          } else if (currentSnap < previousSnap) {
            // ZOOM OUT - crossed to lower snap point
            this.playZoomSound('out');
          }
        }
      }
      
      this.previousZoom = currentZoom;
      
      // existing behavior
      this.showCoordinates();
      this.showZoomLevel();
      this.showScaleLevel();
      this.updateDisplay();
    });
    this.map.on('pitch', () => {
      this.showCoordinates();
      this.showScaleLevel();
      this.showAltitudeLevel();
      this.showPitchDetailsLevel();
      this.showCompassRing(); // Update compass ring 3D tilt on pitch changes
      this.updateDisplay();
    });
    this.map.on('rotate', () => {
      this.showCoordinates();
      this.showAltitudeLevel();
      this.showPitchDetailsLevel();
      this.showCompassRing();
      this.updateDisplay();
    });

    // Right-click drag detection for pitch and bearing SFX
    this.setupRightClickDragSFX();

    // Terra Draw keyboard shortcut (Shift+A)
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.toggleTerraDraw();
      }
    });
  }

  // Show coordinates with fade-out timer
  showCoordinates() {
    const coordsPill = document.getElementById('coords-pill');
    
    // Show the coordinates immediately
    coordsPill.style.opacity = '1';
    
    // Clear any existing timer
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
    }
    
    // Set new timer to fade to subtle opacity after 1 second
    this.fadeTimer = setTimeout(() => {
      coordsPill.style.opacity = '0.20';
    }, 1000);
  }

  // Show zoom level with fade-out timer
  showZoomLevel() {
    const zoomPill = document.getElementById('zoom-pill');
    const zoomValue = document.getElementById('pill-zoom');
    
    // Update zoom value to 2 decimal places
    const currentZoom = this.map.getZoom();
    zoomValue.textContent = currentZoom.toFixed(2);
    
    // Show the zoom pill immediately
    zoomPill.style.opacity = '1';
    
    // Clear any existing timer
    if (this.zoomFadeTimer) {
      clearTimeout(this.zoomFadeTimer);
    }
    
    // Set new timer to fade to subtle opacity after 1 second
    this.zoomFadeTimer = setTimeout(() => {
      zoomPill.style.opacity = '0.20';
    }, 1000);
  }

  // Show scale level with fade-out timer using MapTiler's scale calculation
  showScaleLevel() {
    const scalePill = document.getElementById('scale-pill');
    const imperialLabel = document.getElementById('imperial-label');
    const metricLabel = document.getElementById('metric-label');
    const imperialLine = document.getElementById('imperial-line');
    const metricLine = document.getElementById('metric-line');
    
    // Get the current scale data using MapTiler's calculation
    const scaleData = this.getMapTilerScaleData();
    
    if (!scaleData) {
      console.warn('Could not get scale data');
      return;
    }
    
    // Calculate distances for 60px line (same as CSS width)
    const lineLengthPixels = 60;
    const lineLengthMeters = lineLengthPixels * scaleData.metersPerPixel;
    
    // Format imperial (feet)
    const feet = Math.round(lineLengthMeters * 3.28084);
    let imperialText;
    if (feet >= 5280) {
      imperialText = Math.round(feet / 5280) + ' mi';
    } else {
      imperialText = feet + ' ft';
    }
    
    // Format metric
    let metricText;
    if (lineLengthMeters >= 1000) {
      metricText = (lineLengthMeters / 1000).toFixed(1) + ' km';
    } else {
      metricText = Math.round(lineLengthMeters) + ' m';
    }
    
    // Update labels
    imperialLabel.textContent = imperialText;
    metricLabel.textContent = metricText;
    
    // Show the scale pill immediately
    scalePill.style.opacity = '1';
    
    // Clear any existing timer
    if (this.scaleFadeTimer) {
      clearTimeout(this.scaleFadeTimer);
    }
    
    // Set new timer to fade to subtle opacity after 1 second
    this.scaleFadeTimer = setTimeout(() => {
      scalePill.style.opacity = '0.20';
    }, 1000);
  }

  // Show altitude level with debounced API calls
  showAltitudeLevel() {
    // Clear any existing debounce timer
    if (this.elevationDebounceTimer) {
      clearTimeout(this.elevationDebounceTimer);
    }
    
    // Set new debounce timer - only call API after 100ms of no movement
    this.elevationDebounceTimer = setTimeout(() => {
      this.updateAltitudeDisplay();
    }, 100);
  }

  // Show pitch details level - instant update like original pitch
  showPitchDetailsLevel() {
    this.updatePitchDetailsDisplay();
  }

  // Actually update the altitude display (called after debounce)
  updateAltitudeDisplay() {
    const altitudePill = document.getElementById('altitude-pill');
    const altitudeValue = document.getElementById('altitude-value');
    const altitudeLineFill = document.getElementById('altitude-line-fill');
    const altitudeContent = document.querySelector('.altitude-content');
    
    // Get current altitude (0 to 9400m)
    this.getCurrentAltitude().then(currentAltitude => {
      // Update altitude value
      altitudeValue.textContent = currentAltitude.toFixed(0) + 'm';
      
      // Calculate fill percentage (0 to 100%)
      const fillPercent = (currentAltitude / 9400) * 100;
      altitudeLineFill.style.height = fillPercent + '%';
      
      // Move the content (icon + text) to follow the fill position
      // Calculate position from bottom (0% = bottom, 100% = top)
      const contentPosition = (fillPercent / 100) * 100; // Convert to pixels from bottom
      altitudeContent.style.bottom = contentPosition + 'px';
      
      // Show the altitude pill immediately
      altitudePill.style.opacity = '1';
      
      // Clear any existing timer
      if (this.altitudeFadeTimer) {
        clearTimeout(this.altitudeFadeTimer);
      }
      
      // Set new timer to fade to subtle opacity after 1 second
      this.altitudeFadeTimer = setTimeout(() => {
        altitudePill.style.opacity = '0.20';
      }, 1000);
    });
  }

  // Actually update the pitch details display - instant like original pitch
  updatePitchDetailsDisplay() {
    const pitchDetailsPill = document.getElementById('pitch-details-pill');
    const pitchDetailsValue = document.getElementById('pitch-details-value');
    const pitchDetailsLineFill = document.getElementById('pitch-details-line-fill');
    const pitchDetailsContent = document.querySelector('.pitch-details-content'); // Get the content div
    
    // Get current pitch
    const currentPitch = this.map.getPitch();
    
    // Format pitch display (e.g., "45.0°")
    const pitchText = `${currentPitch.toFixed(1)}°`;
    
    // Update pitch details value
    pitchDetailsValue.textContent = pitchText;
    
    // Calculate fill percentage (0° to 75° pitch range)
    const minPitch = 0;
    const maxPitch = 75;
    const fillPercent = Math.max(0, Math.min(100, (currentPitch / maxPitch) * 100));
    
    pitchDetailsLineFill.style.height = fillPercent + '%';
    
    // Move the content (icon + text) to follow the fill position
    const contentPosition = (fillPercent / 100) * 100; // Convert to pixels from bottom
    pitchDetailsContent.style.bottom = contentPosition + 'px';
    
    // Show the pitch details pill immediately
    pitchDetailsPill.style.opacity = '1';
    
    // Clear any existing timer
    if (this.scaleFadeTimer) {
      clearTimeout(this.scaleFadeTimer);
    }
    
    // Set new timer to fade to subtle opacity after 1 second
    this.scaleFadeTimer = setTimeout(() => {
      pitchDetailsPill.style.opacity = '0.20';
    }, 1000);
  }

  // Get current altitude using MapTiler SDK
  async getCurrentAltitude() {
    const center = this.map.getCenter();
    try {
      // Use MapTiler SDK elevation method
      const elevatedPosition = await maptilersdk.elevation.at([center.lng, center.lat]);
      // elevatedPosition is [lng, lat, elevation]
      const elevation = Math.max(0, Math.min(9400, elevatedPosition[2] || 0));
      return elevation;
    } catch (error) {
      console.warn('Failed to fetch elevation:', error);
      return 0; // Default to sea level
    }
  }

  // Get MapTiler's built-in scale data
  getMapTilerScaleData() {
    try {
      const zoom = this.map.getZoom();
      const center = this.map.getCenter();
      const lat = center.lat;
      
      // Use MapTiler's built-in calculation (same as MapLibre GL JS)
      const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
      
      return {
        metersPerPixel: metersPerPixel,
        zoom: zoom,
        latitude: lat
      };
    } catch (error) {
      console.error('Error getting scale data:', error);
      return null;
    }
  }

  // Show compass ring with 3D rotation and fade-out timer
  showCompassRing() {
    const compassRing = document.getElementById('compass-ring');
    
    if (!compassRing) return;
    
    // Get current bearing and pitch
    const bearing = this.map.getBearing();
    const pitch = this.map.getPitch();
    
    // Calculate 3D rotation
    // Invert bearing so compass ring rotates opposite to map rotation
    const rotationZ = -bearing; // Negative bearing to counteract map rotation
    const tiltX = pitch; // Direct pitch mapping - simple forward/backward tilt
    const tiltY = 0;     // No Y-axis rotation - keep it simple like a real compass
    
    // Apply 3D transform - rotate around own center, then tilt
    compassRing.style.transform = `
      translate(-50%, -50%) 
      rotateX(${tiltX}deg) 
      rotateZ(${rotationZ}deg)
    `;
    
    // Show the compass ring immediately
    compassRing.style.opacity = '1';
    // Show full compass (stroke and all markers)
    compassRing.querySelector('.ring-stroke').style.opacity = '1';
    compassRing.querySelectorAll('.main-marker').forEach(marker => {
      marker.style.opacity = '1';
    });
    // Show the ⨻ marker above N
    compassRing.querySelector('.north-x-marker').style.opacity = '1';
    
    // Clear any existing timer
    if (this.compassFadeTimer) {
      clearTimeout(this.compassFadeTimer);
    }
    
    // Set new timer to fade to subtle opacity after 1 second
    this.compassFadeTimer = setTimeout(() => {
      compassRing.style.opacity = '0.20';
      // Hide stroke and show only N marker and ⨻
      compassRing.querySelector('.ring-stroke').style.opacity = '0';
      compassRing.querySelectorAll('.main-marker:not(.north)').forEach(marker => {
        marker.style.opacity = '0';
      });
      compassRing.querySelector('.main-marker.north').style.opacity = '1';
      compassRing.querySelector('.north-x-marker').style.opacity = '1';
    }, 1000);
  }


  getStyle(name) {
    const styles = {
      // New free basemaps
      'ESRI_SATELLITE': {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: '© Esri'
          }
        },
        layers: [{
          id: 'esri-satellite',
          type: 'raster',
          source: 'esri-satellite'
        }]
      },
      'OSM': {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm'
        }]
      },
      // Existing MapTiler styles
      'STREETS.DARK': maptilersdk.MapStyle.STREETS.DARK,
      'STREETS': maptilersdk.MapStyle.STREETS,
      'SATELLITE': maptilersdk.MapStyle.SATELLITE,
      'HYBRID': maptilersdk.MapStyle.HYBRID,
      // OpenFreeMap styles
      'OFM_LIBERTY': 'https://tiles.openfreemap.org/styles/liberty',
      'OFM_BRIGHT': 'https://tiles.openfreemap.org/styles/bright',
      'OFM_POSITRON': 'https://tiles.openfreemap.org/styles/positron',
      'OFM_FIORD': 'https://tiles.openfreemap.org/styles/fiord'
    };
    return styles[name] || styles['ESRI_SATELLITE']; // Default to Esri Satellite
  }

  updateDisplay() {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const pitch = this.map.getPitch();
    const bearing = this.map.getBearing();

    // Update sliders
    document.getElementById('lng').value = center.lng.toFixed(6);
    document.getElementById('lat').value = center.lat.toFixed(6);
    document.getElementById('zoom').value = zoom.toFixed(3);
    document.getElementById('pitch').value = pitch.toFixed(3);
    document.getElementById('bearing').value = bearing.toFixed(3);

    // Update slider values
    document.getElementById('lng-val').textContent = center.lng.toFixed(6);
    document.getElementById('lat-val').textContent = center.lat.toFixed(6);
    document.getElementById('zoom-val').textContent = zoom.toFixed(3);
    document.getElementById('pitch-val').textContent = pitch.toFixed(3);
    document.getElementById('bearing-val').textContent = bearing.toFixed(3);

    // Center coordinates are now only shown in the crosshair pill

    // Update coordinates pill above crosshair
    document.getElementById('pill-lat').textContent = center.lat.toFixed(6);
    document.getElementById('pill-lng').textContent = center.lng.toFixed(6);
  }

  reset() {
    this.map.setCenter([0, 20]);
    this.map.setZoom(3);
    this.map.setPitch(0);
    this.map.setBearing(0);
    this.map.setStyle(this.getStyle('ESRI_SATELLITE')); // Reset to Esri Satellite
    this.updateDisplay();
  }

  // Terra Draw Integration
  initTerraDraw() {
    // Wait for map style to load before initializing TerraDraw
    if (this.map.isStyleLoaded()) {
      this.createTerraDrawManager();
    } else {
      this.map.on('style.load', () => {
        this.createTerraDrawManager();
      });
    }
  }

  createTerraDrawManager() {
    try {
      this.terraDrawManager = new TerraDrawManager(this.map, maptilersdk);
      console.log('Terra Draw initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Terra Draw:', error);
    }
  }

  setupTerraDrawToolbar() {
    // Connect toolbar buttons to TerraDraw
    const toolbarButtons = document.querySelectorAll('.toolbar-btn[data-mode]');
    toolbarButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = button.getAttribute('data-mode');
        console.log('🔧 Toolbar button clicked:', mode);
        this.setTerraDrawMode(mode);
        this.updateToolbarSelection(button);
      });
    });

    // Connect data management buttons
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const clearBtn = document.getElementById('clear-btn');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveToLocalStorage());
    }
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.loadFromLocalStorage());
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAllFeatures());
    }
  }

  setTerraDrawMode(mode) {
    if (this.terraDrawManager) {
      console.log('🔧 Setting TerraDraw mode to:', mode);
      
      // Start TerraDraw if it's not already active
      if (!this.terraDrawManager.isActive) {
        this.terraDrawManager.start();
      }
      
      // Set the mode
      this.terraDrawManager.setMode(mode);
      
      this.updateTerraDrawStatus();
    }
  }

  updateToolbarSelection(activeButton) {
    // Remove active class from all buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  saveToLocalStorage() {
    if (this.terraDrawManager) {
      const features = this.terraDrawManager.terraDraw.getSnapshot();
      const filteredFeatures = features.filter(f => !f.properties.midPoint && !f.properties.selectionPoint);
      localStorage.setItem('terra-draw-data', JSON.stringify(filteredFeatures));
      this.showNotification('Data saved to local storage');
    }
  }

  loadFromLocalStorage() {
    if (this.terraDrawManager) {
      const savedData = localStorage.getItem('terra-draw-data');
      if (savedData) {
        const features = JSON.parse(savedData);
        this.terraDrawManager.terraDraw.addFeatures(features);
        this.showNotification('Data loaded from local storage');
      } else {
        this.showNotification('No saved data found');
      }
    }
  }

  clearAllFeatures() {
    if (this.terraDrawManager) {
      this.terraDrawManager.terraDraw.clear();
      this.showNotification('All features cleared');
    }
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'terradraw-notification';
    notification.innerHTML = `
      <span class="material-icons">info</span>
      <span class="notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  toggleTerraDraw() {
    if (this.terraDrawManager) {
      // Since TerraDraw is always active now, just switch to polygon mode
      this.terraDrawManager.setMode('polygon');
      this.updateTerraDrawStatus();
    }
  }

  updateTerraDrawStatus() {
    if (this.terraDrawManager) {
      const statusElement = document.getElementById('terradraw-status');
      const statusText = statusElement.querySelector('.status-text');
      
      if (this.terraDrawManager.isActive) {
        statusText.textContent = `${this.terraDrawManager.currentMode} mode`;
        statusElement.querySelector('.material-icons').textContent = 'edit';
      } else {
        statusText.textContent = 'Ready';
        statusElement.querySelector('.material-icons').textContent = 'pan_tool';
      }
    }
  }

  // SFX Panel functionality
  initSFXPanel() {
    const sfxToggle = document.getElementById('sfx-toggle');
    const sfxEvents = document.getElementById('sfx-events');
    
    // SFX state
    this.sfxEnabled = true;
    this.sfxEvents = {
      'Map Click': true,
      'Zoom In': true,
      'Zoom Out': true,
      'Pitch': true,
      'Bearing': true
    };
    
    // Track zoom for direction detection
    this.previousZoom = null;
    
    // Toggle SFX on/off
    sfxToggle.addEventListener('click', () => {
      this.sfxEnabled = !this.sfxEnabled;
      this.updateSFXDisplay();
      this.updateMapClickSound();
    });
    
    // Initial display
    this.updateSFXDisplay();
    
    // Wait for map and SFX to be ready, then setup click sound
    setTimeout(() => {
      this.updateMapClickSound();
    }, 1000);
  }
  
  updateSFXDisplay() {
    const sfxToggle = document.getElementById('sfx-toggle');
    const sfxEvents = document.getElementById('sfx-events');
    
    // Update toggle button
    if (this.sfxEnabled) {
      sfxToggle.textContent = 'ON';
      sfxToggle.classList.remove('off');
    } else {
      sfxToggle.textContent = 'OFF';
      sfxToggle.classList.add('off');
    }
    
    // Update events display
    sfxEvents.innerHTML = '';
    Object.entries(this.sfxEvents).forEach(([event, enabled]) => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'sfx-event';
      eventDiv.innerHTML = `${event}: <span class="sfx-status ${enabled && this.sfxEnabled ? '' : 'muted'}">${enabled && this.sfxEnabled ? '🔊 Active' : '🔇 Muted'}</span>`;
      sfxEvents.appendChild(eventDiv);
    });
  }
  
  playZoomSound(direction) {
    if (!this.sfxEnabled || !window.playSound) return;
    
    // Simple sound call - no more complex preset juggling!
    const soundName = direction === 'in' ? 'zoomIn' : 'zoomOut';
    window.playSound(soundName);
  }
  
  updateMapClickSound() {
    // Remove ALL existing click listeners
    this.map.off('click');
    
    // Add click listener only if SFX is enabled and playSound is available
    if (this.sfxEnabled && window.playSound) {
      this.map.on('click', (e) => {
        // Only play if SFX is still enabled (double check)
        if (this.sfxEnabled && window.playSound) {
          window.playSound('click');
        }
      });
      console.log('🎵 Map click sound ENABLED');
    } else if (!this.sfxEnabled) {
      console.log('🔇 Map click sound DISABLED');
    } else if (!window.playSound) {
      console.log('⚠️ Sounds not ready yet, retrying...');
      // Retry after a short delay
      setTimeout(() => this.updateMapClickSound(), 500);
    }
  }

  setupRightClickDragSFX() {
    let isRightClickDragging = false;
    let lastPitch = null;
    let lastBearing = null;
    let pitchThreshold = 0.5; // Minimum pitch change to trigger SFX
    let bearingThreshold = 1.0; // Minimum bearing change to trigger SFX

    // Track right mouse button down
    this.map.getCanvas().addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Right mouse button
        isRightClickDragging = true;
        lastPitch = this.map.getPitch();
        lastBearing = this.map.getBearing();
      }
    });

    // Track right mouse button up
    this.map.getCanvas().addEventListener('mouseup', (e) => {
      if (e.button === 2) { // Right mouse button
        isRightClickDragging = false;
      }
    });

    // Track mouse leave to stop dragging
    this.map.getCanvas().addEventListener('mouseleave', () => {
      isRightClickDragging = false;
    });

    // Listen for pitch changes during right-click drag
    this.map.on('pitch', () => {
      if (isRightClickDragging && this.sfxEnabled && lastPitch !== null) {
        const currentPitch = this.map.getPitch();
        const pitchChange = Math.abs(currentPitch - lastPitch);
        
        if (pitchChange >= pitchThreshold) {
          window.playSound('pitch'); // Dedicated pitch sound
          console.log('🔊 Pitch sound played!');
          lastPitch = currentPitch;
        }
      }
    });

    // Listen for bearing changes during right-click drag
    this.map.on('rotate', () => {
      if (isRightClickDragging && this.sfxEnabled && lastBearing !== null) {
        const currentBearing = this.map.getBearing();
        const bearingChange = Math.abs(currentBearing - lastBearing);
        
        if (bearingChange >= bearingThreshold) {
          window.playSound('bearing'); // Dedicated bearing sound
          console.log('🔊 Bearing sound played!');
          lastBearing = currentBearing;
        }
      }
    });
  }
}

export default MapControls;
