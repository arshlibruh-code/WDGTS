import { 
  TerraDraw, 
  TerraDrawPointMode,
  TerraDrawLineStringMode,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawCircleMode,
  TerraDrawFreehandMode,
  TerraDrawFreehandLineStringMode,
  TerraDrawAngledRectangleMode,
  TerraDrawSectorMode,
  TerraDrawSensorMode,
  TerraDrawSelectMode
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';

class TerraDrawManager {
  constructor(map, lib) {
    this.map = map;
    this.lib = lib;
    this.terraDraw = null;
    this.isActive = false;
    this.currentMode = 'polygon';
    this.init();
  }

  init() {
    if (this.map.isStyleLoaded()) {
      this.createTerraDraw();
    } else {
      this.map.on('load', () => this.createTerraDraw());
    }
  }

  createTerraDraw() {
    const maplibreLib = this.map._maplibregl || window.maplibregl || this.lib;
    const adapter = new TerraDrawMapLibreGLAdapter({ 
      map: this.map, 
      lib: maplibreLib,
      coordinatePrecision: 6
    });

    this.terraDraw = new TerraDraw({
      adapter,
      modes: [
        new TerraDrawPointMode(),
        new TerraDrawLineStringMode(),
        new TerraDrawPolygonMode(),
        new TerraDrawRectangleMode(),
        new TerraDrawCircleMode(),
        new TerraDrawFreehandMode(),
        new TerraDrawFreehandLineStringMode(),
        new TerraDrawAngledRectangleMode(),
        new TerraDrawSectorMode(),
        new TerraDrawSensorMode(),
        new TerraDrawSelectMode({
          flags: {
            polygon: { 
              feature: { draggable: true, rotateable: true }, 
              coordinates: { draggable: true, deletable: true, midpoints: true } 
            },
            linestring: { 
              feature: { draggable: true, rotateable: true }, 
              coordinates: { draggable: true, deletable: true, midpoints: true } 
            },
            rectangle: { 
              feature: { draggable: true, rotateable: true }, 
              coordinates: { draggable: true, deletable: true, midpoints: true } 
            },
            circle: { 
              feature: { draggable: true, rotateable: true }, 
              coordinates: { draggable: true, deletable: true, midpoints: true } 
            },
            point: { feature: { draggable: true } }
          },
          styles: {
            selectionPointColor: '#ff0000',
            selectionPointWidth: 8,
            selectionPointOutlineColor: '#ffffff',
            selectionPointOutlineWidth: 2,
            midPointColor: '#00ff00',
            midPointWidth: 6,
            midPointOutlineColor: '#ffffff',
            midPointOutlineWidth: 2,
            // Add feature selection styling
            selectedFeatureColor: '#ffff00', // Yellow for selected features
            selectedFeatureOutlineColor: '#ff8800', // Orange outline
            selectedFeatureOutlineWidth: 3
          }
        })
      ]
    });

    this.setupEventListeners();
    this.terraDraw.start();
    this.isActive = true;
    this.setMode(this.currentMode);
  }

  setupEventListeners() {
    this.terraDraw.on('change', (ids, type) => {
      // Only log important changes, not temporary ones
      if (type === 'create' && ids.length === 1) {
        console.log('✅ Feature created');
      }
    });

    this.terraDraw.on('select', (id) => {
      console.log('🔍 Feature selected:', id);
      
      setTimeout(() => {
        const snapshot = this.terraDraw.getSnapshot();
        const vertexPoints = snapshot.filter(f => f.properties.selectionPoint || f.properties.midPoint);
        console.log('🔴 Vertex points found:', vertexPoints.length);
        
        // Only show layers if there are vertex points
        if (vertexPoints.length > 0) {
          const layers = this.map.getStyle().layers || [];
          const terraDrawLayers = layers.filter(l => 
            ['terra-draw', 'select', 'coordinate', 'midpoint'].some(k => l.id.includes(k))
          );
          console.log('🗺️ TerraDraw layers:', terraDrawLayers.map(l => l.id));
        }
      }, 100);
    });

    this.terraDraw.on('deselect', (id) => {
      console.log('Feature deselected:', id);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && this.isActive && this.currentMode === 'select') {
        e.preventDefault();
        this.deleteSelectedFeatures();
      }
    });
  }

  setMode(mode) {
    if (!this.isActive) {
      console.warn('TerraDraw not active. Cannot set mode.');
      return;
    }
    this.currentMode = mode;
    try {
      this.terraDraw.setMode(mode);
      // Only log mode changes for important modes
      if (mode === 'select') {
        console.log('✅ Mode set to:', mode);
      }
    } catch (err) {
      console.error('❌ Error setting mode:', err);
    }
  }

  deleteSelectedFeatures() {
    if (this.isActive && this.currentMode === 'select') {
      const selectedFeatures = this.terraDraw.getSnapshot().filter(f => f.properties.selected);
      if (selectedFeatures.length) {
        this.terraDraw.removeFeatures(selectedFeatures.map(f => f.id));
        console.log('Deleted features:', selectedFeatures.map(f => f.id));
      }
    }
  }

}

export default TerraDrawManager;
