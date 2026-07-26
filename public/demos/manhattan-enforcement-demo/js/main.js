// Main Initialization - Skywall OS Simulator

(function() {
    'use strict';

    console.log('Skywall OS Simulator - Initializing...');

    // Wait for all modules to load
    function init() {
        console.log('✓ Boot screen loaded');
        console.log('✓ Home screen loaded');
        console.log('✓ Control panel loaded');
        console.log('✓ Skywall chat loaded');
        console.log('✓ Device selector loaded');
        console.log('✓ Side menu loaded');
        console.log('✓ Map view loaded');
        console.log('✓ Settings loaded');
        console.log('✓ State management loaded');
        console.log('✓ Enforcement engine loaded');
        
        // Add device dropdown CSS if not already included
        if (!document.querySelector('link[href*="dropdown.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/dropdown.css';
            document.head.appendChild(link);
        }

        // Add device dropdown script if not already loaded
        if (!document.querySelector('script[src*="device-dropdown.js"]')) {
            const script = document.createElement('script');
            script.src = 'js/device-dropdown.js';
            document.body.appendChild(script);
        }

        console.log('🚀 Skywall OS Simulator ready!');
        console.log('');
        console.log('Phase 1: UI Complete');
        console.log('Phase 2: Auto-playing scenarios (coming soon)');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


