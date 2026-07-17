// Manhattan Enforcement Policies - Location-based enforcement demonstration
// Shows that users cannot edit policies unless at enforcement location & time

(function() {
    'use strict';

    // Policy locations for Manhattan Work Policy
    const LOCATIONS = {
        // Restriction zone (work location)
        worldTradeCenter: { 
            lat: 40.7127, 
            lng: -74.0134, 
            name: '1 World Trade Center',
            radius: 100
        },
        
        // Enforcement zone (home)
        centralParkTower: { 
            lat: 40.7654, 
            lng: -73.9820, 
            name: 'Central Park Tower (My Apartment)',
            radius: 50
        }
    };

    // Current user state - AT work location, but WRONG time for enforcement
    const USER_STATE = {
        currentLocation: LOCATIONS.worldTradeCenter, // Currently at work
        currentTime: { hour: 11, minute: 0 } // 11:00 AM (during work hours, outside enforcement window)
    };

    // Manhattan Work Policy
    const MANHATTAN_WORK_POLICY = {
        id: 'manhattan-work-policy',
        name: 'Manhattan Work Policy',
        apps: ['YouTube', 'Instagram', 'X', 'Facebook'],
        
        // Single restriction zone (work)
        restrictionZones: [
            LOCATIONS.worldTradeCenter
        ],
        
        // Single enforcement zone (home)
        enforcementZone: LOCATIONS.centralParkTower,
        enforcementRadius: 50,
        
        // Restriction is active during work hours only
        schedule: 'Weekdays 9 AM - 5 PM',
        restrictionTime: { start: 9, end: 17 }, // 9 AM - 5 PM
        
        // Can only edit policy at home between 7 PM - 8 PM
        enforcementTime: { start: 19, end: 20 }, // 7 PM - 8 PM
        
        createdAt: '1 week ago',
        
        // The conversation that created this policy
        conversation: [
            {
                role: 'user',
                text: 'I need help blocking entertainment apps at work'
            },
            {
                role: 'assistant',
                text: "I can help you with that. Which entertainment apps would you like to block?"
            },
            {
                role: 'user',
                text: 'YouTube, Instagram, X, and Facebook'
            },
            {
                role: 'assistant',
                text: "Got it. Where should these apps be blocked?"
            },
            {
                role: 'user',
                text: '1 World Trade Center in NYC'
            },
            {
                role: 'assistant',
                text: "Let me help you find that location on the map."
            },
            {
                role: 'assistant',
                text: "Perfect! I found 1 World Trade Center. What time should this restriction be active?"
            },
            {
                role: 'user',
                text: 'During work hours, 9 AM to 5 PM'
            },
            {
                role: 'assistant',
                text: "Should this apply every day or only specific days?"
            },
            {
                role: 'user',
                text: 'Just weekdays'
            },
            {
                role: 'assistant',
                text: "One more thing - where should you be located to delete or modify this policy? This prevents you from impulsively changing it."
            },
            {
                role: 'user',
                text: 'My apartment in Central Park Tower'
            },
            {
                role: 'assistant',
                text: "Let me help you set your home location."
            },
            {
                role: 'assistant',
                text: "Great! I've set your Central Park Tower apartment as the enforcement location. What time range should you be able to modify this policy?"
            },
            {
                role: 'user',
                text: '7 PM to 8 PM'
            },
            {
                role: 'assistant',
                text: `Let me confirm this policy:

📱 Apps: YouTube, Instagram, X, Facebook
📍 Blocked at: 1 World Trade Center
⏰ Time: 9 AM - 5 PM (Weekdays)
🏠 Enforcement: Central Park Tower apartment (7 PM - 8 PM)

This means these apps will be blocked at your workplace during work hours. You'll only be able to modify or delete this policy when you're home between 7-8 PM.

⚠️ Once created, this policy will take effect immediately. Are you sure you want to create this policy?`
            },
            {
                role: 'user',
                text: 'Yes, create it'
            },
            {
                role: 'assistant',
                text: '✓ Policy created successfully! Your entertainment apps are now blocked at 1 World Trade Center during work hours.'
            }
        ]
    };

    // Export for use in demo
    window.ManhattanEnforcementPolicies = {
        policies: [MANHATTAN_WORK_POLICY],
        userState: USER_STATE,
        locations: LOCATIONS,
        
        // Check if user can edit a policy
        canEditPolicy: function(policy) {
            const currentHour = USER_STATE.currentTime.hour;
            const isInEnforcementTime = currentHour >= policy.enforcementTime.start && 
                                       currentHour < policy.enforcementTime.end;
            const isAtEnforcementLocation = USER_STATE.currentLocation === policy.enforcementZone;
            
            // Must be BOTH at the location AND during the time window
            return isInEnforcementTime && isAtEnforcementLocation;
        },
        
        // Get policy by ID
        getPolicyById: function(id) {
            return this.policies.find(p => p.id === id);
        },
        
        // Update user location (for demo animation)
        updateUserLocation: function(newLocation) {
            USER_STATE.currentLocation = newLocation;
        },
        
        // Update user time (for demo animation)
        updateUserTime: function(hour, minute) {
            USER_STATE.currentTime = { hour, minute };
        },
        
        // Get current enforcement status message
        getEnforcementStatus: function(policy) {
            const currentHour = USER_STATE.currentTime.hour;
            const isInEnforcementTime = currentHour >= policy.enforcementTime.start && 
                                       currentHour < policy.enforcementTime.end;
            const isAtEnforcementLocation = USER_STATE.currentLocation === policy.enforcementZone;
            
            if (!isAtEnforcementLocation && !isInEnforcementTime) {
                return `Locked - Must be at ${policy.enforcementZone.name} between ${policy.enforcementTime.start}:00-${policy.enforcementTime.end}:00 to edit`;
            } else if (!isAtEnforcementLocation) {
                return `Locked - Must be at ${policy.enforcementZone.name} to edit`;
            } else if (!isInEnforcementTime) {
                return `Locked - Can only edit between ${policy.enforcementTime.start}:00-${policy.enforcementTime.end}:00`;
            }
            
            return 'Unlocked - You can edit this policy';
        }
    };
})();




