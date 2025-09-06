# WDGTS

A sophisticated interactive mapping application featuring a fighter jet-style heads-up display (HUD) system with advanced navigation controls and real-time geospatial data visualization.

## Overview

WDGTS is a modern web-based mapping application that combines MapTiler SDK with custom HUD elements to create an immersive navigation experience. The application features a centralized crosshair container with real-time coordinate display, zoom controls, pitch indicators, and a 3D compass ring with advanced visual effects.

## Features

### Navigation System
- **Real-time Coordinate Display**: Live latitude and longitude coordinates with fade-out animations
- **3D Compass Ring**: Advanced compass with custom dash patterns and 3D rotation effects
- **Zoom Controls**: Integrated zoom level display with magnify icon
- **Pitch Indicator**: Visual pitch angle display with progress bar
- **Crosshair Targeting**: Centralized crosshair for precise location targeting

### Interactive Mapping
- **Multiple Map Styles**: Support for Esri Satellite, OpenStreetMap, MapTiler, and OpenFreeMap styles
- **Real-time Controls**: Live sliders for longitude, latitude, zoom, pitch, and bearing adjustments
- **Style Switching**: Keyboard shortcut (S key) for rapid map style changes
- **Error Handling**: Comprehensive error management for tile loading and API issues

### Drawing and Annotation
- **TerraDraw Integration**: Full-featured drawing and annotation system
- **Multiple Drawing Modes**: Points, lines, polygons, rectangles, circles, freehand, and specialized shapes
- **Data Management**: Local storage integration for saving and loading drawn features
- **Interactive Editing**: Drag, rotate, and delete capabilities for all drawn elements

### Audio System
- **Programmatic Sound Effects**: Custom audio generation using Web Audio API
- **Interactive Feedback**: Sound effects for map clicks and zoom operations
- **Configurable Audio**: Adjustable frequency, duration, volume, and filter parameters
- **Mechanical Sound Design**: Realistic mechanical feedback for navigation actions

### User Interface
- **Fighter Jet Aesthetic**: Professional HUD styling with cyan blue color scheme
- **Material Design Icons**: Consistent iconography throughout the interface
- **Responsive Design**: Optimized for various screen sizes and devices
- **Smooth Animations**: CSS transitions and fade effects for enhanced user experience

## Technical Architecture

### Core Technologies
- **MapTiler SDK**: Primary mapping engine with MapLibre GL backend
- **TerraDraw**: Advanced drawing and annotation library
- **Web Audio API**: Programmatic sound generation
- **Vite**: Modern build tool and development server
- **ES6 Modules**: Modern JavaScript module system

### Project Structure
```
src/
├── main.js          # Application entry point
├── map.js           # Map configuration and initialization
├── controls.js      # Main control system and HUD management
├── terradraw.js     # Drawing system integration
├── sfx.js           # Sound effects system
├── config.js        # API key configuration (gitignored)
├── style.css        # Application styling
└── controls.html    # UI component templates
```

### Key Components

#### MapControls Class
Central control system managing all interactive elements:
- Real-time map parameter updates
- HUD element synchronization
- Event handling and user interactions
- Sound effect coordination

#### TerraDrawManager Class
Drawing system integration:
- Multiple drawing mode support
- Feature selection and editing
- Data persistence and management
- Interactive toolbar integration

#### Audio System
Programmatic sound generation:
- Custom oscillator-based audio
- Configurable filter chains
- Real-time parameter adjustment
- Mechanical feedback simulation

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd WDGTS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API keys:
   - Create `src/config.js` with your API keys:
   ```javascript
   const config = {
     MAPTILER_API_KEY: "your-maptiler-key",
     PERPLEXITY_API_KEY: "your-perplexity-key"
   };
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Usage

### Basic Navigation
- **Mouse/Touch**: Pan, zoom, and rotate the map
- **Keyboard**: Press 'S' to cycle through map styles
- **Controls Panel**: Use sliders for precise parameter adjustment

### Drawing Features
- **Toolbar**: Select drawing tools from the top-left toolbar
- **Shift+A**: Quick access to polygon drawing mode
- **Delete Key**: Remove selected features when in select mode
- **Local Storage**: Save and load drawn features using toolbar buttons

### Audio Controls
- **SFX Toggle**: Enable/disable sound effects via controls panel
- **Interactive Feedback**: Sounds play automatically for map interactions

## Configuration

### Map Styles
The application supports multiple map styles:
- Esri World Imagery (default)
- OpenStreetMap
- MapTiler variants (Streets, Satellite, Hybrid)
- OpenFreeMap styles (Liberty, Bright, Positron, Fiord)

### Audio Parameters
Customizable audio settings in `sfx.js`:
- Frequency range and modulation
- Duration and envelope shaping
- Filter types and resonance
- Volume and attack/release curves

## Development

### Code Style
- ES6+ JavaScript with module imports
- CSS with custom properties and modern selectors
- Consistent naming conventions
- Comprehensive error handling

### Performance Considerations
- Efficient event handling with debouncing
- Optimized CSS animations and transitions
- Lazy loading of map tiles and resources
- Memory management for audio contexts

## Security

### API Key Protection
- Configuration file is gitignored
- Keys are not exposed in client-side code
- Environment-based configuration support

### Error Handling
- Comprehensive error catching for map operations
- Graceful degradation for missing resources
- User-friendly error messages and fallbacks

## Browser Support

- Modern browsers with ES6 module support
- Web Audio API compatibility required for sound effects
- WebGL support for map rendering
- Local Storage API for data persistence

## License

This project is private and proprietary. All rights reserved.

## Contributing

This is a private repository. For access or collaboration, contact the repository owner.

## Support

For technical support or feature requests, please contact the development team.
