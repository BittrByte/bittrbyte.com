// Device Dropdown - Skywall OS Simulator

(function() {
    'use strict';

    const deviceDropdown = document.getElementById('device-dropdown');
    const deviceSelector = document.getElementById('device-selector');
    const dropdownItems = deviceDropdown.querySelectorAll('.dropdown-item');

    const deviceIcons = {
        phone: `<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>`,
        laptop: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="1"/><line x1="2" y1="20" x2="22" y2="20"/><line x1="3" y1="16" x2="3" y2="20"/><line x1="21" y1="16" x2="21" y2="20"/></svg>`,
        desktop: `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="1"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
        tablet: `<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>`,
        watch: `<svg viewBox="0 0 24 24"><rect x="9" y="7" width="6" height="10" rx="1"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M9 17v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3"/></svg>`,
        console: `<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="7" cy="12" r="1.5"/><circle cx="11" cy="12" r="1.5"/><line x1="16" y1="10" x2="16" y2="14"/><line x1="19" y1="10" x2="19" y2="14"/></svg>`
    };

    const deviceLabels = {
        phone: 'Phone (Parent)',
        laptop: 'Laptop',
        desktop: 'Desktop',
        tablet: 'Tablet',
        watch: 'Smartwatch',
        console: 'Console'
    };

    let selectedDevice = 'phone';

    // Populate dropdown icons
    function populateDropdownIcons() {
        dropdownItems.forEach(item => {
            const device = item.dataset.device;
            const iconSpan = item.querySelector('.device-icon-lg');
            if (iconSpan) {
                iconSpan.innerHTML = deviceIcons[device];
            }
        });
    }

    // Handle device selection
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const device = item.dataset.device;
            selectDevice(device);
            deviceDropdown.classList.remove('active');
        });
    });

    function selectDevice(device) {
        selectedDevice = device;

        // Update selected styling
        dropdownItems.forEach(item => {
            if (item.dataset.device === device) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // Update device selector display
        const icon = deviceSelector.querySelector('.device-icon');
        const label = deviceSelector.querySelector('.device-label');
        icon.innerHTML = deviceIcons[device];
        label.textContent = deviceLabels[device];
    }

    // Initialize
    populateDropdownIcons();
    selectDevice('phone');
})();

