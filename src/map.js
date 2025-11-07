
// Configure your MapTiler API key here
maptilersdk.config.apiKey = config.MAPTILER_API_KEY;

// Disable MapTiler telemetry to prevent API calls
maptilersdk.config.telemetry = false;

// Global error handler to catch MapLibre worker errors
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Expected value to be of type number, but found null instead')) {
    // Silently ignore MapLibre tile parsing errors
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections from MapLibre workers
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      event.reason.message.includes('Expected value to be of type number, but found null instead')) {
    // Silently ignore MapLibre tile parsing errors
    event.preventDefault();
    return false;
  }
});

// Working map styles with satellite options
const mapStyles = [
  // Esri World Imagery (free satellite)
  {
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
  
  // OpenStreetMap (works always, no API limits)
  {
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
  }
];

let currentStyleIndex = 0;

// Initialize the map with first style
const map = new maptilersdk.Map({
  container: 'map',              // HTML container id
  style: mapStyles[currentStyleIndex],  // Start with first style
  center: [21.785771, 36.846991], // Starting coordinates [lng, lat]
  zoom: 2.10,                      // Starting zoom level
  pitch: 0,
  maxPitch: 75,
  projection: "globe", // Start with 2D for fastest loading
  projectionControl: true, // Disable projection control initially
  terrainControl: true,
  terrain: true,
  terrainExaggeration: 1.5,
  attributionControl: false, // Disable attribution control
});

// Hide MapLibre controls immediately after map creation
setTimeout(() => {
  const maptilerControls = document.querySelectorAll('.maptiler-control, .maplibregl-ctrl-group, .maplibregl-ctrl, [class*="maplibregl-ctrl"], [class*="maptiler-control"]');
  maptilerControls.forEach(ctrl => {
    ctrl.style.display = 'none';
  });
  
  // Always hide attribution
  const attributionControls = document.querySelectorAll('.maplibregl-ctrl-attrib, .maptiler-ctrl-attrib, [class*="attrib"], [class*="Attribution"]');
  attributionControls.forEach(ctrl => {
    ctrl.style.display = 'none';
  });
}, 0);

// Simple error handling - ignore common errors
map.on('error', (e) => {
  // Filter out common MapLibre tile parsing errors
  if (e.error && e.error.message && 
      (e.error.message.includes('Expected value to be of type number') ||
       e.error.message.includes('but found null instead'))) {
    // Silently ignore these common tile parsing errors
    return;
  }
  
  // Silently ignore API rate limits and CORS errors
  if (e.error && e.error.message && 
      (e.error.message.includes('429') || 
       e.error.message.includes('Failed to fetch') ||
       e.error.message.includes('CORS'))) {
    return;
  }
  
  // Ignore terrain source duplication errors
  if (e.error && e.error.message && 
      e.error.message.includes('Source "maptiler-terrain" already exists')) {
    return;
  }
  
  // Ignore render loop errors
  if (e.error && e.error.message && 
      e.error.message.includes('Attempting to run(), but is already running')) {
    return;
  }
  
  // Only log unexpected errors
  console.warn('Map error:', e);
});

// Handle missing images
map.on('styleimagemissing', (e) => {
  // Silently ignore missing images
  return;
});

// Handle tile loading errors
map.on('sourcedata', (e) => {
  if (e.isSourceLoaded && e.source && e.source.type === 'raster') {
    // Handle raster tile errors silently
    return;
  }
});

map.on('style.load', () => {
  console.log('✅ Map style loaded successfully');
});

// Map is ready - sounds are now handled by sounds.js
map.on('load', () => {
    console.log('🗺️ Map loaded - sounds available via window.playSound()');
    
    // Ensure attribution is always hidden
    const attributionControls = document.querySelectorAll('.maplibregl-ctrl-attrib, .maptiler-ctrl-attrib, [class*="attrib"], [class*="Attribution"]');
    attributionControls.forEach(ctrl => {
      ctrl.style.display = 'none';
    });
});

// Make map globally accessible for controls
window.map = map;

// Simple style switcher (press 'S' key)
document.addEventListener('keydown', (e) => {
  if (e.key === 's' || e.key === 'S') {
    e.preventDefault();
    currentStyleIndex = (currentStyleIndex + 1) % mapStyles.length;
    map.setStyle(mapStyles[currentStyleIndex]);
    console.log(`🔄 Switched to style ${currentStyleIndex + 1}/${mapStyles.length}`);
  }
});
