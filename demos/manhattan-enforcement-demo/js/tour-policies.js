// Tour Policies - Pre-existing policies for SKYWALL OS Tour
// These policies are already created and stored in the system

(function() {
    'use strict';

    // Policy locations
    const LOCATIONS = {
        trumpTower: { lat: 40.7624, lng: -73.9738, name: 'Trump Tower' },
        brooklynBridge: { lat: 40.7061, lng: -73.9969, name: 'Brooklyn Bridge' },
        timesSquare: { lat: 40.7580, lng: -73.9855, name: 'Times Square' },
        centralParkTower: { lat: 40.7654, lng: -73.9820, name: 'Central Park Tower' },
        centralPark: { lat: 40.7829, lng: -73.9654, name: 'Central Park (Relaxation Zone)' },
        rockefellerCenter: { lat: 40.7587, lng: -73.9787, name: 'Rockefeller Center' }
    };

    // Current user state
    const USER_STATE = {
        currentLocation: LOCATIONS.brooklynBridge,
        currentTime: { hour: 19, minute: 30 } // 7:30 PM
    };

    // Policy 1: Block Instagram at Trump Tower
    const POLICY_1 = {
        id: 'policy-1',
        name: 'Instagram Block - Trump Tower',
        apps: ['Instagram'],
        restrictionZone: LOCATIONS.trumpTower,
        restrictionRadius: 100,
        enforcementZone: LOCATIONS.brooklynBridge,
        enforcementRadius: 50,
        schedule: '24/7',
        enforcementTime: { start: 19, end: 20 }, // 7 PM - 8 PM
        createdAt: '2 days ago',
        conversation: [
            {
                role: 'user',
                text: 'I need to stop checking Instagram when I\'m at work'
            },
            {
                role: 'assistant',
                text: 'I can help you stay focused. Where do you work?'
            },
            {
                role: 'user',
                text: 'Trump Tower in Manhattan'
            },
            {
                role: 'assistant',
                text: 'Perfect. Let me set up a restriction zone at Trump Tower. I\'ll block Instagram there. When should this be active?'
            },
            {
                role: 'user',
                text: 'All the time'
            },
            {
                role: 'assistant',
                text: 'Understood. Now, where should you be located to modify or delete this policy? This prevents you from impulsively changing it.'
            },
            {
                role: 'user',
                text: 'Brooklyn Bridge - that\'s where I go to unwind'
            },
            {
                role: 'assistant',
                text: 'Great choice. What time range should you be able to modify this policy?'
            },
            {
                role: 'user',
                text: '7 PM to 8 PM'
            },
            {
                role: 'assistant',
                text: `Let me confirm this policy:

📱 App: Instagram
📍 Blocked at: Trump Tower
⏰ Time: 24/7
🏠 Enforcement: Brooklyn Bridge (7 PM - 8 PM)

This means Instagram will be blocked at Trump Tower all the time. You'll only be able to modify or delete this policy when you're at Brooklyn Bridge between 7-8 PM.

Should I create this policy?`
            },
            {
                role: 'user',
                text: 'Yes, create it'
            },
            {
                role: 'assistant',
                text: '✓ Policy created successfully! Instagram is now blocked at Trump Tower.'
            }
        ]
    };

    // Policy 2: Limit social media to 20 min/day at Times Square
    const POLICY_2 = {
        id: 'policy-2',
        name: 'Social Media Limit - Times Square',
        apps: ['Instagram', 'Facebook', 'X'],
        restrictionZone: LOCATIONS.timesSquare,
        restrictionRadius: 150,
        enforcementZone: LOCATIONS.centralParkTower,
        enforcementRadius: 50,
        schedule: '20 minutes/day',
        enforcementTime: { start: 21, end: 22 }, // 9 PM - 10 PM
        createdAt: '5 days ago',
        conversation: [
            {
                role: 'user',
                text: 'I spend too much time on social media when I\'m in Times Square'
            },
            {
                role: 'assistant',
                text: 'I\'m the rational AI version of yourself, here to protect you from you. Would you like me to set a time limit for social media apps there?'
            },
            {
                role: 'user',
                text: 'Yes, limit me to just 20 minutes per day'
            },
            {
                role: 'assistant',
                text: 'Smart choice. Which apps should I limit?'
            },
            {
                role: 'user',
                text: 'Instagram, Facebook, and X'
            },
            {
                role: 'assistant',
                text: 'Got it. I\'ll set a 20-minute daily limit for those apps when you\'re in Times Square. Where should you be located to modify this policy?'
            },
            {
                role: 'user',
                text: 'My apartment in Central Park Tower'
            },
            {
                role: 'assistant',
                text: 'Perfect. What time range should you be able to modify this policy?'
            },
            {
                role: 'user',
                text: '9 PM to 10 PM'
            },
            {
                role: 'assistant',
                text: `Let me confirm this policy:

📱 Apps: Instagram, Facebook, X
📍 Limited at: Times Square
⏰ Quota: 20 minutes/day
🏠 Enforcement: Central Park Tower (9 PM - 10 PM)

This means you'll have 20 minutes total per day for these apps when you're in Times Square. You'll only be able to modify or delete this policy when you're home between 9-10 PM.

Should I create this policy?`
            },
            {
                role: 'user',
                text: 'Yes, do it'
            },
            {
                role: 'assistant',
                text: '✓ Policy created successfully! Social media apps are now limited to 20 minutes/day in Times Square.'
            }
        ]
    };

    // Policy 3: Block work apps at Central Park
    const POLICY_3 = {
        id: 'policy-3',
        name: 'Work-Free Zone - Central Park',
        apps: ['Gmail', 'LinkedIn', 'Slack'],
        restrictionZone: LOCATIONS.centralPark,
        restrictionRadius: 200,
        enforcementZone: LOCATIONS.rockefellerCenter,
        enforcementRadius: 75,
        schedule: 'Weekends only',
        enforcementTime: { start: 9, end: 17 }, // 9 AM - 5 PM (work hours)
        createdAt: '1 week ago',
        conversation: [
            {
                role: 'user',
                text: 'I can\'t relax in Central Park because I keep checking work emails'
            },
            {
                role: 'assistant',
                text: 'Your relaxation time is important. I can block work apps in Central Park. Which apps should I block?'
            },
            {
                role: 'user',
                text: 'Gmail, LinkedIn, and Slack'
            },
            {
                role: 'assistant',
                text: 'Excellent. When should this restriction be active?'
            },
            {
                role: 'user',
                text: 'Just on weekends - that\'s my recovery time'
            },
            {
                role: 'assistant',
                text: 'Perfect. Weekends in Central Park will be work-free. Where should you be located to modify this policy?'
            },
            {
                role: 'user',
                text: 'My office at Rockefeller Center'
            },
            {
                role: 'assistant',
                text: 'Makes sense. What time range should you be able to modify this policy?'
            },
            {
                role: 'user',
                text: 'During work hours, 9 AM to 5 PM'
            },
            {
                role: 'assistant',
                text: `Let me confirm this policy:

📱 Apps: Gmail, LinkedIn, Slack
📍 Blocked at: Central Park
⏰ Time: Weekends only
🏠 Enforcement: Rockefeller Center (9 AM - 5 PM)

This means work apps will be blocked in Central Park on weekends. You'll only be able to modify or delete this policy when you're at your office during work hours.

Should I create this policy?`
            },
            {
                role: 'user',
                text: 'Yes, please!'
            },
            {
                role: 'assistant',
                text: '✓ Policy created successfully! Central Park is now a work-free zone on weekends.'
            }
        ]
    };

    // Export policies
    window.TourPolicies = {
        policies: [POLICY_1, POLICY_2, POLICY_3],
        userState: USER_STATE,
        locations: LOCATIONS,
        
        // Check if user can edit a policy
        canEditPolicy: function(policy) {
            const currentHour = USER_STATE.currentTime.hour;
            const isInEnforcementTime = currentHour >= policy.enforcementTime.start && 
                                       currentHour < policy.enforcementTime.end;
            const isAtEnforcementLocation = USER_STATE.currentLocation === policy.enforcementZone;
            
            return isInEnforcementTime && isAtEnforcementLocation;
        },
        
        // Get policy by ID
        getPolicyById: function(id) {
            return this.policies.find(p => p.id === id);
        }
    };
})();


