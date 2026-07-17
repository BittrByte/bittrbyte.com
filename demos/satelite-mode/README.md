# Skywall OS - Ecosystem Visualization Demo

A visual demonstration of the Skywall OS device ecosystem, showing how different devices (phone, laptop, desktop, tablet, smartwatch, and console) connect within the Skywall ecosystem with dynamic parent device rotation.

## Overview

This demo illustrates the **ecosystem functionality** of Skywall OS by:
- Displaying all supported devices in a circular layout
- Automatically rotating parent device status between Phone, Desktop, and Laptop
- Showing parent devices with a distinctive glow effect
- Animating connected devices with subtle pulse effects

## Features

### Parent Device Rotation
- **Phone**, **Desktop**, and **Laptop** take turns being the "parent" device
- Each parent device moves to the center of the circle
- Parent devices display with an animated glow effect
- Smooth transitions between parent devices (1.5s movement, 4s display)

### Connected Devices
- **Tablet**, **Smartwatch**, and **Console** remain in the circle
- Show subtle pulse animation to indicate they're connected to the ecosystem
- Maintain their positions while parent devices rotate

### Visual Design
- Matches the Skywall OS design language
- Device outlines inspired by the phone template used in other demos
- Clean, modern aesthetic with smooth animations
- Responsive design for different screen sizes

## Running the Demo

### Option 1: Using the provided script (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Using Python directly
```bash
# Python 3
python3 -m http.server 8003

# Then open http://localhost:8003 in your browser
```

### Option 3: Using any other local server
Just serve the files from this directory with any HTTP server on your preferred port.

## File Structure

```
skywall-os-ecosystem-demo/
├── index.html              # Main HTML structure
├── css/
│   ├── common.css         # Shared styles
│   └── ecosystem.css      # Ecosystem-specific styles
├── js/
│   └── ecosystem.js       # Animation logic
├── start.sh               # Server launcher script
└── README.md             # This file
```

## Technical Details

### Animation Cycle
1. Device moves to center (1.5 seconds)
2. Device displays as parent with glow (4 seconds)
3. Device returns to circle (1.5 seconds)
4. Next device begins cycle (after 0.5s pause)
5. Repeats: Phone → Desktop → Laptop → Phone...

### Responsive Breakpoints
- **Desktop** (>1200px): Full size (900px visualization area)
- **Tablet** (768px-1200px): Medium size (700px visualization area)
- **Mobile** (<768px): Compact size (500px visualization area)

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- CSS transforms and animations support required

## Design Philosophy

This visualization demonstrates Skywall OS's core concept of device flexibility - where any capable device (phone, desktop, laptop) can act as the "parent" or control hub for the ecosystem, while other devices seamlessly connect and sync.

The circular layout represents equality among devices, while the dynamic parent rotation shows the system's adaptability and user choice in selecting their primary control device.

---

**Part of the Skywall OS Demo Suite**

