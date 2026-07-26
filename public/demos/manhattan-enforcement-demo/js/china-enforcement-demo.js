// China Enforcement Demo - Automated demonstration of location-based policy enforcement
// Shows that users CANNOT edit policies unless at enforcement location & time

(function() {
    'use strict';

    const bootScreen = document.getElementById('boot-screen');
    const homeScreen = document.getElementById('home-screen');
    const skywallChat = document.getElementById('skywall-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatTitle = document.querySelector('.chat-title');
    const chatInput = document.getElementById('chat-input');
    const sideMenu = document.getElementById('side-menu');
    const mapView = document.getElementById('map-view');
    const livingIndicator = document.getElementById('living-indicator');
    const chatHistory = document.getElementById('chat-history');
    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Populate chat history with China payment policy
    let historyPopulated = false;
    
    function populateChatHistory(force = false) {
        if (!chatHistory) {
            console.error('Chat history element not found');
            return;
        }
        
        if (!window.ChinaEnforcementPolicies || !window.ChinaEnforcementPolicies.policies) {
            console.error('China enforcement policies not available');
            return;
        }
        
        if (historyPopulated && !force) {
            console.log('Chat history already populated, skipping');
            return;
        }
        
        if (force || !historyPopulated) {
            chatHistory.innerHTML = '';
        }
        
        console.log('Populating chat history with', window.ChinaEnforcementPolicies.policies.length, 'policies');
        
        window.ChinaEnforcementPolicies.policies.forEach((policy, index) => {
            if (!policy) {
                console.error('Policy at index', index, 'is null or undefined');
                return;
            }
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-history-item';
            chatItem.dataset.policyId = policy.id;
            
            // Check if can edit - this will be FALSE at start of demo
            const canEdit = window.ChinaEnforcementPolicies.canEditPolicy(policy);
            if (!canEdit) {
                chatItem.classList.add('locked');
            }
            
            const lockIcon = !canEdit ? `
                <svg class="lock-icon-svg" viewBox="0 0 24 24" width="14" height="14">
                    <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
            ` : '';
            
            // Format restriction zones list
            const restrictionZonesList = policy.restrictionZones.map(z => z.name.split('(')[0].trim()).join(', ');
            
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
        const canEdit = window.ChinaEnforcementPolicies.canEditPolicy(policy);
        const lockInfoBox = document.getElementById('chat-lock-info');
        const lockInfoText = lockInfoBox?.querySelector('.lock-info-text');
        
        chatInput.disabled = !canEdit;
        
        if (canEdit) {
            chatInput.placeholder = 'Message SKYWALL...';
            if (lockInfoBox) lockInfoBox.style.display = 'none';
        } else {
            chatInput.placeholder = '';
            if (lockInfoBox && lockInfoText) {
                lockInfoText.textContent = window.ChinaEnforcementPolicies.getEnforcementStatus(policy);
                lockInfoBox.style.display = 'flex';
            }
        }
    }
    
    // Export for use by other modules
    window.ChinaEnforcementDemo = {
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
        await addAIMessage("Hi! I'm the rational AI version of yourself, here to protect you from you. You have 1 active policy protecting you from digital distractions.");
        await wait(2500);
        await typeUserMessage('Show me my policies');
        await wait(800);
        await addAIMessage("Sure! Let me open your policy list. You can view them in the menu.");
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
        const policy = window.ChinaEnforcementPolicies.getPolicyById('china-payment-restriction');
        
        if (!policy) {
            console.error('China payment policy not found');
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
        
        const policyItem = document.querySelector(`[data-policy-id="china-payment-restriction"]`);
        
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
    
    // Show map with all zones
    async function demonstrateMap() {
        // Close side menu
        sideMenu.classList.remove('active');
        
        // Open map
        mapView.classList.add('active');
        await wait(500);
        
        // Initialize map with China enforcement policies
        if (window.MapModule && window.MapModule.initChinaEnforcementMap) {
            window.MapModule.initChinaEnforcementMap(window.ChinaEnforcementPolicies);
        }
        
        // Show pan-out view with all pins for 10 seconds
        await wait(10000);
        
        // Pan to user's current location (KFC Dongmen)
        if (window.MapModule && window.MapModule.panToKFCDongmen) {
            window.MapModule.panToKFCDongmen();
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
        
        // Reset user to NOT at enforcement location
        window.ChinaEnforcementPolicies.updateUserLocation(window.ChinaEnforcementPolicies.locations.kfcDongmen);
        window.ChinaEnforcementPolicies.updateUserTime(14, 30); // 2:30 PM
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
            
            // 4. Open hamburger menu - show China payment policy
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
    
    // Start demo when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            enableDemoMode();
            runDemo();
        });
    } else {
        enableDemoMode();
        runDemo();
    }
})();

