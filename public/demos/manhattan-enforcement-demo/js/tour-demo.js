// Tour Demo - Automated SKYWALL OS Tour
// Fully automated demonstration showing all features

(function() {
    'use strict';

    const bootScreen = document.getElementById('boot-screen');
    const homeScreen = document.getElementById('home-screen');
    const skywallChat = document.getElementById('skywall-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatTitle = document.querySelector('.chat-title');
    const chatInput = document.getElementById('chat-input');
    const controlPanel = document.getElementById('control-panel');
    const sideMenu = document.getElementById('side-menu');
    const mapView = document.getElementById('map-view');
    const settingsScreen = document.getElementById('settings-screen');
    const livingIndicator = document.getElementById('living-indicator');
    const appPages = document.getElementById('app-pages');
    const deviceSelector = document.getElementById('device-selector');
    const chatHistory = document.getElementById('chat-history');
    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Simulate scrolling on homescreen
    async function demonstrateScrolling() {
        // Scroll right to page 2
        appPages.style.transition = 'transform 0.3s ease';
        appPages.style.transform = 'translateX(-100%)';
        
        // Update page indicators
        document.querySelectorAll('.page-indicators .dot').forEach((dot, i) => {
            if (i === 1) dot.classList.add('active');
            else dot.classList.remove('active');
        });
        
        await wait(1500);
        
        // Scroll back to page 1
        appPages.style.transform = 'translateX(0)';
        
        // Update page indicators
        document.querySelectorAll('.page-indicators .dot').forEach((dot, i) => {
            if (i === 0) dot.classList.add('active');
            else dot.classList.remove('active');
        });
        
        await wait(1500);
    }
    
    // Pull down control panel
    async function demonstrateControlPanel() {
        controlPanel.classList.add('active');
        await wait(2000);
        controlPanel.classList.remove('active');
        await wait(500);
    }
    
    // Summon SKYWALL chat
    async function summonChat() {
        if (window.ChatModule && window.ChatModule.open) {
            await window.ChatModule.open();
        }
        await wait(1000);
    }
    
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
    
    // Initial chat conversation
    async function demonstrateInitialChat() {
        await typeUserMessage('Hi!');
        await wait(800);
        await addAIMessage("Hi! I'm the rational AI version of yourself, here to protect you from you. What can I do for you?");
        await wait(2000);
        await typeUserMessage('What can you help me with?');
        await wait(800);
        await addAIMessage("I manage your digital wellness through smart restrictions. I can block apps at specific locations, set time limits, and help you stay focused. You already have 3 active policies protecting your productivity. Want to see them?");
        await wait(3000);
    }
    
    // Open hamburger menu and show chat history
    async function demonstrateHamburgerMenu() {
        // Populate chat history BEFORE opening menu (will skip if already done)
        populateChatHistory();
        
        await wait(300);
        
        // Now open the menu
        sideMenu.classList.add('active');
        
        await wait(2000);
    }
    
    // Track if history has been populated to avoid re-populating unnecessarily
    let historyPopulated = false;
    
    // Populate chat history with 3 policies (only once unless force is true)
    function populateChatHistory(force = false) {
        if (!chatHistory) {
            console.error('Chat history element not found');
            return;
        }
        
        if (!window.TourPolicies || !window.TourPolicies.policies) {
            console.error('Tour policies not available');
            return;
        }
        
        // Skip if already populated and not forced
        if (historyPopulated && !force) {
            console.log('Chat history already populated, skipping');
            return;
        }
        
        // Only clear if we're forcing a re-populate or first time
        if (force || !historyPopulated) {
            chatHistory.innerHTML = '';
        }
        
        console.log('Populating chat history with', window.TourPolicies.policies.length, 'policies');
        
        window.TourPolicies.policies.forEach((policy, index) => {
            if (!policy) {
                console.error('Policy at index', index, 'is null or undefined');
                return;
            }
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-history-item';
            chatItem.dataset.policyId = policy.id;
            
            // Check if can edit
            const canEdit = window.TourPolicies.canEditPolicy(policy);
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
        const canEdit = window.TourPolicies.canEditPolicy(policy);
        const lockInfoBox = document.getElementById('chat-lock-info');
        const lockInfoText = lockInfoBox?.querySelector('.lock-info-text');
        
        chatInput.disabled = !canEdit;
        
        if (canEdit) {
            chatInput.placeholder = 'Message SKYWALL...';
            if (lockInfoBox) lockInfoBox.style.display = 'none';
        } else {
            chatInput.placeholder = '';
            if (lockInfoBox && lockInfoText) {
                lockInfoText.textContent = `Locked - Must be at ${policy.enforcementZone.name} (${policy.enforcementTime.start}:00-${policy.enforcementTime.end}:00) to edit`;
                lockInfoBox.style.display = 'flex';
            }
        }
    }
    
    // Export viewPolicyChat for use by map
    window.TourDemo = {
        viewPolicyChat: viewPolicyChat
    };
    
    // Delete policy (only if enforcement conditions met)
    function deletePolicy(policyId, chatItem) {
        chatItem.classList.add('deleting');
        setTimeout(() => {
            chatItem.remove();
        }, 300);
    }
    
    // Demonstrate viewing locked policy (Policy 2)
    async function demonstrateViewingLockedPolicy() {
        const policy = window.TourPolicies.getPolicyById('policy-2');
        
        if (!policy) {
            console.error('Policy 2 not found');
            return;
        }
        
        // Highlight Policy 2 in list
        const chatItem = document.querySelector(`[data-policy-id="${policy.id}"]`);
        if (chatItem) {
            chatItem.style.background = 'rgba(255, 255, 255, 0.1)';
        }
        await wait(800);
        
        // View the locked policy
        viewPolicyChat(policy);
        await wait(2000);
        
        // Scroll through conversation briefly
        chatMessages.scrollTop = 0;
        await wait(800);
        
        for (let i = 0; i < chatMessages.scrollHeight / 2; i += 20) {
            chatMessages.scrollTop = i;
            await wait(30);
        }
        
        await wait(1500);
        
        // Show that input is DISABLED
        chatInput.style.border = '2px solid rgba(255, 0, 0, 0.3)';
        await wait(1000);
        chatInput.style.border = '';
        
        await wait(1000);
    }
    
    // Demonstrate clicking into Policy 1 (editable)
    async function demonstrateViewingEditablePolicy() {
        // Go back to menu first
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) menuBtn.click();
        
        sideMenu.classList.add('active');
        await wait(800);
        
        const policy = window.TourPolicies.getPolicyById('policy-1');
        
        if (!policy) {
            console.error('Policy 1 not found');
            return;
        }
        
        const chatItem = document.querySelector(`[data-policy-id="${policy.id}"]`);
        
        // Highlight it
        if (chatItem) {
            chatItem.style.background = 'rgba(255, 255, 255, 0.1)';
        }
        await wait(800);
        
        // Click it
        viewPolicyChat(policy);
        await wait(2000);
        
        // Scroll through conversation
        chatMessages.scrollTop = 0;
        await wait(1000);
        
        for (let i = 0; i < chatMessages.scrollHeight; i += 20) {
            chatMessages.scrollTop = i;
            await wait(30);
        }
        
        await wait(1500);
        
        // Show that input is ENABLED (can edit)
        chatInput.style.border = '2px solid rgba(0, 255, 0, 0.3)';
        chatInput.focus();
        await wait(1200);
        chatInput.blur();
        chatInput.style.border = '';
        
        await wait(1000);
    }
    
    // Demonstrate swipe to delete (only works for Policy 1)
    async function demonstrateSwipeDelete() {
        // Go back to side menu
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) menuBtn.click();
        
        sideMenu.classList.add('active');
        
        await wait(1000);
        
        const policy1Item = document.querySelector(`[data-policy-id="policy-1"]`);
        const policy2Item = document.querySelector(`[data-policy-id="policy-2"]`);
        
        // Try to delete Policy 2 (locked - won't work)
        if (policy2Item) {
            const deleteBtn2 = policy2Item.querySelector('.delete-btn');
            // Highlight the disabled delete button
            if (deleteBtn2) {
                deleteBtn2.style.transform = 'scale(1.2)';
                await wait(600);
                deleteBtn2.style.transform = '';
            }
            await wait(1000);
        }
        
        // Delete Policy 1 (unlocked - works)
        if (policy1Item) {
            const deleteBtn1 = policy1Item.querySelector('.delete-btn');
            if (deleteBtn1) {
                // Highlight the enabled delete button
                deleteBtn1.style.transform = 'scale(1.2)';
                await wait(600);
                deleteBtn1.style.transform = '';
                await wait(400);
                
                // Click to delete
                deletePolicy('policy-1', policy1Item);
            }
            
            await wait(1500);
        }
        
        await wait(1000);
    }
    
    // Show map button
    async function demonstrateMapButton() {
        const mapBtn = document.getElementById('map-btn');
        mapBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        await wait(500);
        mapBtn.style.background = '';
        await wait(300);
    }
    
    // Show map with pins
    async function demonstrateMap() {
        // Close side menu
        sideMenu.classList.remove('active');
        
        // Open map
        mapView.classList.add('active');
        await wait(500);
        
        // Initialize map with policies (shows overview with all pins)
        if (window.MapModule && window.MapModule.initTourMap) {
            window.MapModule.initTourMap(window.TourPolicies);
        }
        
        // Show pan-out view with all pins for 8 seconds
        await wait(8000);
        
        // Pan in to Brooklyn Bridge to show user location
        if (window.MapModule && window.MapModule.panToBrooklynBridge) {
            window.MapModule.panToBrooklynBridge();
        }
        
        // Wait for pan animation (2s) + show close-up for 10 seconds
        await wait(2000); // Pan animation
        await wait(10000); // Close-up view of Brooklyn Bridge
        
        // Close map
        mapView.classList.remove('active');
        await wait(500);
    }
    
    // Show settings button
    async function demonstrateSettingsButton() {
        // Reopen side menu
        sideMenu.classList.add('active');
        await wait(500);
        
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        await wait(500);
        settingsBtn.style.background = '';
        await wait(1000);
        
        // Close side menu
        sideMenu.classList.remove('active');
        await wait(500);
    }
    
    // Close chat
    async function closeChat() {
        if (window.ChatModule && window.ChatModule.close) {
            await window.ChatModule.close();
        }
        await wait(1000);
    }
    
    // Reset for loop
    function resetState() {
        bootScreen.classList.add('active');
        homeScreen.classList.remove('active');
        skywallChat.classList.remove('active', 'closing', 'dismissing', 'dismissing-out');
        controlPanel.classList.remove('active');
        sideMenu.classList.remove('active');
        mapView.classList.remove('active');
        settingsScreen.classList.remove('active');
        if (livingIndicator) livingIndicator.classList.remove('visible', 'holding', 'progress', 'triggered');
        
        chatMessages.innerHTML = '';
        if (chatTitle) chatTitle.classList.remove('hidden');
        chatInput.disabled = false;
        chatInput.placeholder = 'Message SKYWALL...';
        chatInput.style.border = '';
        
        // Hide lock info box
        const lockInfoBox = document.getElementById('chat-lock-info');
        if (lockInfoBox) lockInfoBox.style.display = 'none';
        
        appPages.style.transform = 'translateX(0)';
        
        // Reset populated flag and re-populate for new loop
        historyPopulated = false;
        populateChatHistory();
        
        // Show recommendation chips
        showRecommendationChips();
    }
    
    // Show recommendation chips
    function showRecommendationChips() {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'recommendation-chips';
        
        const suggestions = [
            'Block social media at school',
            'Limit screen time for gaming',
            'Set bedtime restrictions'
        ];
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = suggestion;
            chipsContainer.appendChild(chip);
        });
        
        chatMessages.appendChild(chipsContainer);
    }
    
    // Main tour cycle
    async function runTour() {
        while (true) {
            resetState();
            
            // 1. Boot sequence
            await wait(2500);
            bootScreen.classList.remove('active');
            homeScreen.classList.add('active');
            await wait(2000);
            
            // 2. Scroll around homescreen
            await demonstrateScrolling();
            await wait(1000);
            
            // 3. Pull down control panel
            await demonstrateControlPanel();
            await wait(1000);
            
            // 4. Summon SKYWALL chat
            await summonChat();
            await wait(1000);
            
            // 5. Initial conversation
            await demonstrateInitialChat();
            await wait(1500);
            
            // 6. Open hamburger menu - show 3 policies
            await demonstrateHamburgerMenu();
            await wait(2000);
            
            // 7. View a LOCKED policy (Policy 2) - show it's view-only
            await demonstrateViewingLockedPolicy();
            await wait(1500);
            
            // 8. View an EDITABLE policy (Policy 1) - show input is enabled
            await demonstrateViewingEditablePolicy();
            await wait(1500);
            
            // 9. Demonstrate delete attempts (locked vs unlocked)
            await demonstrateSwipeDelete();
            await wait(1500);
            
            // 10. Show map button
            await demonstrateMapButton();
            await wait(800);
            
            // 11. Show map with all pins
            await demonstrateMap();
            await wait(1500);
            
            // 12. Show settings button
            await demonstrateSettingsButton();
            await wait(1000);
            
            // 13. Close chat and return to homescreen
            await closeChat();
            await wait(3000);
            
            // Loop restarts
        }
    }
    
    // Enable tour mode in sidemenu to prevent it from clearing chat history
    function enableTourMode() {
        if (window.SideMenuModule && window.SideMenuModule.enableTourMode) {
            window.SideMenuModule.enableTourMode();
            console.log('Tour mode enabled - sidemenu will not interfere');
        } else {
            console.warn('SideMenuModule not available yet, will retry...');
            setTimeout(enableTourMode, 100);
        }
    }
    
    // Start tour when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            enableTourMode();
            runTour();
        });
    } else {
        enableTourMode();
        runTour();
    }
})();

