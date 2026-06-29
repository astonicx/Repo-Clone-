# R.E.P.O. GAME SYSTEMS DOCUMENTATION

**Game:** R.E.P.O. (Retrieval Extraction Protocol Operations)  
**Genre:** Cooperative Physics-Based Horror  
**Platform:** PC (Web-based clone)  
**Core Mechanic:** Extract valuable loot from dangerous procedurally-generated facilities while managing physics-based items and avoiding monsters through stealth and teamwork.

---

## TABLE OF CONTENTS

1. [Core Gameplay Loop](#core-gameplay-loop)
2. [Player Mechanics](#player-mechanics)
3. [Movement & Stamina System](#movement--stamina-system)
4. [Physics & Interaction System](#physics--interaction-system)
5. [Loot Management System](#loot-management-system)
6. [Monster/Threat System](#monsterthreat-system)
7. [Team Coordination System](#team-coordination-system)
8. [Extraction System](#extraction-system)
9. [Shop & Upgrades System](#shop--upgrades-system)
10. [UI/HUD System](#uihud-system)
11. [Game States](#game-states)
12. [Facility & Level Generation](#facility--level-generation)

---

## CORE GAMEPLAY LOOP

**Description:**
[Describe what the player does repeatedly. Example: "Move character → Collect items → Avoid enemies → Gain points"]

**Flow Diagram:**
```
START
  ↓
INPUT (user controls)
  ↓
UPDATE (game logic, physics, collision)
  ↓
RENDER (display game state)
  ↓
CHECK WIN/LOSE
  ├─ WIN → Victory State
  ├─ LOSE → Failure State
  └─ CONTINUE → Loop back to INPUT
```

**Files Responsible:**
- [List components/systems involved]

---

## PLAYER MECHANICS

### 1. Player Movement

**Description:**
- Controls: [Keyboard/Mouse/Touch - specify keys or gestures]
- Speed: [pixels/units per frame]
- Acceleration: [if applicable]
- Max velocity: [if applicable]

**Technical Breakdown:**
- Input handler: Listen for key press/mouse/touch events
- Position update: Change x/y based on input
- Constraints: Keep player within game bounds
- Animation: [if applicable - what sprites/frames]

**Pseudocode:**
```
function updatePlayer(input, deltaTime):
  if input.left pressed:
    player.x -= player.speed * deltaTime
  if input.right pressed:
    player.x += player.speed * deltaTime
  
  clampToBounds(player)
  updateAnimation(player)
```

**Edge Cases:**
- What happens if player moves off screen?
- What if multiple keys pressed simultaneously?
- Mobile vs desktop input differences?

**Files Responsible:**
- `src/components/Player.tsx`
- `src/systems/InputSystem.ts`
- `src/logic/playerLogic.ts`

---

## MOVEMENT SYSTEM

**Description:**
[Full description of how movement works, including restrictions, physics, acceleration]

**Constraints:**
- Boundaries: [Game area limits]
- Collisions: [What stops/slows movement]
- Friction: [Deceleration, if any]

**Technical Implementation:**
```
// Pseudocode for frame-based movement
function updatePosition(entity, velocityX, velocityY, deltaTime):
  newX = entity.x + velocityX * deltaTime
  newY = entity.y + velocityY * deltaTime
  
  if isCollidingWithWall(newX, newY):
    return false (no movement)
  
  entity.x = newX
  entity.y = newY
  return true
```

**Files Responsible:**
- `src/logic/movement.ts`
- `src/systems/PhysicsSystem.ts`

---

## COLLISION SYSTEM

**Description:**
[How collisions are detected and resolved]

**Types of Collisions:**
- Player ↔ Walls
- Player ↔ Enemies
- Player ↔ Items/Pickups
- Enemy ↔ Enemy
- [Other collisions]

**Detection Method:**
- [Bounding boxes, circles, pixel-perfect, etc.]

**Collision Response:**
```
if collision(player, wall):
  player.position = previousPosition (bounce back)

if collision(player, enemy):
  player.health -= 10

if collision(player, item):
  inventory.add(item)
  score += item.points
```

**Performance Considerations:**
- [Broad-phase/narrow-phase detection?]
- [Quadtree/spatial partitioning?]

**Files Responsible:**
- `src/systems/CollisionSystem.ts`
- `src/logic/collisionLogic.ts`

---

## SCORING SYSTEM

**Description:**
[How points are awarded and tracked]

**Scoring Rules:**
- Collect item type A: +10 points
- Defeat enemy: +25 points
- Complete level: +100 points
- [Other rules]

**Score Multipliers:**
- [If combo system exists]
- [If difficulty modifies score]

**High Score Tracking:**
- Stored in: [localStorage, database, file]
- Persistence: [Session, permanent]

**Pseudocode:**
```
function awardPoints(amount, multiplier = 1):
  points = amount * multiplier
  score += points
  updateScoreDisplay(score)
  saveHighScore()
```

**Files Responsible:**
- `src/logic/scoringLogic.ts`
- `src/systems/ScoreSystem.ts`

---

## LEVEL/STAGE SYSTEM

**Description:**
[How levels progress, increase in difficulty, etc.]

**Level Progression:**
- Level 1: [Description]
- Level 2: [Description]
- [Continue for each level]

**Difficulty Scaling:**
- [Enemy speed increase]
- [Spawn rate increase]
- [Time limits]

**Data Structure:**
```
const levels = [
  {
    id: 1,
    name: "Introduction",
    enemies: 3,
    timelimit: 60,
    targetScore: 500
  },
  ...
]
```

**Files Responsible:**
- `src/systems/LevelSystem.ts`
- `src/logic/levelLogic.ts`

---

## UI/HUD SYSTEM

**Description:**
[What information is displayed to the player]

**HUD Elements:**
- Score display: [Top-left/right, format]
- Health/Lives: [Display format, location]
- Level indicator: [Where shown]
- Timer: [If applicable, where shown]
- [Other UI elements]

**Menus:**
- Start menu: [Options available]
- Pause menu: [Options available]
- Game Over menu: [Options available]
- Settings: [If applicable]

**Layout:**
```
+─────────────────────────────────+
│ Score: 1250    Level: 1   HP: ❤️❤️❤️│
│                              00:45│
│                                   │
│          [GAME AREA]              │
│                                   │
│                                   │
+─────────────────────────────────+
```

**Files Responsible:**
- `src/components/HUD.tsx`
- `src/components/Menu.tsx`
- `src/ui/UIElements.tsx`

---

## GAME STATES

**Description:**
[How game moves between different states]

**State Diagram:**
```
MENU → PLAYING → PAUSED ↔ PLAYING
        ↓
     GAME_OVER → MENU
        ↓
     LEVEL_COMPLETE → NEXT_LEVEL or MENU
```

**States:**
- **MENU:** Player choosing to start
- **PLAYING:** Active gameplay
- **PAUSED:** Game frozen, can resume
- **GAME_OVER:** Player failed or won
- **LEVEL_COMPLETE:** Successfully completed level

**State Transitions:**
```
MENU + [Start] → PLAYING
PLAYING + [ESC] → PAUSED
PAUSED + [Resume] → PLAYING
PLAYING + [Health = 0] → GAME_OVER
PLAYING + [Won] → LEVEL_COMPLETE
```

**Files Responsible:**
- `src/systems/GameStateManager.ts`
- `src/logic/stateLogic.ts`

---

## ADDITIONAL MECHANICS

### Enemy System
[Describe how enemies spawn, move, attack]

### Pickup/Item System
[Describe items, power-ups, effects]

### Power-ups
[Describe temporary bonuses]

### Difficulty Settings
[Easy, Normal, Hard - what changes?]

### Sound/Audio
[If applicable]

---

## TECHNICAL NOTES

- **Framework:** React + TypeScript + Vite
- **State Management:** [Redux/Zustand/Context - specify]
- **Game Loop:** [requestAnimationFrame or similar]
- **Delta Time:** [For frame-independent movement]
- **Data Persistence:** [localStorage, IndexedDB, etc.]

---

## TODO: SYSTEMS TO DOCUMENT

- [ ] Spawning system
- [ ] AI/Enemy behavior
- [ ] Animations
- [ ] Particle effects (if applicable)
- [ ] Save/Load system
