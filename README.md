# WDGTS

**Widgets for Maps** - A comprehensive collection of reusable mapping widgets for modern web applications.

<img src="public/cmps-wdgt.gif" width="100%" alt="WDGTS Compass Widget">

<img src="public/compass-street.gif" width="100%" alt="WDGTS Compass Widget Street">

<img src="public/demo.gif" width="100%" alt="WDGTS Compass Widget Demo">

*Compass WDGT in action*

## Overview

WDGTS is a modular widget system designed for developers building GIS and mapping applications. Each widget is a self-contained, reusable component that can be easily integrated into any web application using MapTiler SDK, MapLibre GL, or similar mapping libraries.

The system currently features a sophisticated **Compass Widget** with fighter jet-style HUD aesthetics, and we're continuously expanding with new widgets for various mapping and geospatial use cases.

## Available Widgets

### Compass Widget
- **3D Compass Ring**: Advanced compass with custom dash patterns and 3D rotation effects
- **Real-time Coordinate Display**: Live latitude and longitude coordinates with fade-out animations
- **Zoom Controls**: Integrated zoom level display with magnify icon
- **Pitch Indicator**: Visual pitch angle display with progress bar
- **Altitude Widget**: Real-time elevation display with mountain icon and dynamic fill bar (0m to 9400m range)
- **Crosshair Targeting**: Centralized crosshair for precise location targeting
- **Fighter Jet Aesthetic**: Professional HUD styling with cyan blue color scheme

### Drawing Widget (TerraDraw Integration)
- **Multiple Drawing Modes**: Points, lines, polygons, rectangles, circles, freehand, and specialized shapes
- **Interactive Editing**: Drag, rotate, and delete capabilities for all drawn elements
- **Data Management**: Local storage integration for saving and loading drawn features
- **Professional Toolbar**: Clean, intuitive interface with Material Design icons

### Audio Widget
- **Programmatic Sound Effects**: Custom audio generation using Web Audio API
- **Interactive Feedback**: Sound effects for map clicks and zoom operations
- **Configurable Audio**: Adjustable frequency, duration, volume, and filter parameters
- **Mechanical Sound Design**: Realistic mechanical feedback for navigation actions

## Widget System Features

### Modular Architecture
- **Self-contained Components**: Each widget operates independently
- **Easy Integration**: Simple import and initialization for any web application
- **MapTiler SDK Compatible**: Works seamlessly with MapTiler and MapLibre GL
- **Responsive Design**: Optimized for various screen sizes and devices

### Developer Experience
- **Clean APIs**: Simple, intuitive widget interfaces
- **Comprehensive Documentation**: Detailed setup and usage instructions
- **Customizable Styling**: Flexible theming and appearance options
- **Performance Optimized**: Efficient rendering and smooth animations

## Roadmap

### Planned Widgets
- **Scale Widget**: Dynamic scale bar with unit conversion
- **Layer Control Widget**: Toggle and manage map layers
- **Search Widget**: Geocoding and location search functionality
- **Measurement Widget**: Distance and area calculation tools
- **Navigation Widget**: Turn-by-turn directions and routing
- **Weather Widget**: Real-time weather overlay integration
- **Traffic Widget**: Live traffic data visualization
- **Custom Marker Widget**: Advanced marker management system

### Integration Goals
- **Framework Support**: React, Vue, Angular, and vanilla JavaScript
- **Package Managers**: npm, yarn, and CDN distribution
- **TypeScript Support**: Full type definitions for all widgets
- **Plugin Architecture**: Easy extension and customization

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
- MapTiler API key (for mapping functionality)

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/arshlibruh-code/WDGTS.git
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

### Widget Integration
Each widget can be imported and used independently:

```javascript
// Import specific widgets
import { CompassWidget } from './src/widgets/compass.js';
import { DrawingWidget } from './src/widgets/drawing.js';
import { AudioWidget } from './src/widgets/audio.js';

// Initialize widgets with your map instance
const compass = new CompassWidget(map);
const drawing = new DrawingWidget(map);
const audio = new AudioWidget();
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
