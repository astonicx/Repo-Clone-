# R.E.P.O. LOADING SCREEN SPECIFICATION

## Overview

The loading screen sets the tone for the game: **tense, dark, industrial horror** with a sense of dread and anticipation. It must establish the atmosphere while providing essential information.

---

## Visual Style

### Color Palette
- **Primary:** Deep blacks (#0a0a0a), dark grays (#1a1a1a)
- **Accent:** Sickly yellow-green (#d4af37 for tech, #4a7c7e for decay)
- **Warning:** Deep red (#8b0000 for danger indicators)
- **Atmosphere:** Slight scanlines and film grain overlay

### Background
- Dark, abandoned industrial environment (procedurally suggested)
- Flickering/failing lights creating shadows
- Subtle particle effects (dust, static, decay)
- Optional: Faint creature silhouettes in background (hint at danger)

### Typography
- **Font:** Monospace or tech-style font (like "Press Start 2P" or equivalent)
- **Main Title:** "R.E.P.O." in bold, slightly distorted or glitchy
- **Subtitle:** "Retrieval Extraction Protocol Operations"
- **Status Text:** Small, technical-looking text

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              [FLICKERING LOGO]              │
│                 R.E.P.O.                    │
│     Retrieval Extraction Protocol Ops      │
│                                             │
│          [PROGRESS BAR OR SPINNER]          │
│                                             │
│     INITIALIZING SYSTEMS...                │
│     > Checking equipment: 100%              │
│     > Loading facility map: 85%             │
│     > Syncing team comms: 60%               │
│                                             │
│               [TIP TEXT]                    │
│     "Watch your footing in dark areas"     │
│                                             │
│          [VERSION INFO]                     │
│            v1.0.0 - Early Access            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Animation & Motion

### Title Animation
- **Entry:** Slide in from top with slight jitter (like old CRT monitor artifacts)
- **Loop:** Subtle glow pulse (0.5-1.5s cycles)
- **Distortion:** Occasional scan-line glitches for realism

### Loading Bar
- **Style:** Linear bar with jagged/industrial look
- **Color:** Yellow-green (#d4af37) filling from left
- **Animation:** Smooth fill with occasional stutter (simulating real loading)
- **Text:** Percentage counter (0-100%) below bar

### Spinner Alternative
- **Style:** Three rotating lines forming a triangle
- **Color:** Sickly yellow-green
- **Speed:** 1-2 rotations per second
- **Effect:** Fade pulse while rotating

### Status Text
- **Typing Effect:** Text appears character-by-character with soft "blip" sound
- **Color Change:** Green (#00ff00) → Yellow (#ffff00) → Red (#ff0000) based on progress
- **Checkmark:** Green ✓ appears when each task completes

### Background Particles
- **Dust Motes:** Slowly falling particles with slight lateral drift
- **Static Noise:** Optional scan-line noise that fades in/out
- **Flickers:** Occasional light flickers (5-10s intervals)

---

## Audio Design

### Ambience
- **Background Hum:** Low-frequency electrical hum (50-60Hz tone, very quiet)
- **Facility Sounds:** Distant metallic creaks, settling metal (subtle, sparse)
- **Breathing/Tension:** Almost inaudible breathing sound building tension

### UI Sounds
- **Load Start:** Single electronic "power-up" tone (brief)
- **Progress Sound:** Soft "blip" for each status update (2-3 small beeps)
- **Load Complete:** Ascending tone sequence (3-4 notes building)

### Overall Level
- Keep volume **low and atmospheric** — should not startle
- Use spatial audio if available (sounds from edges/depth)

---

## Loading Tasks (in order)

```
INITIALIZING SYSTEMS...
> Checking equipment: 100% ✓
> Loading facility map: [▓▓▓▓▓░░░░] 50%
> Syncing team comms: [░░░░░░░░░░] 0%
> Calibrating sensors: PENDING
```

**Exact Tasks:**
1. **Checking equipment** (20% - 0.5s) — Quick, checks player inventory system
2. **Loading facility map** (50% - 1.5s) — Longer, simulates procedural generation
3. **Syncing team comms** (80% - 1.0s) — Medium, simulates multiplayer connection
4. **Calibrating sensors** (100% - 0.5s) — Quick, final system check

**Total Load Time:** ~4-5 seconds (can vary based on actual asset loading)

---

## Loading Tips (Rotating)

Display one of these during load:

- "Keep valuables safe — one mishandle and they're worthless"
- "Listen for distant sounds — your hearing is your best weapon"
- "Teamwork and communication are your survival tools"
- "Move slowly in unfamiliar areas — watch for hazards"
- "The Taxman takes 20% of all profits — plan accordingly"
- "Don't run with expensive loot — physics matter"
- "Revive fallen teammates at extraction points"
- "Monsters hear noise — silence is safety"
- "Cart your loot for safer transport"
- "Learn the layout before rushing in"

---

## Interaction Elements

### Mouse Cursor
- **Default:** Simple crosshair (+) in yellow-green
- **Hover:** Optional pulse/glow effect
- **Click:** No click feedback on loading screen (disabled)

### Keyboard Input
- **Escape:** Can be pressed to skip loading (loads immediately)
- **Space:** Optional — no special effect, loading continues
- **Other Keys:** Ignored during loading

---

## Error States

### If Loading Fails
```
┌─────────────────────────────────────────┐
│                                         │
│          ⚠ SYSTEM ERROR ⚠              │
│                                         │
│    Failed to load facility database     │
│                                         │
│    [RETRY]    [MAIN MENU]              │
│                                         │
└─────────────────────────────────────────┘
```

### Slow Network (Multiplayer)
```
INITIALIZING SYSTEMS...
> Checking equipment: 100% ✓
> Loading facility map: 100% ✓
> Syncing team comms: [░░░░░░░░░░] 15%
  (Waiting for teammates to connect...)
```

---

## Technical Implementation

### Resolution Handling
- **Desktop (1920x1080):** Full-screen, centered text/assets
- **Tablet (1024x768):** Responsive scaling, maintain 16:9 aspect
- **Mobile (360x640):** Vertical layout, touch-friendly (if applicable)

### Performance Notes
- **Preload:** All loading screen assets in separate bundle
- **GPU:** Minimal shader effects for low-end hardware
- **CPU:** Keep particle count low (50-100 max)
- **Memory:** ~5-10MB for loading screen assets

### Asset List
- [ ] Logo/Title texture (512x512 or vector)
- [ ] Background texture (1920x1080 or tiling pattern)
- [ ] Progress bar frame and fill (vectors)
- [ ] Particle sprites (small, repeatable)
- [ ] Font files (monospace tech font)
- [ ] Audio files (hum, blips, complete tone)

---

## Transition to Main Menu

### When Loading Complete
1. **Status Text:** Changes to "SYSTEMS READY"
2. **Color:** Shifts to bright green (#00ff00)
3. **Sound:** Ascending tone plays (3-4 notes)
4. **Fade:** 0.5s crossfade to main menu
5. **Timing:** Auto-transitions after 1s of "READY" state

### Alternative: Manual Start
- **Press Space:** Immediately transitions to main menu
- **Cannot Go Back:** Loading screen only appears once per session

---

## Animation Timeline (Detailed)

```
00.0s - Screen fades in with black background, ambient hum starts
00.2s - Title slides in from top with glitch effect
00.5s - Background particles begin falling slowly
00.8s - Loading bar appears with initial value (0%)
01.0s - First status line types: "Checking equipment..."
01.5s - Progress bar fills to 20%, first blip sound
02.0s - Second status line types: "Loading facility map..."
02.5s - Progress bar at 50%, second blip sound
03.0s - Third status line types: "Syncing team comms..."
03.5s - Progress bar at 80%, third blip sound
04.0s - Fourth status line types: "Calibrating sensors..."
04.5s - Progress bar reaches 100%, final blip sound
05.0s - "SYSTEMS READY" displays in bright green
05.5s - Ascending tone plays, fade transition to main menu
```

---

## Color Reference

| Element | Color | Hex | Use |
|---------|-------|-----|-----|
| Background | Deep Black | #0a0a0a | Main background |
| Surface | Dark Gray | #1a1a1a | UI elements |
| Accent | Sickly Yellow-Green | #d4af37 | Progress, alerts |
| Decay | Teal-Green | #4a7c7e | Atmosphere |
| Danger | Deep Red | #8b0000 | Errors, warnings |
| Complete | Bright Green | #00ff00 | Success states |
| Text | Light Gray | #e0e0e0 | Normal text |
| Glitch | Cyan/Magenta | #00ffff / #ff00ff | Visual effects |

---

## File Structure (Code)

```
/src
  /components
    /LoadingScreen.tsx          # Main loading screen component
    /LoadingBar.tsx             # Progress bar sub-component
    /ParticleEffect.tsx         # Falling dust particles
  /systems
    /LoadingSystem.ts           # Loading logic and timing
  /ui
    /loadingScreen.css          # Loading screen styles
  /audio
    /loading-hum.mp3            # Ambient hum
    /load-blip.mp3              # Progress sound
    /load-complete.mp3          # Completion tone
  /assets
    /loading-bg.png             # Background texture
    /repo-logo.png              # Title logo
```

---

## Best Practices

✅ **DO:**
- Keep it **atmospheric but not too long** (3-5 seconds)
- Provide **feedback** for each loading stage
- Use **audio** to enhance the experience
- Support **skip functionality** (press Space/Escape)
- Make **text readable** on all backgrounds
- Test on **low-end devices** for performance

❌ **DON'T:**
- Make loading screen **too flashy** (builds tension, not excitement)
- Use **bright colors** that clash with dark theme
- Force players to **watch without skip** option
- Autoplay **loud audio** without warning
- Use **animated backgrounds** that distract
- Ignore **accessibility** (provide captions for deaf players)

---

## Testing Checklist

- [ ] Loading screen appears on game start
- [ ] All status text displays in order
- [ ] Progress bar fills smoothly
- [ ] Audio plays without distortion
- [ ] Transitions smoothly to main menu
- [ ] Can skip with Space/Escape key
- [ ] Responsive on all screen sizes
- [ ] No memory leaks during animation
- [ ] FPS stays above 30 during load
- [ ] Works on low-end hardware
- [ ] Accessible for colorblind players

