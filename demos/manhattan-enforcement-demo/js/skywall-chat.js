// Skywall Chat Interface - Skywall OS Simulator

(function() {
    'use strict';

    const skywallChat = document.getElementById('skywall-chat');
    const closeChatBtn = document.getElementById('close-chat-btn'); // Old button (hidden)
    const chatTitle = document.querySelector('.chat-title');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const menuBtn = document.getElementById('menu-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const deviceSelector = document.getElementById('device-selector');
    const deviceDropdown = document.getElementById('device-dropdown');
    const livingIndicator = document.getElementById('living-indicator');

    let messages = [];
    let isInputDisabled = false;
    let hasStartedChat = false; // Track if user has sent any messages
    
    // Two-finger gesture state for dismissal
    let dismissGestureTimer = null;
    let isDismissGestureActive = false;
    let dismissGestureStartTime = 0;
    const DISMISS_HOLD_DURATION = 1000; // 1 second
    let summonHoldTimeout = null;
    let summonCleanupTimeout = null;
    let isAutoSummoning = false;
    let isAutoClosing = false;

    // Auto-resize textarea
    function autoResizeTextarea() {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    }

    // Listen for input to resize
    chatInput.addEventListener('input', autoResizeTextarea);

    // Two-finger gesture detection for chat dismissal
    function handleDismissGestureStart(e) {
        // Only process if chat is active
        if (!skywallChat.classList.contains('active')) return;
        
        // Check if exactly 2 fingers
        if (e.touches.length === 2) {
            isDismissGestureActive = true;
            dismissGestureStartTime = Date.now();
            
            // Add visual feedback class
            skywallChat.classList.add('dismissing');
            
            // Start timer
            dismissGestureTimer = setTimeout(() => {
                triggerChatDismiss();
            }, DISMISS_HOLD_DURATION);
            
            // Update progress
            updateDismissProgress();
        }
    }
    
    function handleDismissGestureMove(e) {
        if (isDismissGestureActive && e.touches.length !== 2) {
            // Lost the two-finger touch
            cancelDismissGesture();
        }
    }
    
    function handleDismissGestureEnd(e) {
        if (isDismissGestureActive) {
            cancelDismissGesture();
        }
    }
    
    function updateDismissProgress() {
        if (!isDismissGestureActive) return;
        
        const elapsed = Date.now() - dismissGestureStartTime;
        const progress = Math.min(elapsed / DISMISS_HOLD_DURATION, 1);
        
        // Update visual feedback based on progress
        skywallChat.style.setProperty('--dismiss-progress', progress);
        
        if (elapsed < DISMISS_HOLD_DURATION) {
            requestAnimationFrame(updateDismissProgress);
        }
    }
    
    function cancelDismissGesture() {
        isDismissGestureActive = false;
        
        if (dismissGestureTimer) {
            clearTimeout(dismissGestureTimer);
            dismissGestureTimer = null;
        }
        
        skywallChat.classList.remove('dismissing');
        skywallChat.style.removeProperty('--dismiss-progress');
    }

    function resetLivingIndicatorBlobs() {
        if (!livingIndicator) return;
        const blobs = livingIndicator.querySelectorAll('.blob');
        blobs.forEach(blob => {
            blob.style.opacity = '';
            blob.style.transform = '';
        });
    }

    function simulateSummonHold(duration = 600) {
        if (!livingIndicator) {
            return Promise.resolve();
        }

        livingIndicator.classList.remove('triggered');
        livingIndicator.classList.add('visible', 'holding', 'progress');

        const blobs = livingIndicator.querySelectorAll('.blob');
        blobs.forEach((blob, index) => {
            const baseOpacity = [0.7, 0.6, 0.5][index] || 0.5;
            const baseScale = [1, 0.85, 0.7][index] || 0.7;
            blob.style.opacity = String(baseOpacity + 0.25);
            blob.style.transform = `scale(${(baseScale + 0.45).toFixed(2)})`;
        });

        return new Promise(resolve => {
            if (summonHoldTimeout) {
                clearTimeout(summonHoldTimeout);
            }
            if (summonCleanupTimeout) {
                clearTimeout(summonCleanupTimeout);
            }

            summonHoldTimeout = setTimeout(() => {
                livingIndicator.classList.remove('holding', 'progress');
                livingIndicator.classList.add('triggered');
                resolve();
                summonCleanupTimeout = setTimeout(() => {
                    livingIndicator.classList.remove('triggered', 'visible');
                    resetLivingIndicatorBlobs();
                }, 900);
            }, duration);
        });
    }

    function simulateDismissHold(duration = 700) {
        if (!skywallChat.classList.contains('active')) {
            skywallChat.classList.remove('dismissing');
            skywallChat.style.removeProperty('--dismiss-progress');
            return Promise.resolve();
        }

        skywallChat.classList.add('dismissing');

        return new Promise(resolve => {
            const start = performance.now();

            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                skywallChat.style.setProperty('--dismiss-progress', progress);
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    skywallChat.classList.remove('dismissing');
                    skywallChat.style.removeProperty('--dismiss-progress');
                    resolve();
                }
            }

            requestAnimationFrame(step);
        });
    }
    
    function performChatDismiss() {
        skywallChat.classList.add('dismissing-out');
        skywallChat.classList.add('closing');

        return new Promise(resolve => {
            setTimeout(() => {
                skywallChat.classList.remove('active', 'closing', 'dismissing-out', 'dismissing');
                skywallChat.style.removeProperty('--dismiss-progress');
                
                // Show title again when chat closes
                if (chatTitle) {
                    chatTitle.classList.remove('hidden');
                }
                resolve();
            }, 900); // Match the fade-out transition duration
        });
    }

    function triggerChatDismiss() {
        isDismissGestureActive = false;
        skywallChat.classList.remove('dismissing');
        skywallChat.style.removeProperty('--dismiss-progress');
        performChatDismiss();
    }
    
    // Add event listeners for dismiss gesture
    skywallChat.addEventListener('touchstart', handleDismissGestureStart, false);
    skywallChat.addEventListener('touchmove', handleDismissGestureMove, false);
    skywallChat.addEventListener('touchend', handleDismissGestureEnd, false);
    skywallChat.addEventListener('touchcancel', handleDismissGestureEnd, false);
    
    // Desktop/mouse alternative for dismissing chat
    let mouseDismissActive = false;
    const chatContainer = document.querySelector('.chat-container');
    
    chatContainer.addEventListener('mousedown', (e) => {
        // Only if chat is active and not clicking on interactive elements
        if (!skywallChat.classList.contains('active')) return;
        if (e.target.closest('.chat-input, .send-btn, .header-btn, .device-selector, .chip')) return;
        
        mouseDismissActive = true;
        isDismissGestureActive = true;
        dismissGestureStartTime = Date.now();
        
        // Add visual feedback class
        skywallChat.classList.add('dismissing');
        
        // Start timer
        dismissGestureTimer = setTimeout(() => {
            triggerChatDismiss();
            mouseDismissActive = false;
        }, DISMISS_HOLD_DURATION);
        
        // Update progress
        updateDismissProgress();
        
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => {
        if (mouseDismissActive) {
            mouseDismissActive = false;
            cancelDismissGesture();
        }
    });

    // Old close button (if it exists)
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            skywallChat.classList.remove('active');
            if (chatTitle) {
                chatTitle.classList.remove('hidden');
            }
        });
    }

    // Open side menu
    menuBtn.addEventListener('click', () => {
        const sideMenu = document.getElementById('side-menu');
        sideMenu.classList.add('active');
    });

    // New chat
    newChatBtn.addEventListener('click', () => {
        clearMessages();
        showRecommendationChips();
        // Show title again for new chat
        if (chatTitle) {
            chatTitle.classList.remove('hidden');
        }
    });

    // Device selector dropdown
    deviceSelector.addEventListener('click', () => {
        const rect = deviceSelector.getBoundingClientRect();
        deviceDropdown.style.top = `${rect.bottom + 5}px`;
        deviceDropdown.style.left = `${rect.left}px`;
        deviceDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!deviceSelector.contains(e.target) && !deviceDropdown.contains(e.target)) {
            deviceDropdown.classList.remove('active');
        }
    });

    // Remove recommendation chips
    function removeRecommendationChips() {
        const chips = document.querySelectorAll('.recommendation-chips');
        chips.forEach(chip => {
            chip.classList.add('hiding');
            setTimeout(() => {
                if (chip.parentNode) {
                    chip.remove();
                }
            }, 300);
        });
    }

    // Send message
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || isInputDisabled) return;

        // Mark that chat has started
        hasStartedChat = true;

        // Hide title when first message is sent
        if (messages.length === 0 && chatTitle) {
            chatTitle.classList.add('hidden');
        }

        // Remove recommendation chips immediately
        removeRecommendationChips();

        // Add user message
        addMessage('user', text);
        chatInput.value = '';
        
        // Reset textarea height to minimum (force reflow)
        chatInput.style.height = 'auto';
        chatInput.style.height = '44px';

        // Simulate AI response (for demo)
        setTimeout(() => {
            const response = generateMockResponse(text);
            addMessage('assistant', response);
        }, 1000);
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Add message to chat
    function addMessage(role, text) {
        messages.push({ role, text });

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Clear messages
    function clearMessages() {
        messages = [];
        hasStartedChat = false; // Reset chat started flag
        chatMessages.innerHTML = '';
        // Show title again when clearing
        if (chatTitle) {
            chatTitle.classList.remove('hidden');
        }
    }

    // Show recommendation chips
    function showRecommendationChips() {
        // Don't show if chat has already started
        if (hasStartedChat) return;

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
            chip.addEventListener('click', () => {
                // Mark chat as started
                hasStartedChat = true;
                // Hide title when chip is clicked
                if (chatTitle) {
                    chatTitle.classList.add('hidden');
                }
                // Remove chips immediately
                removeRecommendationChips();
                // Set input and send
                chatInput.value = suggestion;
                sendMessage();
            });
            chipsContainer.appendChild(chip);
        });

        chatMessages.appendChild(chipsContainer);
    }

    // Mock AI response generator
    function generateMockResponse(userMessage) {
        const lower = userMessage.toLowerCase();

        if (lower.includes('block') || lower.includes('restrict')) {
            return "I can help you set up a blocking policy. Which apps would you like to block, and where should this policy apply?";
        } else if (lower.includes('limit') || lower.includes('screen time')) {
            return "I'll help you create a screen time limit. Which apps do you want to limit, and how many hours per day should be allowed?";
        } else if (lower.includes('bedtime') || lower.includes('sleep')) {
            return "Setting up a bedtime restriction is a great idea. What time should apps be blocked, and which apps should this apply to?";
        } else if (lower.includes('school')) {
            return "To create a school-time policy, I'll need to know which apps to block and the location of the school. Would you like to pick the location on a map?";
        } else {
            return "I can help you create custom policies to manage app usage. Tell me what you'd like to control and I'll guide you through it.";
        }
    }

    // Set input disabled state (for enforcement conditions simulation)
    window.ChatModule = {
        setInputDisabled: function(disabled) {
            isInputDisabled = disabled;
            chatInput.disabled = disabled;
            sendBtn.disabled = disabled;
            if (disabled) {
                chatInput.placeholder = "Chat disabled - not at enforcement location";
            } else {
                chatInput.placeholder = "Message SKYWALL...";
            }
        },
        open: async function() {
            if (skywallChat.classList.contains('active') || isAutoSummoning) {
                return;
            }
            isAutoSummoning = true;
            try {
                skywallChat.classList.remove('closing', 'dismissing', 'dismissing-out');
                skywallChat.style.removeProperty('--dismiss-progress');
                if (chatTitle) {
                    chatTitle.classList.remove('hidden');
                }
                await simulateSummonHold(650);
                skywallChat.classList.add('active');
            } finally {
                isAutoSummoning = false;
            }
        },
        close: async function() {
            if (!skywallChat.classList.contains('active') || isAutoClosing) {
                return;
            }
            isAutoClosing = true;
            try {
                await simulateDismissHold(750);
                await performChatDismiss();
            } finally {
                isAutoClosing = false;
            }
        }
    };

    // Initialize with recommendation chips
    showRecommendationChips();
})();

