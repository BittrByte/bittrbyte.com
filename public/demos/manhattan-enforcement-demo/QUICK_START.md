# Quick Start - Manhattan Enforcement Demo

## What is This?

This demo shows **you cannot edit work policies while at work** - you have to wait until you're home in the evening.

## The Simple Explanation

**The Policy:**
- Blocks YouTube, Instagram, X, and Facebook at work (1 World Trade Center)
- Active during work hours: 9 AM - 5 PM (weekdays only)

**The Lock (Enforcement):**
- Can ONLY edit/delete this policy when at home (Central Park Tower)
- Can ONLY edit between 7 PM - 8 PM

**Current Situation in Demo:**
- User is at work (1 World Trade Center)
- Time is 11:00 AM (during work hours)
- Therefore: **Policy is LOCKED** 🔒

## Why This Makes Sense

**Problem:** You set a restriction to stay focused at work, but then disable it when you're bored.

**Solution:** You can only modify the restriction when you're home in the evening (when you can think clearly about whether you really want to remove it).

**Example:**
- You're at work at 2 PM, slow afternoon
- You try to disable the YouTube block to watch videos
- **It won't let you!** You have to wait until you're home at 7-8 PM
- By then, work is over and you don't care about changing the policy

## What You'll See

1. **Boot** → Phone starts up
2. **Chat** → User asks about work policy
3. **Menu** → Policy shows with lock icon 🔒
4. **View Policy** → Can see it, but can't edit (red border on input)
5. **Try to Delete** → Delete button doesn't work (highlighted in red)
6. **Map** → Shows work (red pin) vs home (black pin)
7. **Loop** → Repeats automatically

## How to Run

```bash
./start.sh
```

Or just open `index.html` in your browser.

## Key Visual Cues

| Icon/Color | Meaning |
|------------|---------|
| 🔒 Lock icon | Policy is locked - cannot edit |
| Red border on input | Editing disabled |
| Red pin on map | Restriction zone (where apps are blocked) |
| Black pin on map | Enforcement zone (where you can edit) |
| Disabled delete button | Cannot delete policy right now |

## The Two Zones

**Red Pin = Restriction Zone (Work)**
- 1 World Trade Center
- Apps are **blocked** here during work hours
- This is where the restriction **applies**

**Black Pin = Enforcement Zone (Home)**
- Central Park Tower (your apartment)
- You can only **edit the policy** here
- This is where you have **control**

**Simple Rule:** Apps are blocked at work. You can only change that rule at home.

## Real-World Benefit

You protect yourself from your **impulsive workplace self** by making sure only your **calm evening home self** can modify work policies.

---

**Ready to see it?** Run `./start.sh` and watch the automated demo!









