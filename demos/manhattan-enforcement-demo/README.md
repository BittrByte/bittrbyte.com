# Manhattan Enforcement Demo

## Overview

This demo showcases **location-based and time-based policy enforcement** in Skywall OS. It demonstrates that users **cannot edit restriction policies** unless they are physically at the designated enforcement location during the specified time window.

## The Policy

**Manhattan Work Policy**
- **Apps Blocked:** YouTube, Instagram, X (Twitter), Facebook
- **Restriction Zone:** 1 World Trade Center (workplace)
- **Restriction Schedule:** Weekdays, 9 AM - 5 PM (work hours only)
- **Enforcement Location:** Central Park Tower (user's apartment/home)
- **Enforcement Time Window:** 7:00 PM - 8:00 PM only

## Key Concept: Enforcement

The **enforcement mechanism** prevents impulsive policy changes by requiring:

1. **Restriction zone** (red pin) = Where apps are blocked
2. **Enforcement zone** (black pin) = Where you can edit/delete the policy
3. **Enforcement time** = When you can edit the policy

**You must be BOTH at the enforcement location AND during the enforcement time to edit a policy.**

## What the Demo Shows

### 1. Locked Policy State
- User is currently at 1 World Trade Center (work/restriction zone) at 11:00 AM
- They try to view the Manhattan Work Policy
- The policy appears with a **lock icon** 🔒
- The chat input is **disabled** (red border shown)
- Lock message displays: *"Locked - Must be at Central Park Tower between 19:00-20:00 to edit"*

### 2. Delete Button Disabled
- User tries to delete the policy from the hamburger menu
- The delete button is **disabled** and highlighted in red
- Cannot delete because enforcement conditions are not met

### 3. Map Visualization
- Red pin shows the restriction zone (1 World Trade Center)
- Black pin shows the enforcement zone (Central Park Tower apartment)
- User avatar shows current location (1 World Trade Center)
- Geofence circles show the radius of each zone

## Running the Demo

### Quick Start
```bash
./start.sh
```

Or open `index.html` directly in your browser.

### What You'll See

The demo runs automatically in a loop:

1. **Boot sequence** - Skywall OS starts up
2. **Home screen** - Shows the phone interface
3. **Chat opens** - User asks about policies
4. **Hamburger menu** - Shows the Manhattan Work Policy with lock icon
5. **Policy view** - Displays the locked policy conversation
6. **Input disabled** - Red border shows editing is blocked
7. **Delete attempt** - Delete button is disabled
8. **Map view** - Shows restriction and enforcement zones
9. **Loop restarts**

## Why This Matters

This enforcement mechanism prevents:
- **Work distractions** - Can't disable the restriction while bored at work
- **Impulsive decisions** - Can't change policies in the moment
- **Emotional changes** - Must be in a calm environment to modify policies

## Real-World Use Case

**Scenario:** You work at the World Trade Center and want to stay focused during work hours.

1. **Create Policy:** Block YouTube, Instagram, X, and Facebook at work (9 AM - 5 PM)
2. **Set Enforcement:** Can only edit from home (Central Park Tower), 7-8 PM
3. **What Happens:**
   - You're at work at 2 PM, bored during a slow afternoon
   - You try to disable the restriction to watch YouTube
   - **Denied!** You're at work, and even if it were evening, you're not home
   - You can't access those distracting apps
   - You stay focused and productive
   - Later at home (during 7-8 PM), you can calmly decide if you want to keep/modify/delete the policy

This prevents **impulsive workplace distractions** by requiring you to wait until you're **home in the evening** to make policy changes.

## Comparison with China Demo

| Feature | China Demo | Manhattan Demo |
|---------|------------|----------------|
| Apps Blocked | Alipay, WeChat Pay | YouTube, Instagram, X, Facebook |
| Restriction Type | Payment apps at restaurants | Entertainment apps at work |
| Restriction Zones | 3 KFC locations (Shenzhen) | 1 World Trade Center |
| Restriction Schedule | 24/7 | Weekdays 9 AM - 5 PM |
| Enforcement Location | Home in Shenzhen | Home in Central Park Tower |
| Enforcement Time | 7 PM - 9 PM | 7 PM - 8 PM |
| User Current Location | KFC Dongmen | 1 World Trade Center |
| User Current Time | 2:30 PM | 11:00 AM |
| Distance to Enforcement | Within Shenzhen | ~7 km (downtown to uptown Manhattan) |

## File Structure

```
manhattan-enforcement-demo/
├── index.html                             # Main demo page
├── start.sh                               # Start script
├── README.md                              # This file
├── QUICK_START.md                         # Simple guide
├── IMPLEMENTATION_COMPLETE.md             # Implementation details
├── css/                                   # Stylesheets (from tour)
├── js/
│   ├── manhattan-enforcement-policies.js  # Policy definitions
│   ├── manhattan-enforcement-demo.js      # Automated demo script
│   ├── map.js                            # Map module with Manhattan locations
│   └── [other JS modules from tour]
├── assets/
│   └── icons/                             # App icons
└── b4f60cc5-8302-4bca-8fb3-5f359ccf042a copy.JPG  # Avatar image
```

## Technical Details

### Enforcement Logic

```javascript
canEditPolicy: function(policy) {
    const currentHour = userState.currentTime.hour;
    const isInEnforcementTime = currentHour >= policy.enforcementTime.start && 
                               currentHour < policy.enforcementTime.end;
    const isAtEnforcementLocation = userState.currentLocation === policy.enforcementZone;
    
    // Both conditions must be true
    return isInEnforcementTime && isAtEnforcementLocation;
}
```

Currently:
- `isAtEnforcementLocation` = **false** (at work, not home)
- `isInEnforcementTime` = **false** (11 AM, not 7-8 PM)
- Result: **Policy is LOCKED** 🔒

### Policy Data Structure

```javascript
{
    id: 'manhattan-work-policy',
    name: 'Manhattan Work Policy',
    apps: ['YouTube', 'Instagram', 'X', 'Facebook'],
    restrictionZones: [/* World Trade Center */],
    restrictionTime: { start: 9, end: 17 }, // 9 AM - 5 PM
    enforcementZone: /* Central Park Tower */,
    enforcementTime: { start: 19, end: 20 } // 7 PM - 8 PM
}
```

## Next Steps

After viewing this Manhattan demo:
- **Compare with China Demo** - See how enforcement works in different contexts
- **Explore Different Restrictions** folder - See various types of restrictions
- **Explore Different Modes** folder - See satellite vs independent modes

## Notes

- This is a **fully automated demo** - no user interaction needed
- Demo loops infinitely - close browser tab to stop
- The lock mechanism demonstrates **temporal and spatial enforcement**
- This showcases workplace productivity use case vs China's financial discipline use case

---

**Built with Skywall OS Simulator Framework**




