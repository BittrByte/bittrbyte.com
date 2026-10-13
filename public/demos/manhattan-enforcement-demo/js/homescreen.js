// Home Screen - Skywall OS Simulator

(function() {
    'use strict';

    const appPages = document.getElementById('app-pages');
    const appGrid1 = document.getElementById('app-grid-1');
    const appGrid2 = document.getElementById('app-grid-2');
    const pageIndicators = document.querySelectorAll('.page-indicators .dot');
    const skywallChat = document.getElementById('skywall-chat');
    const statusTime = document.querySelector('.status-bar .time');
    const livingIndicator = document.getElementById('living-indicator');
    const homeScreen = document.getElementById('home-screen');

    let currentPage = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Two-finger gesture state
    let gestureTimer = null;
    let isGestureActive = false;
    let gestureStartTime = 0;
    let showBlobTimer = null;
    const GESTURE_HOLD_DURATION = 1000; // 1 second
    const BLOB_SHOW_DELAY = 200; // Show blob after 200ms of holding

    // App definitions using professional high-quality icons
    const apps = [
        // Page 1 - Social & Entertainment
        { name: 'Instagram', iconSrc: 'assets/icons/instagram.png', package: 'com.instagram.android', page: 1 },
        { name: 'Facebook', iconSrc: 'assets/icons/facebook.png', package: 'com.facebook.katana', page: 1, fullBleed: true },
        { name: 'X', iconSrc: 'assets/icons/x.png', package: 'com.twitter.android', page: 1 },
        { name: 'YouTube', iconSrc: 'assets/icons/youtube.png', package: 'com.google.android.youtube', page: 1 },
        { name: 'Google', iconSrc: 'assets/icons/google.svg', package: 'com.google.android.googlequicksearchbox', page: 1 },
        { name: 'WhatsApp', iconSrc: 'assets/icons/whatsapp.svg', package: 'com.whatsapp', page: 1 },
        { name: 'WeChat', iconSrc: 'assets/icons/wechat.png', package: 'com.tencent.mm', page: 1 },
        { name: 'Alipay', iconSrc: 'assets/icons/alipay.png', package: 'com.eg.android.AlipayGphone', page: 1 },
        { name: 'Phone', iconSrc: 'assets/icons/phone.svg', package: 'com.android.dialer', page: 1 },
        { name: 'Messages', iconSrc: 'assets/icons/messages.svg', package: 'com.android.messaging', page: 1 },
        { name: 'Camera', iconSrc: 'assets/icons/camera.svg', package: 'com.android.camera', page: 1 },
        { name: 'Just Eat', iconSrc: 'assets/icons/justeat.png', package: 'com.justeat.app.uk', page: 1 },
        // Page 2 - Utilities
        { name: 'Photos', iconSrc: 'assets/icons/photos.svg', package: 'com.google.android.apps.photos', page: 2 },
        { name: 'Settings', iconSrc: 'assets/icons/settings.svg', package: 'com.android.settings', page: 2 },
        { name: 'Browser', iconSrc: 'assets/icons/browser.svg', package: 'com.android.browser', page: 2 },
        { name: 'Clock', iconSrc: 'assets/icons/clock.svg', package: 'com.android.deskclock', page: 2 },
        { name: 'Calculator', iconSrc: 'assets/icons/calculator.svg', package: 'com.android.calculator2', page: 2 },
        { name: 'Calendar', iconSrc: 'assets/icons/calendar.svg', package: 'com.android.calendar', page: 2 },
        { name: 'Maps', iconSrc: 'assets/icons/maps.svg', package: 'com.android.maps', page: 2 },
        { name: 'Music', iconSrc: 'assets/icons/music.svg', package: 'com.android.music', page: 2 },
        { name: 'Files', iconSrc: 'assets/icons/files.svg', package: 'com.android.documentsui', page: 2 }
    ];

    // Create app icons
    function createAppIcon(app) {
        const appIcon = document.createElement('div');
        appIcon.className = 'app-icon';
        appIcon.dataset.package = app.package;

        const iconImg = document.createElement('div');
        iconImg.className = 'app-icon-img';
        if (app.fullBleed) {
            iconImg.classList.add('full-bleed');
        }

        if (app.iconSrc) {
            const img = document.createElement('img');
            img.src = app.iconSrc;
            img.alt = `${app.name} icon`;
            img.loading = 'lazy';
            iconImg.appendChild(img);
        } else if (app.iconSvg) {
            iconImg.innerHTML = app.iconSvg;
        }

        const label = document.createElement('div');
        label.className = 'app-icon-label';
        label.textContent = app.name;

        appIcon.appendChild(iconImg);
        appIcon.appendChild(label);

        appIcon.addEventListener('click', () => {
            handleAppClick(app);
        });

        return appIcon;
    }

    // Populate app grids
    function populateApps() {
        apps.forEach(app => {
            const appIcon = createAppIcon(app);
            if (app.page === 1) {
                appGrid1.appendChild(appIcon);
            } else {
                appGrid2.appendChild(appIcon);
            }
        });
    }

    // Handle app click
    function handleAppClick(app) {
        console.log('App clicked:', app.name);
        // Check if app is locked by enforcement engine
        if (window.SkywallState && window.SkywallState.isAppBlocked(app.package)) {
            showBlockedMessage(app.name);
        } else {
            // For demo, just log
            console.log('Opening app:', app.name);
        }
    }

    // Show blocked app message
    function showBlockedMessage(appName) {
        alert(`${appName} is blocked by your Skywall policy.`);
    }

    // Page swipe handling
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        touchEndX = e.touches[0].clientX;
    }

    function handleTouchEnd() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentPage < 1) {
                // Swipe left - next page
                changePage(1);
            } else if (diff < 0 && currentPage > 0) {
                // Swipe right - previous page
                changePage(0);
            }
        }
    }

    function changePage(page) {
        currentPage = page;
        const offset = -currentPage * 100;
        appPages.style.transform = `translateX(${offset}%)`;
        
        pageIndicators.forEach((dot, index) => {
            if (index === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Two-finger gesture detection for chat summon
    function handleGestureStart(e) {
        // Check if exactly 2 fingers anywhere on homescreen
        if (e.touches.length === 2) {
            isGestureActive = true;
            gestureStartTime = Date.now();
            
            // Delay showing the blob
            showBlobTimer = setTimeout(() => {
                if (isGestureActive && livingIndicator) {
                    livingIndicator.classList.add('visible', 'holding', 'progress');
                }
            }, BLOB_SHOW_DELAY);
            
            // Start timer
            gestureTimer = setTimeout(() => {
                triggerChatOpen();
            }, GESTURE_HOLD_DURATION);
            
            // Update progress
            requestAnimationFrame(updateGestureProgress);
        }
    }
    
    function handleGestureMove(e) {
        if (isGestureActive && e.touches.length !== 2) {
            // Lost the two-finger touch
            cancelGesture();
        }
    }
    
    function handleGestureEnd(e) {
        if (isGestureActive) {
            cancelGesture();
        }
    }
    
    function updateGestureProgress() {
        if (!isGestureActive) return;
        
        const elapsed = Date.now() - gestureStartTime;
        const progress = Math.min(elapsed / GESTURE_HOLD_DURATION, 1);
        
        // Update blob intensity based on progress
        if (livingIndicator) {
            const blobs = livingIndicator.querySelectorAll('.blob');
            blobs.forEach((blob, index) => {
                const baseOpacity = [0.6, 0.5, 0.4][index];
                const opacity = baseOpacity + (progress * 0.4);
                const scale = 1 + (progress * 0.5);
                blob.style.opacity = opacity;
                blob.style.transform = `scale(${scale})`;
            });
        }
        
        if (elapsed < GESTURE_HOLD_DURATION) {
            requestAnimationFrame(updateGestureProgress);
        }
    }
    
    function cancelGesture() {
        isGestureActive = false;
        
        if (gestureTimer) {
            clearTimeout(gestureTimer);
            gestureTimer = null;
        }
        
        if (showBlobTimer) {
            clearTimeout(showBlobTimer);
            showBlobTimer = null;
        }
        
        if (livingIndicator) {
            livingIndicator.classList.remove('visible', 'holding', 'progress');
            
            // Reset blob styles
            const blobs = livingIndicator.querySelectorAll('.blob');
            blobs.forEach(blob => {
                blob.style.opacity = '';
                blob.style.transform = '';
            });
        }
    }
    
    function triggerChatOpen() {
        isGestureActive = false;
        
        // Trigger animation
        if (livingIndicator) {
            livingIndicator.classList.remove('holding', 'progress');
            livingIndicator.classList.add('triggered');
            
            // Reset after animation
            setTimeout(() => {
                livingIndicator.classList.remove('triggered', 'visible');
                
                // Reset blob styles
                const blobs = livingIndicator.querySelectorAll('.blob');
                blobs.forEach(blob => {
                    blob.style.opacity = '';
                    blob.style.transform = '';
                });
            }, 400);
        }
        
        // Open chat
        skywallChat.classList.add('active');
    }

    // Update time
    function updateTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        statusTime.textContent = `${hours}:${minutes}`;
    }

    // Initialize
    function init() {
        populateApps();
        updateTime();
        setInterval(updateTime, 60000); // Update every minute

        // Add touch listeners for swipe
        const appPagesWrapper = document.querySelector('.app-pages-wrapper');
        appPagesWrapper.addEventListener('touchstart', handleTouchStart, false);
        appPagesWrapper.addEventListener('touchmove', handleTouchMove, false);
        appPagesWrapper.addEventListener('touchend', handleTouchEnd, false);

        // Mouse swipe for desktop testing
        let mouseDown = false;
        appPagesWrapper.addEventListener('mousedown', (e) => {
            mouseDown = true;
            touchStartX = e.clientX;
        });
        appPagesWrapper.addEventListener('mousemove', (e) => {
            if (mouseDown) {
                touchEndX = e.clientX;
            }
        });
        appPagesWrapper.addEventListener('mouseup', () => {
            if (mouseDown) {
                handleTouchEnd();
                mouseDown = false;
            }
        });
        
        // Two-finger gesture listeners
        homeScreen.addEventListener('touchstart', handleGestureStart, false);
        homeScreen.addEventListener('touchmove', handleGestureMove, false);
        homeScreen.addEventListener('touchend', handleGestureEnd, false);
        homeScreen.addEventListener('touchcancel', handleGestureEnd, false);
        
        // Desktop/mouse alternative for testing
        let mouseHoldActive = false;
        homeScreen.addEventListener('mousedown', (e) => {
            // Don't trigger if clicking on apps or interactive elements
            if (e.target.closest('.app-icon, .page-indicators')) return;
            
            mouseHoldActive = true;
            isGestureActive = true;
            gestureStartTime = Date.now();
            
            // Delay showing the blob
            showBlobTimer = setTimeout(() => {
                if (isGestureActive) {
                    livingIndicator.classList.add('visible', 'holding', 'progress');
                }
            }, BLOB_SHOW_DELAY);
            
            // Start timer
            gestureTimer = setTimeout(() => {
                triggerChatOpen();
                mouseHoldActive = false;
            }, GESTURE_HOLD_DURATION);
            
            // Update progress
            requestAnimationFrame(updateGestureProgress);
            
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', () => {
            if (mouseHoldActive) {
                mouseHoldActive = false;
                cancelGesture();
            }
        });
    }

    // Export for other modules
    window.HomescreenModule = {
        updateAppLockState: function(packageName, isLocked) {
            const appIcon = document.querySelector(`[data-package="${packageName}"]`);
            if (appIcon) {
                if (isLocked) {
                    appIcon.classList.add('locked');
                } else {
                    appIcon.classList.remove('locked');
                }
            }
        },
        goToPage: function(page) {
            changePage(page);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

