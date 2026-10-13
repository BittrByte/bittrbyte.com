// Enforcement Engine - Skywall OS Simulator

(function() {
    'use strict';

    // This module handles visual enforcement of policies
    // It works with SkywallState to determine what should be blocked

    const EnforcementEngine = {
        // Initialize enforcement monitoring
        init: function() {
            // Monitor location changes
            this.startLocationMonitoring();
            
            // Monitor time changes
            this.startTimeMonitoring();

            // Initial evaluation
            this.evaluateAll();
        },

        // Evaluate all policies and update UI
        evaluateAll: function() {
            if (!window.SkywallState) return;
            window.SkywallState.evaluateEnforcement();
        },

        // Start location monitoring (simulated for Phase 1)
        startLocationMonitoring: function() {
            // In Phase 2, this will respond to blue dot movement
            // For now, just evaluate every 5 seconds
            setInterval(() => {
                this.evaluateAll();
            }, 5000);
        },

        // Start time monitoring
        startTimeMonitoring: function() {
            // Update current time and re-evaluate every minute
            setInterval(() => {
                if (window.SkywallState) {
                    window.SkywallState.currentTime = new Date();
                    this.evaluateAll();
                }
            }, 60000);
        },

        // Show blocked app message
        showBlockedMessage: function(appName, reason) {
            const message = `${appName} is blocked.\n\nReason: ${reason}`;
            alert(message);
        },

        // Get block reason for an app
        getBlockReason: function(packageName) {
            if (!window.SkywallState) return null;

            for (const policy of window.SkywallState.policies) {
                if (policy.targets.packages.includes(packageName)) {
                    const isTimeActive = window.SkywallState.checkTimeWindow(policy.timeWindows);
                    const isLocationActive = window.SkywallState.checkLocation(policy.restrictionZones);

                    if (isTimeActive && isLocationActive) {
                        let reason = policy.name;
                        if (policy.timeWindows && policy.timeWindows.length > 0) {
                            const tw = policy.timeWindows[0];
                            reason += ` (${tw.startTime}-${tw.endTime})`;
                        }
                        if (policy.restrictionZones && policy.restrictionZones.length > 0) {
                            reason += ` at ${policy.restrictionZones[0].label}`;
                        }
                        return reason;
                    }
                }
            }

            return null;
        }
    };

    // Export to window
    window.EnforcementEngine = EnforcementEngine;

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            EnforcementEngine.init();
        });
    } else {
        EnforcementEngine.init();
    }
})();


