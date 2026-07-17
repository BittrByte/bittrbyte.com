# SkyWall OS - 3D Manhattan Demo

A professional 3D visualization of Manhattan showing SkyWall geofencing zones with grayscale buildings and semi-transparent 3D domes.

## Overview

This demo showcases SkyWall's restriction and enforcement zones in a stunning 3D environment:
- **Grayscale Manhattan** - Clean black/white/gray 3D buildings
- **Red Domes** - Restriction zones where specific apps are blocked
- **White/Gray Domes** - Enforcement zones with time-based restrictions
- **Interactive Controls** - Pan, zoom, tilt, and rotate the view
- **Professional UI** - Ready for video demonstrations

## Features

### 3D Visualization
- Realistic building heights from OpenStreetMap data
- Smooth camera controls (drag, scroll, rotate, tilt)
- Professional grayscale color scheme
- High performance 60fps rendering

### Restriction Zones (Red Domes)
- **World Trade Center** - Instagram, Snapchat, TikTok blocked
- **Times Square** - Instagram, Snapchat blocked

### Enforcement Zones (White Domes)
- **Upper East Side** - Time restriction 22:00 - 08:00
- **Chelsea** - Time restriction 23:00 - 07:00

### Controls

**Camera Movement:**
- **Drag** - Pan the map
- **Scroll** - Zoom in/out
- **Right-click + Drag** - Rotate and tilt view
- **Ctrl + Drag** - Rotate around center

**View Presets:**
- **Overview** - Default angled view of Manhattan
- **Street Level** - Close-up tilted view
- **Aerial** - Top-down bird's eye view
- **Reset View** - Return to starting position

**Zone Toggles:**
- **Restriction Zones** - Show/hide red domes
- **Enforcement Zones** - Show/hide white domes

### Interactive Features
- Click on any dome to see details
- Hover over domes to highlight them
- Smooth animated camera transitions

## Quick Start

### Option 1: Using the Launch Script (Recommended)

```bash
./start.sh
```

The browser will automatically open at `http://localhost:8083`

### Option 2: Manual Start

```bash
# Start Python web server
python3 -m http.server 8083

# Open browser to http://localhost:8083
```

## Technical Details

### Technology Stack
- **Mapbox GL JS** - 3D map rendering engine
- **OpenStreetMap Data** - Building footprints and heights
- **WebGL** - Hardware-accelerated 3D graphics
- **Pure JavaScript** - No frameworks, lightweight

### Map Configuration
- **Center**: 40.7580°N, 73.9855°W (Manhattan)
- **Zoom**: 13.5 (city-scale view)
- **Pitch**: 60° (angled 3D perspective)
- **Bearing**: -17.6° (slight rotation)

### Performance
- Optimized for smooth 60fps video recording
- Efficient dome rendering using fill-extrusion
- Hardware-accelerated WebGL graphics
- Low memory footprint

## Usage for Video Demonstrations

### Recording Tips
1. **Start with Overview** - Show the entire Manhattan area
2. **Toggle Zones** - Demonstrate restriction and enforcement separately
3. **Use Street Level** - Show immersive close-up views
4. **Click Domes** - Display zone information popups
5. **Smooth Transitions** - Use preset buttons for professional camera moves

### Best Practices
- Record at 1920x1080 or higher resolution
- Allow 2-3 seconds for smooth transitions
- Use manual camera control for custom angles
- Toggle zones individually to focus attention

## Customization

### Adding More Zones

Edit the zone arrays in `index.html`:

```javascript
// Add a new restriction zone
const restrictionZones = [
    // ... existing zones ...
    {
        id: 'new-zone',
        name: 'Zone Name',
        center: [latitude, longitude],
        radius: 500, // meters
        apps: ['App1', 'App2']
    }
];

// Add a new enforcement zone
const enforcementZones = [
    // ... existing zones ...
    {
        id: 'new-enforcement',
        name: 'Zone Name',
        center: [latitude, longitude],
        radius: 300,
        schedule: '22:00 - 08:00'
    }
];
```

### Changing Colors

Modify the paint properties in `index.html`:

```javascript
// Restriction zones (currently red #E53935)
'fill-extrusion-color': '#YOUR_COLOR',

// Enforcement zones (currently white #ffffff)
'fill-extrusion-color': '#YOUR_COLOR',
```

### Adjusting Dome Heights

```javascript
// Make domes taller or shorter
'fill-extrusion-height': zone.radius * 1.5, // Increase multiplier for taller domes
```

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires WebGL support

## Next Steps

After confirming this demo works for your needs:
1. Test camera angles for your video
2. Adjust zone locations if needed
3. Approve for integration into existing demos

## Phase 2: Integration Plan

Once approved, this 3D visualization will be integrated into:
- `manhattan-enforcement-demo`
- `manhattan-enforcement-demo-unlocked`

All existing functionality (chat, policies, user interaction) will be preserved.

## Support

For issues or customization requests, refer to the implementation plan or contact the development team.

---

**SkyWall OS** - Your Tech, Your Choice



