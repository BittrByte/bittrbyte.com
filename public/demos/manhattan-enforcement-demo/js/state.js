// Global State - Skywall OS Simulator

(function() {
    'use strict';

    // Global state object
    const SkywallState = {
        // Current simulated location
        currentLocation: {
            lat: 40.7589,
            lng: -73.9851
        },

        // Current simulated time
        currentTime: new Date(),

        // Active policies (empty - user will create policies)
        policies: [],

        // Check if app is blocked
        isAppBlocked: function(packageName) {
            for (const policy of this.policies) {
                if (policy.targets.packages.includes(packageName)) {
                    // Check time windows
                    const isTimeActive = this.checkTimeWindow(policy.timeWindows);
                    
                    // Check location
                    const isLocationActive = this.checkLocation(policy.restrictionZones);

                    // If both conditions met, app is blocked
                    if (isTimeActive && isLocationActive) {
                        return true;
                    }
                }
            }
            return false;
        },

        // Check if current time is within any time window
        checkTimeWindow: function(timeWindows) {
            if (!timeWindows || timeWindows.length === 0) return true;

            const now = this.currentTime;
            const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const currentMinutes = hours * 60 + minutes;

            for (const window of timeWindows) {
                // Check if current day is active (convert to Mon=0 format)
                const dayIndex = day === 0 ? 6 : day - 1;
                if (!window.days[dayIndex]) continue;

                // Parse time window
                const [startH, startM] = window.startTime.split(':').map(Number);
                const [endH, endM] = window.endTime.split(':').map(Number);
                const startMinutes = startH * 60 + startM;
                const endMinutes = endH * 60 + endM;

                // Check if current time is in window
                if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                    return true;
                }
            }

            return false;
        },

        // Check if current location is within any restriction zone
        checkLocation: function(restrictionZones) {
            if (!restrictionZones || restrictionZones.length === 0) return true;

            const userLat = this.currentLocation.lat;
            const userLng = this.currentLocation.lng;

            for (const zone of restrictionZones) {
                const distance = this.calculateDistance(
                    userLat, userLng,
                    zone.lat, zone.lng
                );

                if (distance <= zone.radiusM) {
                    return true;
                }
            }

            return false;
        },

        // Calculate distance between two points (Haversine formula)
        calculateDistance: function(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Earth radius in meters
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        },

        // Check if at enforcement zone
        isAtEnforcementZone: function(policyId) {
            const policy = this.policies.find(p => p.policyId === policyId);
            if (!policy || !policy.enforcementZone) return true;

            const distance = this.calculateDistance(
                this.currentLocation.lat,
                this.currentLocation.lng,
                policy.enforcementZone.lat,
                policy.enforcementZone.lng
            );

            return distance <= policy.enforcementZone.radiusM;
        },

        // Update location (for Phase 2 simulation)
        setLocation: function(lat, lng) {
            this.currentLocation = { lat, lng };
            this.evaluateEnforcement();
        },

        // Update time (for Phase 2 simulation)
        setTime: function(date) {
            this.currentTime = date;
            this.evaluateEnforcement();
        },

        // Evaluate and update enforcement
        evaluateEnforcement: function() {
            // Update app lock states
            const allPackages = new Set();
            this.policies.forEach(policy => {
                policy.targets.packages.forEach(pkg => allPackages.add(pkg));
            });

            allPackages.forEach(packageName => {
                const isBlocked = this.isAppBlocked(packageName);
                if (window.HomescreenModule) {
                    window.HomescreenModule.updateAppLockState(packageName, isBlocked);
                }
            });

            // Update chat input state
            const canEditPolicies = this.policies.every(p => 
                this.isAtEnforcementZone(p.policyId)
            );
            if (window.ChatModule) {
                window.ChatModule.setInputDisabled(!canEditPolicies);
            }

            // Update side menu delete permissions
            if (window.SideMenuModule) {
                window.SideMenuModule.updateDeletePermissions(canEditPolicies);
            }
        }
    };

    // Export to window
    window.SkywallState = SkywallState;

    // Initial enforcement evaluation
    setTimeout(() => {
        SkywallState.evaluateEnforcement();
    }, 1000);
})();

