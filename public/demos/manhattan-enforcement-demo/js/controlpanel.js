// Control Panel - Skywall OS Simulator

(function() {
    'use strict';

    const controlPanel = document.getElementById('control-panel');
    const statusBar = document.querySelector('.status-bar');
    const quickSettings = document.querySelectorAll('.quick-setting');
    const brightnessSlider = document.querySelector('.brightness-slider');

    let touchStartY = 0;
    let touchEndY = 0;
    let isPanelOpen = false;

    // Toggle setting
    function toggleSetting(setting) {
        const element = setting;
        const status = element.querySelector('.setting-status');
        const settingType = element.dataset.setting;

        if (element.classList.contains('active')) {
            element.classList.remove('active');
            status.textContent = 'Off';
        } else {
            element.classList.add('active');
            if (settingType === 'wifi') {
                status.textContent = 'Home Network';
            } else {
                status.textContent = 'On';
            }
        }
    }

    // Open control panel
    function openPanel() {
        if (!isPanelOpen) {
            controlPanel.classList.add('active');
            isPanelOpen = true;
        }
    }

    // Close control panel
    function closePanel() {
        if (isPanelOpen) {
            controlPanel.classList.remove('active');
            isPanelOpen = false;
        }
    }

    // Handle swipe down from status bar
    function handleTouchStart(e) {
        const touch = e.touches[0];
        touchStartY = touch.clientY;
    }

    function handleTouchMove(e) {
        const touch = e.touches[0];
        touchEndY = touch.clientY;
    }

    function handleTouchEnd() {
        const diff = touchEndY - touchStartY;
        if (diff > 50 && touchStartY < 100) {
            openPanel();
        } else if (diff < -50 && isPanelOpen) {
            closePanel();
        }
    }

    // Click outside to close
    controlPanel.addEventListener('click', (e) => {
        if (e.target === controlPanel) {
            closePanel();
        }
    });

    // Quick setting clicks
    quickSettings.forEach(setting => {
        setting.addEventListener('click', () => {
            toggleSetting(setting);
        });
    });

    // Brightness slider
    brightnessSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const phone = document.getElementById('phone-container');
        phone.style.filter = `brightness(${50 + (value / 2)}%)`;
    });

    // Touch listeners
    statusBar.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    // Mouse events for desktop testing
    let mouseDown = false;
    statusBar.addEventListener('mousedown', (e) => {
        mouseDown = true;
        touchStartY = e.clientY;
    });
    document.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            touchEndY = e.clientY;
        }
    });
    document.addEventListener('mouseup', () => {
        if (mouseDown) {
            handleTouchEnd();
            mouseDown = false;
        }
    });

    // Initialize wifi and data as on
    document.querySelector('[data-setting="wifi"]').classList.add('active');
    document.querySelector('[data-setting="data"]').classList.add('active');
    document.querySelector('[data-setting="rotation"]').classList.add('active');
})();


