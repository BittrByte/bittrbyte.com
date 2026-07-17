// China Enforcement Policies - Location-based enforcement demonstration
// Shows that users cannot edit policies unless at enforcement location & time

(function() {
    'use strict';

    // Policy locations for China Payment Restriction
    const LOCATIONS = {
        // Restriction zones (KFC locations in Shenzhen)
        kfcDongmen: { 
            lat: 22.5455, 
            lng: 114.1159, 
            name: 'KFC Dongmen (Shenzhen)',
            radius: 100
        },
        kfcLuohu: { 
            lat: 22.5475, 
            lng: 114.1195, 
            name: 'KFC Luohu Commercial City (Shenzhen)',
            radius: 100
        },
        kfcCocoPark: { 
            lat: 22.5421, 
            lng: 114.0598, 
            name: 'KFC Coco Park (Shenzhen)',
            radius: 100
        },
        
        // Enforcement zone (home in Shenzhen)
        shenzhenHome: { 
            lat: 22.5329, 
            lng: 114.0536, 
            name: 'Junzi Garden Apartments, Shenzhen',
            radius: 50
        }
    };

    // Current user state - NOT at enforcement location
    const USER_STATE = {
        currentLocation: LOCATIONS.kfcDongmen, // Currently at KFC Dongmen
        currentTime: { hour: 14, minute: 30 } // 2:30 PM (outside enforcement window)
    };

    // China Payment Restriction Policy
    const CHINA_PAYMENT_POLICY = {
        id: 'china-payment-restriction',
        name: 'China Payment Restriction',
        apps: ['Alipay', 'WeChat Pay'],
        
        // Multiple restriction zones
        restrictionZones: [
            LOCATIONS.kfcDongmen,
            LOCATIONS.kfcLuohu,
            LOCATIONS.kfcCocoPark
        ],
        
        // Single enforcement zone
        enforcementZone: LOCATIONS.shenzhenHome,
        enforcementRadius: 50,
        
        // Restriction is active 24/7
        schedule: '24/7',
        
        // Can only edit policy at home in Shenzhen between 7 PM - 9 PM
        enforcementTime: { start: 19, end: 21 }, // 7 PM - 9 PM
        
        createdAt: '3 days ago',
        
        // The conversation that created this policy
        conversation: [
            {
                role: 'user',
                text: 'SKYWALL block Alipay and WeChat Pay at all KFC locations in Shenzhen'
            },
            {
                role: 'assistant',
                text: "I'll help you block Alipay and WeChat Pay at KFC locations in Shenzhen. Let me find the KFC locations for you."
            },
            {
                role: 'assistant',
                text: "I found 3 KFC locations in Shenzhen: KFC Dongmen, KFC Luohu Commercial City, and KFC Coco Park. When should this restriction be active?"
            },
            {
                role: 'user',
                text: 'Have this done 24 hours a day, 7 days a week'
            },
            {
                role: 'assistant',
                text: "Got it. Now, where should you be located to modify or delete this policy? This prevents you from impulsively changing it."
            },
            {
                role: 'user',
                text: 'Also have this policy enforced to my house in Shenzhen'
            },
            {
                role: 'assistant',
                text: "Let me help you set your home location in Shenzhen. What's your address?"
            },
            {
                role: 'user',
                text: 'Junzi Garden Apartments'
            },
            {
                role: 'assistant',
                text: "Found it! Let me confirm Junzi Garden Apartments in Shenzhen."
            },
            {
                role: 'assistant',
                text: `Let me confirm this policy:

📱 Apps: Alipay, WeChat Pay
📍 Blocked at: 3 KFC locations in Shenzhen
   • KFC Dongmen
   • KFC Luohu Commercial City
   • KFC Coco Park
⏰ Time: 24/7 (All day, every day)
🏠 Enforcement: Junzi Garden Apartments, Shenzhen (7 PM - 9 PM)

This means Alipay and WeChat Pay will be blocked at all KFC locations in Shenzhen, around the clock. You'll only be able to modify or delete this policy when you're at your home in Shenzhen between 7-9 PM.

⚠️ Once created, this policy will take effect immediately. Are you sure you want to create this policy?`
            },
            {
                role: 'user',
                text: 'Yes, create it'
            },
            {
                role: 'assistant',
                text: '✓ Policy created successfully! Alipay and WeChat Pay are now blocked at all KFC locations in Shenzhen, 24/7. You can only edit this policy from your home in Shenzhen between 7-9 PM.'
            }
        ]
    };

    // Export for use in demo
    window.ChinaEnforcementPolicies = {
        policies: [CHINA_PAYMENT_POLICY],
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

