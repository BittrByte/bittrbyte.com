// Skywall OS Ecosystem Visualization - Dynamic Layout with Smooth Transitions

(function() {
    'use strict';

    // Configuration
    const DISPLAY_DURATION = 4000; // 4s per parent device
    const TRANSITION_DURATION = 1000; // 1s smooth transition between parents
    const PARENT_DEVICES = ['phone']; // Keep parent fixed as parent phone
    const TOP_GAP_ANGLE = 30; // degrees on each side of top (total 60° gap)
    
    // Get responsive circle radius based on viewport
    function getCircleRadius() {
        const width = window.innerWidth;
        if (width <= 768) return 200;
        if (width <= 1200) return 270;
        return 350;
    }
    
    // All devices in the ecosystem
    const ALL_DEVICES = ['phone', 'child-phone', 'laptop', 'tablet', 'console', 'desktop'];
    
    // State
    let currentParentIndex = 0;
    let isTransitioning = false;
    let cycleTimeout = null;

    // DOM Elements
    const centerParent = document.getElementById('center-parent');
    const parentLabel = document.getElementById('parent-label');
    const circleWrappers = Array.from(document.querySelectorAll('.device-circle'));
    const visualizationArea = document.querySelector('.visualization-area');

    // Device Labels
    const deviceLabels = {
        phone: 'Phone (Parent)',
        'child-phone': "Child's Phone",
        laptop: "Child's Laptop",
        tablet: "Child's Tablet",
        console: "Child's Console",
        desktop: "Child's Desktop",
        watch: 'Smartwatch'
    };

    // Create SVG container for connection lines
    const svgNS = "http://www.w3.org/2000/svg";
    const connectionSvg = document.createElementNS(svgNS, "svg");
    connectionSvg.setAttribute("class", "connection-lines");
    connectionSvg.style.position = "absolute";
    connectionSvg.style.top = "0";
    connectionSvg.style.left = "0";
    connectionSvg.style.width = "100%";
    connectionSvg.style.height = "100%";
    connectionSvg.style.pointerEvents = "none";
    connectionSvg.style.zIndex = "5";
    
    // Create arrow marker definition
    const defs = document.createElementNS(svgNS, "defs");
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");
    
    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", "0 0, 10 3, 0 6");
    polygon.setAttribute("fill", "rgba(100, 200, 255, 0.8)");
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    connectionSvg.appendChild(defs);
    
    visualizationArea.insertBefore(connectionSvg, visualizationArea.firstChild);

    // Initialize
    function init() {
        // Set initial parent
        updateParentDisplay(PARENT_DEVICES[0], false);
        // Start cycling
        startCycle();
    }

    // Start the cycling animation
    function startCycle() {
        cycleTimeout = setTimeout(() => {
            transitionToNextParent();
        }, DISPLAY_DURATION);
    }

    // Calculate positions for subsidiary devices in a circle, avoiding the top
    function calculateCirclePositions(subsidiaryDevices) {
        const numDevices = subsidiaryDevices.length;
        const positions = [];
        const radius = getCircleRadius();
        
        // We want the gap at the TOP (270° in standard coordinates where 0° = right, 90° = down)
        // Gap is from 240° to 300° (60° total, centered at 270° = top)
        // Devices should be arranged from 300° to 240° (going clockwise through 360°/0°)
        // Available arc: 360° - 60° = 300°
        
        const startAngle = 300; // Start just after the gap (right side of top)
        const endAngle = 240;   // End just before the gap (left side of top)
        const availableArc = 360 - (2 * TOP_GAP_ANGLE); // 300°
        
        // For even distribution, divide arc by (numDevices - 1) to get spacing between devices
        // This places first device at startAngle and last device at endAngle
        const angleStep = numDevices > 1 ? availableArc / (numDevices - 1) : 0;
        
        for (let i = 0; i < numDevices; i++) {
            const angle = startAngle + (i * angleStep);
            const angleRad = (angle * Math.PI) / 180;
            
            // Calculate x, y (standard trigonometry)
            // Note: In CSS, Y increases downward, so positive Y is down
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);
            
            positions.push({ x, y, angle });
        }
        
        return positions;
    }

    // Update device positions with smooth transitions
    function updateDevicePositions(parentDevice, animate = true) {
        // Get list of subsidiary devices
        const subsidiaryDevices = ALL_DEVICES.filter(d => d !== parentDevice);
        
        // Calculate new positions
        const positions = calculateCirclePositions(subsidiaryDevices);
        
        // Map device names to their wrappers
        const deviceMap = {};
        circleWrappers.forEach(wrapper => {
            if (wrapper.dataset.device) {
                deviceMap[wrapper.dataset.device] = wrapper;
            }
        });
        
        // Update each subsidiary device position
        subsidiaryDevices.forEach((deviceName, index) => {
            const wrapper = deviceMap[deviceName];
            if (!wrapper) return;
            
            const pos = positions[index];
            
            // Show the device
            wrapper.classList.remove('hidden');
            wrapper.style.opacity = '1';
            
            // Apply new position with transition
            if (animate) {
                wrapper.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity ${TRANSITION_DURATION / 2}ms ease`;
            } else {
                wrapper.style.transition = 'none';
            }
            
            wrapper.style.transform = `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`;
        });
        
        // Hide any circle devices that are not part of this configured set.
        const activeNames = new Set(subsidiaryDevices);
        circleWrappers.forEach(wrapper => {
            const name = wrapper.dataset.device;
            if (!activeNames.has(name) && name !== parentDevice) {
                wrapper.classList.add('hidden');
                wrapper.style.opacity = '0';
            }
        });
        
        // Hide the parent device from circle
        const parentWrapper = deviceMap[parentDevice];
        if (parentWrapper) {
            parentWrapper.classList.add('hidden');
            parentWrapper.style.opacity = '0';
        }
        
        // Update connection lines
        if (animate) {
            setTimeout(() => drawConnectionLines(positions), TRANSITION_DURATION / 2);
        } else {
            drawConnectionLines(positions);
        }
    }

    // Draw dotted lines from center to each subsidiary device with animated arrows
    function drawConnectionLines(positions) {
        // Clear existing lines (preserve defs)
        const defs = connectionSvg.querySelector('defs');
        connectionSvg.innerHTML = '';
        if (defs) {
            connectionSvg.appendChild(defs);
        }
        
        // Get center based on visualization area size
        const vizRect = visualizationArea.getBoundingClientRect();
        const centerX = vizRect.width / 2;
        const centerY = vizRect.height / 2;
        
        positions.forEach((pos, index) => {
            // Create dashed line
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", centerX);
            line.setAttribute("y1", centerY);
            line.setAttribute("x2", centerX + pos.x);
            line.setAttribute("y2", centerY + pos.y);
            line.setAttribute("stroke", "rgba(255, 255, 255, 0.25)");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("stroke-dasharray", "10, 6");
            line.setAttribute("class", "connection-line");
            
            // Animate the line
            line.style.opacity = '0';
            connectionSvg.appendChild(line);
            
            // Create animated arrows along the line
            createAnimatedArrows(centerX, centerY, centerX + pos.x, centerY + pos.y, index);
            
            // Fade in
            setTimeout(() => {
                line.style.transition = `opacity ${TRANSITION_DURATION / 2}ms ease`;
                line.style.opacity = '1';
            }, 50);
        });
    }
    
    // Create multiple arrows that animate along a line path
    function createAnimatedArrows(x1, y1, x2, y2, lineIndex) {
        const numArrows = 3; // Number of arrows per line
        const arrowDelay = 0.6; // Delay between arrows in seconds
        
        for (let i = 0; i < numArrows; i++) {
            // Create arrow circle
            const arrow = document.createElementNS(svgNS, "circle");
            arrow.setAttribute("r", "4");
            arrow.setAttribute("fill", "rgba(100, 200, 255, 0.9)");
            arrow.setAttribute("class", "animated-arrow");
            
            // Add glow effect
            arrow.setAttribute("filter", "url(#arrow-glow)");
            
            // Calculate line length for animation
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // Set initial position at center
            arrow.setAttribute("cx", x1);
            arrow.setAttribute("cy", y1);
            
            // Create animation path
            const animateX = document.createElementNS(svgNS, "animate");
            animateX.setAttribute("attributeName", "cx");
            animateX.setAttribute("from", x1);
            animateX.setAttribute("to", x2);
            animateX.setAttribute("dur", "2.5s");
            animateX.setAttribute("begin", `${i * arrowDelay}s`);
            animateX.setAttribute("repeatCount", "indefinite");
            
            const animateY = document.createElementNS(svgNS, "animate");
            animateY.setAttribute("attributeName", "cy");
            animateY.setAttribute("from", y1);
            animateY.setAttribute("to", y2);
            animateY.setAttribute("dur", "2.5s");
            animateY.setAttribute("begin", `${i * arrowDelay}s`);
            animateY.setAttribute("repeatCount", "indefinite");
            
            // Fade out near the end
            const animateOpacity = document.createElementNS(svgNS, "animate");
            animateOpacity.setAttribute("attributeName", "opacity");
            animateOpacity.setAttribute("values", "0;1;1;0");
            animateOpacity.setAttribute("keyTimes", "0;0.1;0.85;1");
            animateOpacity.setAttribute("dur", "2.5s");
            animateOpacity.setAttribute("begin", `${i * arrowDelay}s`);
            animateOpacity.setAttribute("repeatCount", "indefinite");
            
            arrow.appendChild(animateX);
            arrow.appendChild(animateY);
            arrow.appendChild(animateOpacity);
            
            connectionSvg.appendChild(arrow);
        }
    }

    // Update content based on template
    function updateParentDisplay(deviceType, animate = true) {
        const template = document.getElementById(`${deviceType}-template`);
        if (!template) return;

        const clone = template.content.cloneNode(true);
        
        // If animating, handle fade out/in
        if (animate) {
            centerParent.style.opacity = '0';
            centerParent.style.transform = 'translate(-50%, -50%) scale(0.9)';
            
            // Fade out connection lines
            const lines = connectionSvg.querySelectorAll('.connection-line');
            lines.forEach(line => {
                line.style.transition = `opacity ${TRANSITION_DURATION / 3}ms ease`;
                line.style.opacity = '0';
            });
            
            setTimeout(() => {
                centerParent.innerHTML = '';
                centerParent.appendChild(clone);
                const label = document.createElement('div');
                label.className = 'device-label parent-label';
                label.textContent = deviceLabels[deviceType];
                centerParent.appendChild(label);

                if (parentLabel) {
                    parentLabel.textContent = deviceLabels[deviceType];
                }

                updateDevicePositions(deviceType, animate);

                // Fade in
                setTimeout(() => {
                    centerParent.style.transition = `opacity ${TRANSITION_DURATION / 2}ms ease, transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
                    centerParent.style.opacity = '1';
                    centerParent.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 50);
            }, TRANSITION_DURATION / 3);
        } else {
            // Initial set (no animation)
            centerParent.innerHTML = '';
            centerParent.appendChild(clone);
            const label = document.createElement('div');
            label.className = 'device-label parent-label';
            label.textContent = deviceLabels[deviceType];
            centerParent.appendChild(label);
            updateDevicePositions(deviceType, false);
        }
    }

    // Transition to next parent device
    function transitionToNextParent() {
        if (isTransitioning) return;
        isTransitioning = true;

        currentParentIndex = (currentParentIndex + 1) % PARENT_DEVICES.length;
        const newParent = PARENT_DEVICES[currentParentIndex];

        updateParentDisplay(newParent, true);

        setTimeout(() => {
            isTransitioning = false;
            startCycle();
        }, TRANSITION_DURATION);
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (cycleTimeout) {
                clearTimeout(cycleTimeout);
            }
        } else {
            if (!isTransitioning) {
                startCycle();
            }
        }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-calculate positions for current parent
            const currentParent = PARENT_DEVICES[currentParentIndex];
            updateDevicePositions(currentParent, false);
        }, 250);
    });

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
