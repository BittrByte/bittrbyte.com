# Skywall OS - Independent Mode Demo

## Overview

This demo showcases **Independent Mode**, where devices independently create and enforce their own policies without relying on a central parent device or coordination with other devices.

## Features

- **Four Device Types**: Desktop, Phone, Laptop, and Tablet displayed side by side
- **SKYWALL Interface**: Each device displays the SKYWALL text on its screen
- **White Glow Effect**: All devices have a subtle white glow to indicate their active, independent status
- **Pulsing Animation**: Devices pulse sequentially from left to right with enhanced glow effect
- **No Connections**: Devices operate independently with no connecting lines between them
- **Responsive Design**: Adapts to different screen sizes
- **Consistent Styling**: Matches the visual language of other Skywall OS mode demos

## Running the Demo

### Quick Start

```bash
./start.sh
```

The demo will be available at: `http://localhost:8003`

### Manual Start

If you prefer to use a different method:

```bash
# Using Python 3
python3 -m http.server 8003

# Or using Python 2
python -m SimpleHTTPServer 8003
```

## File Structure

```
independent-mode/
├── index.html              # Main HTML file
├── css/
│   ├── common.css         # Common styles and variables
│   └── independent.css    # Independent mode specific styles
├── start.sh               # Launch script
└── README.md             # This file
```

## Design Details

### Visual Elements

- **Background**: Dark gradient (linear-gradient from #1a1a1a to #2d2d2d)
- **Title**: "Independent Mode" in Montserrat font
- **Subtitle**: "Devices independently create and enforce their own policies"
- **Device Layout**: Horizontal side-by-side arrangement
- **Glow Effect**: White drop-shadow filter on all devices
- **Pulsing Animation**: 8-second cycle with sequential device pulsing (Desktop → Phone → Laptop → Tablet)

### Device Specifications

Each device is rendered as an SVG with:
- Realistic hardware details (bezels, buttons, stands, etc.)
- SKYWALL text displayed on the screen
- Device name label underneath
- Consistent metallic and glass gradients

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Notes

- Devices feature a pulsing animation that cycles sequentially from left to right
- Each device pulses with a 2-second interval, creating a smooth wave effect
- All devices use the same SVG designs as the Satellite Mode demo for consistency
- The demo is optimized for display on screens 900px and wider







