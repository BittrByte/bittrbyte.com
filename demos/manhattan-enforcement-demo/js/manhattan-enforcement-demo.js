// Manhattan Enforcement Demo - Automated demonstration of location-based policy enforcement
// Shows that users CANNOT edit policies unless at enforcement location & time

(function() {
    'use strict';

    const bootScreen = document.getElementById('boot-screen');
    const homeScreen = document.getElementById('home-screen');
    const skywallChat = document.getElementById('skywall-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatTitle = document.querySelector('.chat-title');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const sideMenu = document.getElementById('side-menu');
    const mapView = document.getElementById('map-view');
    const livingIndicator = document.getElementById('living-indicator');
    const chatHistory = document.getElementById('chat-history');
    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Populate chat history with Manhattan work policy
    let historyPopulated = false;
    
    function populateChatHistory(force = false) {
        if (!chatHistory) {
            console.error('Chat history element not found');
            return;
        }
        
        if (!window.ManhattanEnforcementPolicies || !window.ManhattanEnforcementPolicies.policies) {
            console.error('Manhattan enforcement policies not available');
            return;
        }
        
        if (historyPopulated && !force) {
            console.log('Chat history already populated, skipping');
            return;
        }
        
        if (force || !historyPopulated) {
            chatHistory.innerHTML = '';
        }
        
        console.log('Populating chat history with', window.ManhattanEnforcementPolicies.policies.length, 'policies');
        
        window.ManhattanEnforcementPolicies.policies.forEach((policy, index) => {
            if (!policy) {
                console.error('Policy at index', index, 'is null or undefined');
                return;
            }
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-history-item';
            chatItem.dataset.policyId = policy.id;
            
            // Check if can edit - this will be FALSE at start of demo
            const canEdit = window.ManhattanEnforcementPolicies.canEditPolicy(policy);
            if (!canEdit) {
                chatItem.classList.add('locked');
            }
            
            const lockIcon = !canEdit ? `
                <svg class="lock-icon-svg" viewBox="0 0 24 24" width="14" height="14">
                    <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
            ` : '';
            
            chatItem.innerHTML = `
                <div class="chat-preview">
                    <div class="chat-preview-title">${policy.name} ${lockIcon}</div>
                    <div class="chat-preview-subtitle">${policy.apps.join(', ')} · ${policy.createdAt}</div>
                </div>
                <div class="swipe-actions">
                    <button class="delete-btn" data-policy-id="${policy.id}" ${!canEdit ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            `;
            
            chatHistory.appendChild(chatItem);
            console.log('Added policy item:', policy.name);
        });
        
        historyPopulated = true;
        console.log('Chat history now has', chatHistory.children.length, 'items');
    }
    
    // View a policy's chat conversation
    function viewPolicyChat(policy) {
        if (!policy) {
            console.error('No policy provided to viewPolicyChat');
            return;
        }
        
        // Close side menu
        sideMenu.classList.remove('active');
        
        // Clear current chat
        chatMessages.innerHTML = '';
        
        // Hide title
        if (chatTitle) {
            chatTitle.classList.add('hidden');
        }
        
        // Load conversation
        if (policy.conversation) {
            policy.conversation.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role}`;
                const bubble = document.createElement('div');
                bubble.className = 'message-bubble';
                bubble.textContent = msg.text;
                messageDiv.appendChild(bubble);
                chatMessages.appendChild(messageDiv);
            });
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Handle lock state
        const canEdit = window.ManhattanEnforcementPolicies.canEditPolicy(policy);
        const lockInfoBox = document.getElementById('chat-lock-info');
        const lockInfoText = lockInfoBox?.querySelector('.lock-info-text');
        
        chatInput.disabled = !canEdit;
        
        if (canEdit) {
            chatInput.placeholder = 'Message SKYWALL...';
            chatInput.value = '';
            chatInput.style.background = '';
            chatInput.style.opacity = '';
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.style.display = '';
                sendBtn.style.opacity = '';
                sendBtn.style.background = '';
                sendBtn.style.transform = '';
            }
            if (chatInputContainer) {
                chatInputContainer.style.pointerEvents = '';
                chatInputContainer.style.borderTopColor = '';
                chatInputContainer.style.gap = '';
            }
            if (lockInfoBox) lockInfoBox.style.display = 'none';
        } else {
            // Locked state should look minimal and clearly non-interactive.
            chatInput.placeholder = '';
            chatInput.value = '';
            chatInput.style.background = 'rgba(255, 255, 255, 0.06)';
            chatInput.style.opacity = '0.42';
            if (sendBtn) {
                sendBtn.disabled = true;
                sendBtn.style.display = 'none';
                sendBtn.style.opacity = '0';
                sendBtn.style.transform = 'scale(0.82)';
                sendBtn.style.background = '';
            }
            if (chatInputContainer) {
                chatInputContainer.style.pointerEvents = 'none';
                chatInputContainer.style.borderTopColor = 'rgba(255, 255, 255, 0.08)';
                chatInputContainer.style.gap = '0';
            }
            if (lockInfoBox && lockInfoText) {
                lockInfoText.textContent = window.ManhattanEnforcementPolicies.getEnforcementStatus(policy);
                lockInfoBox.style.display = 'flex';
            }
        }
    }
    
    // Export for use by other modules
    window.ManhattanEnforcementDemo = {
        viewPolicyChat: viewPolicyChat
    };
    
    // Type user message
    async function typeUserMessage(text) {
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.style.height = '44px';
        
        // Hide title and chips
        if (chatTitle) {
            chatTitle.classList.add('hidden');
        }
        const chips = document.querySelectorAll('.recommendation-chips');
        chips.forEach(chip => chip.remove());
        
        // Type character by character
        for (let i = 0; i < text.length; i++) {
            chatInput.value += text[i];
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            await wait(80);
        }
        
        await wait(400);
        
        // Send message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.style.height = '44px';
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await wait(300);
    }
    
    // Add AI message
    async function addAIMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await wait(200);
    }
    
    // Summon SKYWALL chat
    async function summonChat() {
        if (window.ChatModule && window.ChatModule.open) {
            await window.ChatModule.open();
        }
        await wait(1000);
    }
    
    // Close chat
    async function closeChat() {
        if (window.ChatModule && window.ChatModule.close) {
            await window.ChatModule.close();
        }
        await wait(1000);
    }
    
    // Initial conversation
    async function demonstrateInitialChat() {
        await typeUserMessage('Hi SKYWALL');
        await wait(800);
        await addAIMessage("Hi! I'm the rational AI version of yourself, here to protect you from you. You have 1 active policy keeping you focused at work.");
        await wait(2500);
        await typeUserMessage('Show me my work policy');
        await wait(800);
        await addAIMessage("Sure! Let me open your policy list.");
        await wait(2000);
    }
    
    // Open hamburger menu and show policy
    async function demonstrateHamburgerMenu() {
        // Populate chat history BEFORE opening menu
        populateChatHistory();
        
        await wait(300);
        
        // Now open the menu
        sideMenu.classList.add('active');
        
        await wait(2500);
    }
    
    // Demonstrate viewing the LOCKED policy
    async function demonstrateViewingLockedPolicy() {
        const policy = window.ManhattanEnforcementPolicies.getPolicyById('manhattan-work-policy');
        
        if (!policy) {
            console.error('Manhattan work policy not found');
            return;
        }
        
        // Highlight policy in list
        const chatItem = document.querySelector(`[data-policy-id="${policy.id}"]`);
        if (chatItem) {
            chatItem.style.background = 'rgba(255, 255, 255, 0.1)';
        }
        await wait(1000);
        
        // View the locked policy
        viewPolicyChat(policy);
        await wait(2500);
        
        // Scroll through conversation
        chatMessages.scrollTop = 0;
        await wait(800);
        
        for (let i = 0; i < chatMessages.scrollHeight; i += 20) {
            chatMessages.scrollTop = i;
            await wait(30);
        }
        
        await wait(2000);
        
        // Show that input is DISABLED (red border)
        chatInput.style.border = '2px solid rgba(255, 0, 0, 0.4)';
        await wait(1500);
        chatInput.style.border = '';
        
        await wait(1500);
    }
    
    // Demonstrate trying to delete (won't work - locked)
    async function demonstrateTryingToDelete() {
        // Go back to menu
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) menuBtn.click();
        
        sideMenu.classList.add('active');
        await wait(1000);
        
        const policyItem = document.querySelector(`[data-policy-id="manhattan-work-policy"]`);
        
        // Try to click disabled delete button
        if (policyItem) {
            const deleteBtn = policyItem.querySelector('.delete-btn');
            if (deleteBtn) {
                // Highlight the disabled delete button
                deleteBtn.style.transform = 'scale(1.2)';
                deleteBtn.style.background = 'rgba(255, 0, 0, 0.2)';
                await wait(800);
                deleteBtn.style.transform = '';
                deleteBtn.style.background = '';
                await wait(600);
                
                // Try again to emphasize it's locked
                deleteBtn.style.transform = 'scale(1.2)';
                deleteBtn.style.background = 'rgba(255, 0, 0, 0.2)';
                await wait(800);
                deleteBtn.style.transform = '';
                deleteBtn.style.background = '';
            }
            
            await wait(1500);
        }
    }
    
    // Show map with zones
    async function demonstrateMap() {
        // Close side menu
        sideMenu.classList.remove('active');
        
        // Open map
        mapView.classList.add('active');
        await wait(500);
        
        // Initialize map with Manhattan enforcement policies
        if (window.MapModule && window.MapModule.initManhattanEnforcementMap) {
            window.MapModule.initManhattanEnforcementMap(window.ManhattanEnforcementPolicies);
        }
        
        // Show overview with both pins for 10 seconds
        await wait(10000);
        
        // Pan to user's current location (World Trade Center)
        if (window.MapModule && window.MapModule.panToWorldTradeCenter) {
            window.MapModule.panToWorldTradeCenter();
        }
        
        // Wait for pan animation + show close-up
        await wait(2000); // Pan animation
        await wait(8000); // Close-up view
        
        // Close map
        mapView.classList.remove('active');
        await wait(500);
    }
    
    // Show recommendation chips
    function showRecommendationChips() {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'recommendation-chips';
        
        const suggestions = [
            'Block social media at work',
            'Limit screen time for gaming',
            'Set location-based restrictions'
        ];
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = suggestion;
            chipsContainer.appendChild(chip);
        });
        
        chatMessages.appendChild(chipsContainer);
    }
    
    // Reset for loop
    function resetState() {
        bootScreen.classList.add('active');
        homeScreen.classList.remove('active');
        skywallChat.classList.remove('active', 'closing', 'dismissing', 'dismissing-out');
        sideMenu.classList.remove('active');
        mapView.classList.remove('active');
        if (livingIndicator) livingIndicator.classList.remove('visible', 'holding', 'progress', 'triggered');
        
        chatMessages.innerHTML = '';
        if (chatTitle) chatTitle.classList.remove('hidden');
        chatInput.disabled = false;
        chatInput.placeholder = 'Message SKYWALL...';
        chatInput.style.border = '';
        
        // Hide lock info box
        const lockInfoBox = document.getElementById('chat-lock-info');
        if (lockInfoBox) lockInfoBox.style.display = 'none';
        
        // Reset populated flag
        historyPopulated = false;
        
        // Show recommendation chips
        showRecommendationChips();
        
        // Reset user to work location during work hours (but outside enforcement time)
        window.ManhattanEnforcementPolicies.updateUserLocation(window.ManhattanEnforcementPolicies.locations.worldTradeCenter);
        window.ManhattanEnforcementPolicies.updateUserTime(11, 0); // 11:00 AM
    }
    
    // Main demo cycle
    async function runDemo() {
        while (true) {
            resetState();
            
            // 1. Boot sequence
            await wait(2500);
            bootScreen.classList.remove('active');
            homeScreen.classList.add('active');
            await wait(2000);
            
            // 2. Summon SKYWALL chat
            await summonChat();
            await wait(1000);
            
            // 3. Initial conversation
            await demonstrateInitialChat();
            await wait(1500);
            
            // 4. Open hamburger menu - show Manhattan work policy
            await demonstrateHamburgerMenu();
            await wait(2000);
            
            // 5. View the LOCKED policy - show it's view-only
            await demonstrateViewingLockedPolicy();
            await wait(1500);
            
            // 6. Try to delete (won't work - locked)
            await demonstrateTryingToDelete();
            await wait(1500);
            
            // 7. Show map with restriction & enforcement zones
            await demonstrateMap();
            await wait(1500);
            
            // 8. Close chat and return to homescreen
            await closeChat();
            await wait(3000);
            
            // Loop restarts
        }
    }
    
    // Enable demo mode in sidemenu
    function enableDemoMode() {
        if (window.SideMenuModule && window.SideMenuModule.enableTourMode) {
            window.SideMenuModule.enableTourMode();
            console.log('Demo mode enabled');
        } else {
            console.warn('SideMenuModule not available yet, will retry...');
            setTimeout(enableDemoMode, 100);
        }
    }

    // Focused mode: chat home -> hamburger with locked policy -> freeze.
    async function runLockedMenuFreezeDemo() {
        bootScreen.classList.remove('active');
        homeScreen.classList.remove('active');
        skywallChat.classList.add('active');
        skywallChat.classList.remove('closing', 'dismissing', 'dismissing-out');
        sideMenu.classList.remove('active');
        mapView.classList.remove('active');
        const controlPanel = document.getElementById('control-panel');
        if (controlPanel) controlPanel.classList.remove('active');

        // Reset to default chat home.
        chatMessages.innerHTML = '';
        if (chatTitle) chatTitle.classList.remove('hidden');
        chatInput.disabled = false;
        chatInput.placeholder = 'Message SKYWALL...';
        chatInput.style.border = '';
        chatInput.style.background = '';
        chatInput.style.opacity = '';
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.style.display = '';
            sendBtn.style.opacity = '';
            sendBtn.style.background = '';
            sendBtn.style.transform = '';
        }
        if (chatInputContainer) {
            chatInputContainer.style.pointerEvents = '';
            chatInputContainer.style.borderTopColor = '';
            chatInputContainer.style.gap = '';
        }
        const lockInfoBox = document.getElementById('chat-lock-info');
        if (lockInfoBox) lockInfoBox.style.display = 'none';
        historyPopulated = false;
        showRecommendationChips();

        // Ensure locked-state source of truth (outside both restriction + enforcement locations).
        const betweenLocation = { lat: 40.7390, lng: -73.9937, name: 'Midtown Manhattan', radius: 50 };
        window.ManhattanEnforcementPolicies.updateUserLocation(betweenLocation);
        window.ManhattanEnforcementPolicies.updateUserTime(11, 0);

        await wait(1200);

        // Open hamburger menu with locked policy item.
        populateChatHistory();
        sideMenu.classList.add('active');

        // Visually emphasize locked policy and disabled delete.
        const policyItem = document.querySelector('[data-policy-id="manhattan-work-policy"]');
        if (policyItem) {
            policyItem.style.background = 'rgba(255, 255, 255, 0.1)';
        }
        const deleteBtn = policyItem ? policyItem.querySelector('.delete-btn') : null;
        if (deleteBtn) {
            deleteBtn.style.opacity = '0.35';
            deleteBtn.style.transform = 'scale(0.9)';
            deleteBtn.style.background = '';
        }

        // Hold longer on hamburger menu so locked/deletion-disabled state is clear.
        await wait(4600);

        // Then open the policy itself to show locked read-only chat state.
        const policy = window.ManhattanEnforcementPolicies.getPolicyById('manhattan-work-policy');
        
        // Prevent background state updates from re-introducing "Message SKYWALL..." once
        // this specific locked-policy view is active.
        if (!window.__lockedPlaceholderPatchApplied && window.ChatModule?.setInputDisabled) {
            const originalSetInputDisabled = window.ChatModule.setInputDisabled.bind(window.ChatModule);
            window.ChatModule.setInputDisabled = function(disabled) {
                originalSetInputDisabled(disabled);
                if (window.__lockedPolicyViewActive) {
                    chatInput.placeholder = '';
                    if (sendBtn) {
                        sendBtn.disabled = true;
                        sendBtn.style.display = 'none';
                    }
                }
            };
            window.__lockedPlaceholderPatchApplied = true;
        }

        // Home chat keeps default placeholder until policy is opened.
        window.__lockedPolicyViewActive = false;
        if (policy) {
            window.__lockedPolicyViewActive = true;
            viewPolicyChat(policy);
        }

        // In this demo mode, force minimal locked input presentation while frozen.
        const lockInfoText = lockInfoBox?.querySelector('.lock-info-text');
        const enforceLockedUi = () => {
            chatInput.disabled = true;
            chatInput.placeholder = '';
            chatInput.value = '';
            chatInput.style.background = 'rgba(255, 255, 255, 0.06)';
            chatInput.style.opacity = '0.42';
            if (sendBtn) {
                sendBtn.disabled = true;
                sendBtn.style.display = 'none';
                sendBtn.style.opacity = '0';
            }
            if (chatInputContainer) {
                chatInputContainer.style.pointerEvents = 'none';
                chatInputContainer.style.gap = '0';
                chatInputContainer.style.borderTopColor = 'rgba(255, 255, 255, 0.08)';
            }
            if (lockInfoBox && lockInfoText && policy) {
                lockInfoText.textContent = window.ManhattanEnforcementPolicies.getEnforcementStatus(policy);
                lockInfoBox.style.display = 'flex';
            }
        };
        enforceLockedUi();
        setInterval(enforceLockedUi, 100);

        // Small hold so the locked (read-only) state is visible before freeze.
        await wait(900);

        // Freeze on locked policy view state (chat disabled + lock message visible).
        await new Promise(() => {});
    }

    // Snapshot mode: freeze on locked policy in hamburger menu (before opening chat).
    async function runLockedMenuSnapshotDemo() {
        bootScreen.classList.remove('active');
        homeScreen.classList.remove('active');
        skywallChat.classList.add('active');
        skywallChat.classList.remove('closing', 'dismissing', 'dismissing-out');
        sideMenu.classList.remove('active');
        mapView.classList.remove('active');
        const controlPanel = document.getElementById('control-panel');
        if (controlPanel) controlPanel.classList.remove('active');

        // Reset to default chat home.
        chatMessages.innerHTML = '';
        if (chatTitle) chatTitle.classList.remove('hidden');
        chatInput.disabled = false;
        chatInput.placeholder = 'Message SKYWALL...';
        chatInput.style.border = '';
        chatInput.style.background = '';
        chatInput.style.opacity = '';
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.style.display = '';
            sendBtn.style.opacity = '';
            sendBtn.style.background = '';
            sendBtn.style.transform = '';
        }
        if (chatInputContainer) {
            chatInputContainer.style.pointerEvents = '';
            chatInputContainer.style.borderTopColor = '';
            chatInputContainer.style.gap = '';
        }
        const lockInfoBox = document.getElementById('chat-lock-info');
        if (lockInfoBox) lockInfoBox.style.display = 'none';
        historyPopulated = false;
        showRecommendationChips();

        // Locked-state source of truth (outside enforcement conditions).
        const betweenLocation = { lat: 40.7390, lng: -73.9937, name: 'Midtown Manhattan', radius: 50 };
        window.ManhattanEnforcementPolicies.updateUserLocation(betweenLocation);
        window.ManhattanEnforcementPolicies.updateUserTime(11, 0);

        await wait(1200);

        // Open hamburger menu and emphasize the locked item + disabled delete.
        populateChatHistory();
        sideMenu.classList.add('active');

        const policyItem = document.querySelector('[data-policy-id="manhattan-work-policy"]');
        if (policyItem) {
            policyItem.style.background = 'rgba(255, 255, 255, 0.1)';
        }
        const deleteBtn = policyItem ? policyItem.querySelector('.delete-btn') : null;
        if (deleteBtn) {
            deleteBtn.style.opacity = '0.35';
            deleteBtn.style.transform = 'scale(0.9)';
            deleteBtn.style.background = '';
        }

        // Freeze on hamburger snapshot state.
        await new Promise(() => {});
    }
    
    // Start demo when ready
    const urlMode = new URLSearchParams(location.search).get('mode');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            enableDemoMode();
            if (urlMode === 'locked-menu-freeze') runLockedMenuFreezeDemo();
            else if (urlMode === 'locked-menu-snapshot') runLockedMenuSnapshotDemo();
            else runDemo();
        });
    } else {
        enableDemoMode();
        if (urlMode === 'locked-menu-freeze') runLockedMenuFreezeDemo();
        else if (urlMode === 'locked-menu-snapshot') runLockedMenuSnapshotDemo();
        else runDemo();
    }
})();









