// Settings Screen - Skywall OS Simulator

(function() {
    'use strict';

    const settingsScreen = document.getElementById('settings-screen');
    const settingsBackBtn = document.getElementById('settings-back-btn');
    const settingsContent = document.getElementById('settings-content');

    const settingsData = [
        {
            section: '',
            items: [
                {
                    icon: `<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>`,
                    title: 'Devices',
                    subtitle: 'Manage your connected devices'
                },
                {
                    icon: `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
                    title: 'Security',
                    subtitle: 'Screen lock, biometrics, encryption'
                },
                {
                    icon: `<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
                    title: 'Notifications',
                    subtitle: 'App notifications and alerts'
                },
                {
                    icon: `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
                    title: 'Storage',
                    subtitle: '45 GB used of 128 GB'
                }
            ]
        }
    ];

    // Populate settings
    function populateSettings() {
        settingsContent.innerHTML = '';

        settingsData.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'settings-section';

            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'settings-section-title';
            sectionTitle.textContent = section.section;
            sectionDiv.appendChild(sectionTitle);

            section.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'settings-item';

                const icon = document.createElement('div');
                icon.className = 'settings-item-icon';
                icon.innerHTML = item.icon;

                const content = document.createElement('div');
                content.className = 'settings-item-content';

                const title = document.createElement('div');
                title.className = 'settings-item-title';
                title.textContent = item.title;

                const subtitle = document.createElement('div');
                subtitle.className = 'settings-item-subtitle';
                subtitle.textContent = item.subtitle;

                content.appendChild(title);
                content.appendChild(subtitle);

                itemDiv.appendChild(icon);
                itemDiv.appendChild(content);

                if (item.badge) {
                    const badge = document.createElement('div');
                    badge.className = item.badgeClass || 'settings-item-badge';
                    badge.textContent = item.badge;
                    itemDiv.appendChild(badge);
                }

                const arrow = document.createElement('div');
                arrow.className = 'settings-item-arrow';
                arrow.textContent = '›';
                itemDiv.appendChild(arrow);

                itemDiv.addEventListener('click', () => {
                    console.log('Settings item clicked:', item.title);
                    // In full implementation, would navigate to detail screen
                });

                sectionDiv.appendChild(itemDiv);
            });

            settingsContent.appendChild(sectionDiv);
        });
    }

    // Back button
    settingsBackBtn.addEventListener('click', () => {
        settingsScreen.classList.remove('active');
    });

    // Initialize
    populateSettings();
})();

