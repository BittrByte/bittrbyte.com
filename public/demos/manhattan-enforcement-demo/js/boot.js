// Boot Screen - Skywall OS Simulator

(function() {
    'use strict';

    const bootScreen = document.getElementById('boot-screen');
    const homeScreen = document.getElementById('home-screen');

    // Boot sequence
    function bootSequence() {
        // Show boot screen for 2 seconds
        setTimeout(() => {
            bootScreen.classList.remove('active');
            homeScreen.classList.add('active');
        }, 2000);
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootSequence);
    } else {
        bootSequence();
    }
})();


