// Side Menu - Skywall OS Simulator

(function() {
    'use strict';

    const sideMenu = document.getElementById('side-menu');
    const chatHistory = document.getElementById('chat-history');
    const mapBtn = document.getElementById('map-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const mapView = document.getElementById('map-view');
    const settingsScreen = document.getElementById('settings-screen');

    // Sample chat history data (empty by default - user creates policies)
    let sampleHistory = [];
    
    // Check if we're in tour mode
    let isTourMode = false;

    // Close side menu when clicking outside
    sideMenu.addEventListener('click', (e) => {
        if (e.target === sideMenu) {
            closeSideMenu();
        }
    });

    function closeSideMenu() {
        sideMenu.classList.remove('active');
    }

    // Map button
    mapBtn.addEventListener('click', () => {
        closeSideMenu();
        mapView.classList.add('active');
    });

    // Settings button
    settingsBtn.addEventListener('click', () => {
        closeSideMenu();
        settingsScreen.classList.add('active');
    });

    // Create chat history item
    function createHistoryItem(chat) {
        const item = document.createElement('div');
        item.className = 'chat-history-item';
        if (chat.canDelete) {
            item.classList.add('can-delete');
        }
        item.dataset.chatId = chat.id;

        const titleText = document.createElement('div');
        titleText.className = 'chat-title-text';
        titleText.textContent = chat.title;

        const date = document.createElement('div');
        date.className = 'chat-date';
        date.textContent = chat.date;

        const apps = document.createElement('div');
        apps.className = 'chat-apps';
        apps.textContent = chat.apps;

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn-swipe';
        deleteBtn.textContent = 'Delete';

        item.appendChild(titleText);
        item.appendChild(date);
        item.appendChild(apps);
        item.appendChild(deleteBtn);

        // Swipe to delete (only if canDelete)
        if (chat.canDelete) {
            let touchStartX = 0;
            let touchEndX = 0;

            item.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            });

            item.addEventListener('touchmove', (e) => {
                touchEndX = e.touches[0].clientX;
                const diff = touchStartX - touchEndX;
                if (diff > 0) {
                    item.style.transform = `translateX(-${Math.min(diff, 80)}px)`;
                }
            });

            item.addEventListener('touchend', () => {
                const diff = touchStartX - touchEndX;
                if (diff > 40) {
                    item.classList.add('swiping');
                } else {
                    item.classList.remove('swiping');
                    item.style.transform = '';
                }
            });

            // Mouse swipe for desktop
            let mouseDown = false;
            item.addEventListener('mousedown', (e) => {
                mouseDown = true;
                touchStartX = e.clientX;
            });

            document.addEventListener('mousemove', (e) => {
                if (mouseDown && item.contains(e.target)) {
                    touchEndX = e.clientX;
                    const diff = touchStartX - touchEndX;
                    if (diff > 0) {
                        item.style.transform = `translateX(-${Math.min(diff, 80)}px)`;
                    }
                }
            });

            document.addEventListener('mouseup', () => {
                if (mouseDown) {
                    const diff = touchStartX - touchEndX;
                    if (diff > 40) {
                        item.classList.add('swiping');
                    } else {
                        item.classList.remove('swiping');
                        item.style.transform = '';
                    }
                    mouseDown = false;
                }
            });

            // Delete button click
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${chat.title}"?`)) {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.remove();
                        if (chatHistory.children.length === 0) {
                            showEmptyState();
                        }
                    }, 300);
                }
            });
        }

        // Click to open chat
        item.addEventListener('click', () => {
            if (!item.classList.contains('swiping')) {
                // Open this chat conversation
                closeSideMenu();
                // Could add logic to load this chat in the main chat view
                console.log('Opening chat:', chat.id);
            }
        });

        return item;
    }

    // Show empty state
    function showEmptyState() {
        chatHistory.innerHTML = '<div class="empty-history">No chat history yet.<br>Create a policy to get started.</div>';
    }

    // Populate chat history
    function populateHistory() {
        // Don't clear or populate if in tour mode - let tour handle it
        if (isTourMode) {
            console.log('Tour mode active - skipping default history population');
            return;
        }
        
        chatHistory.innerHTML = '';
        if (sampleHistory.length === 0) {
            showEmptyState();
        } else {
            sampleHistory.forEach(chat => {
                chatHistory.appendChild(createHistoryItem(chat));
            });
        }
    }

    // Initialize - but wait to see if tour mode is set
    setTimeout(() => {
        if (!isTourMode) {
            populateHistory();
        }
    }, 100);

    // Export for other modules
    window.SideMenuModule = {
        addChatToHistory: function(chat) {
            sampleHistory.unshift(chat);
            populateHistory();
        },
        updateDeletePermissions: function(atEnforcementLocation) {
            // Skip if in tour mode
            if (isTourMode) return;
            
            // Update which chats can be deleted based on enforcement location
            sampleHistory.forEach(chat => {
                chat.canDelete = atEnforcementLocation;
            });
            populateHistory();
        },
        enableTourMode: function() {
            console.log('Tour mode enabled in sidemenu.js');
            isTourMode = true;
        },
        disableTourMode: function() {
            isTourMode = false;
            populateHistory();
        }
    };
})();

