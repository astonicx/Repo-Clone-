# BUILD STEPS — Step-by-Step Development Plan

This document outlines the exact steps to build the game clone from scratch.

---

## PHASE 1: PROJECT SETUP

### Step 1: Initialize Git and Branching Strategy

```bash
# Project is already created with React/Vite scaffold
# Verify we're on main branch
git status

# Create main development branch
git checkout -b develop
git push -u origin develop
```

**Checklist:**
- [ ] Git initialized
- [ ] Main and develop branches created
- [ ] .gitignore configured
- [ ] README.md completed

### Step 2: Environment Setup

```bash
# Install dependencies (already done, but verify)
npm install

# Verify dev server runs
npm run dev

# Create .env file if needed
touch .env
```

**Checklist:**
- [ ] npm packages installed
- [ ] Dev server runs on localhost:5173 (or configured port)
- [ ] Vite config correct for game development

### Step 3: Project Structure Initialization

Create core directory structure:
```bash
mkdir -p src/{components,systems,logic,ui,utils,hooks}
mkdir -p tests
mkdir -p docs
```

**Checklist:**
- [ ] All folders created
- [ ] `.copilot-instructions.md` in place
- [ ] `GAME_SYSTEMS.md` started
- [ ] `BUILD_STEPS.md` (this file) in place

---

## PHASE 2: DOCUMENTATION & PLANNING

### Step 4: Complete Game Systems Documentation

**What to do:**
1. Study the original game thoroughly
2. Break down ALL mechanics into the sections in `GAME_SYSTEMS.md`
3. Write pseudocode for each system
4. Identify edge cases
5. Create rough file structure

**Questions to answer:**
- [ ] What is the core gameplay loop?
- [ ] What controls does the player have?
- [ ] What objects can the player collide with?
- [ ] How is score calculated?
- [ ] Are there levels? How do they progress?
- [ ] What states can the game be in?
- [ ] What visual elements make up the UI?

### Step 5: Create Initial DEV_LOG.md

```bash
# Add first entry
echo "## Development Log

### 2026-06-27 — Project Initialization
- **Branch:** main → develop
- **What:** Set up React/Vite scaffold, installed better-sqlite3
- **Next:** Complete GAME_SYSTEMS.md documentation
" > docs/DEV_LOG.md
```

**Checklist:**
- [ ] DEV_LOG.md created
- [ ] First entry logged

---

## PHASE 3: CORE SYSTEMS IMPLEMENTATION

### Step 6: Game State Management

**Branch:** `feature/game-state`

**What to implement:**
- [ ] Create state manager (Zustand or Context)
- [ ] Define game states (MENU, PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE)
- [ ] State transition logic
- [ ] Initial state setup

**Files to create:**
- `src/systems/GameStateManager.ts`
- `src/logic/stateLogic.ts`

**Commits:**
```bash
git add src/systems/GameStateManager.ts
git commit -m "Add game state manager with basic states"

git add src/logic/stateLogic.ts
git commit -m "Add state transition logic"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Delete branch
- [ ] Update DEV_LOG.md

---

### Step 7: Game Loop & Timing

**Branch:** `feature/game-loop`

**What to implement:**
- [ ] requestAnimationFrame game loop
- [ ] Delta time calculation (for frame-independent movement)
- [ ] Update and render cycle
- [ ] Performance monitoring (FPS counter optional)

**Files to create:**
- `src/systems/GameEngine.ts`
- `src/logic/gameLoop.ts`

**Commits:**
```bash
git add src/systems/GameEngine.ts
git commit -m "Implement game loop with requestAnimationFrame"

git add src/logic/gameLoop.ts
git commit -m "Add delta time calculation and update/render cycle"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 8: Input System

**Branch:** `feature/input-system`

**What to implement:**
- [ ] Keyboard input handler
- [ ] Mouse input (if needed)
- [ ] Touch input (if needed)
- [ ] Input state management

**Files to create:**
- `src/systems/InputSystem.ts`
- `src/hooks/useInput.ts`

**Commits:**
```bash
git add src/systems/InputSystem.ts
git commit -m "Add keyboard input handling"

git add src/hooks/useInput.ts
git commit -m "Create useInput hook for React components"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

## PHASE 4: GAMEPLAY MECHANICS

### Step 9: Player Mechanics

**Branch:** `feature/player-mechanics`

**What to implement:**
- [ ] Player component/entity
- [ ] Player position tracking
- [ ] Player animation (if applicable)
- [ ] Visual rendering

**Files to create:**
- `src/components/Player.tsx`
- `src/logic/playerLogic.ts`

**Commits:**
```bash
git add src/components/Player.tsx
git commit -m "Create Player component"

git add src/logic/playerLogic.ts
git commit -m "Implement player logic and rendering"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 10: Movement System

**Branch:** `feature/movement`

**What to implement:**
- [ ] Movement calculation based on input
- [ ] Boundary constraints
- [ ] Velocity updates
- [ ] Smooth movement with delta time

**Files to create/update:**
- `src/logic/movement.ts`
- `src/systems/PhysicsSystem.ts`

**Commits:**
```bash
git add src/logic/movement.ts
git commit -m "Add movement calculation and boundary constraints"

git add src/systems/PhysicsSystem.ts
git commit -m "Implement physics system for velocity and acceleration"
```

**When done:**
- [ ] Playtest: Can player move left/right/up/down?
- [ ] Playtest: Does player stay within bounds?
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 11: Collision System

**Branch:** `feature/collision`

**What to implement:**
- [ ] Collision detection (AABB bounding boxes)
- [ ] Collision detection for all entity types
- [ ] Collision response handling
- [ ] Spatial optimization (if needed)

**Files to create:**
- `src/systems/CollisionSystem.ts`
- `src/logic/collisionLogic.ts`
- `src/utils/collisionUtils.ts`

**Commits:**
```bash
git add src/systems/CollisionSystem.ts
git commit -m "Implement collision detection system"

git add src/logic/collisionLogic.ts
git commit -m "Add collision response handlers"

git add src/utils/collisionUtils.ts
git commit -m "Add collision detection utility functions"
```

**When done:**
- [ ] Playtest: Collisions detected correctly?
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 12: Scoring System

**Branch:** `feature/scoring`

**What to implement:**
- [ ] Score calculation logic
- [ ] Score display/rendering
- [ ] Point awards for different actions
- [ ] High score tracking

**Files to create:**
- `src/systems/ScoreSystem.ts`
- `src/logic/scoringLogic.ts`
- `src/utils/scoreUtils.ts`

**Commits:**
```bash
git add src/systems/ScoreSystem.ts
git commit -m "Implement score system"

git add src/logic/scoringLogic.ts
git commit -m "Add point calculation logic"

git add src/utils/scoreUtils.ts
git commit -m "Add score utilities and formatting"
```

**When done:**
- [ ] Playtest: Points awarded correctly?
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

## PHASE 5: UI & VISUAL SYSTEMS

### Step 13: HUD System

**Branch:** `feature/hud`

**What to implement:**
- [ ] Score display
- [ ] Health/Lives display
- [ ] Level indicator
- [ ] Timer (if applicable)
- [ ] HUD layout and styling

**Files to create:**
- `src/components/HUD.tsx`
- `src/components/ScoreDisplay.tsx`
- `src/components/HealthDisplay.tsx`

**Commits:**
```bash
git add src/components/HUD.tsx
git commit -m "Create HUD component with score and health displays"

git add src/components/ScoreDisplay.tsx
git commit -m "Add score display component"

git add src/components/HealthDisplay.tsx
git commit -m "Add health/lives display component"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 14: Game Over & Victory Screens

**Branch:** `feature/game-end-screens`

**What to implement:**
- [ ] Game Over screen
- [ ] Victory/Level Complete screen
- [ ] Restart/Continue buttons
- [ ] Final score display

**Files to create:**
- `src/components/GameOverScreen.tsx`
- `src/components/VictoryScreen.tsx`

**Commits:**
```bash
git add src/components/GameOverScreen.tsx
git commit -m "Create game over screen"

git add src/components/VictoryScreen.tsx
git commit -m "Create victory screen"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

## PHASE 6: LEVEL & PROGRESSION

### Step 15: Level System

**Branch:** `feature/level-system`

**What to implement:**
- [ ] Level data structure
- [ ] Level loading logic
- [ ] Difficulty progression
- [ ] Level completion detection

**Files to create:**
- `src/systems/LevelSystem.ts`
- `src/logic/levelLogic.ts`
- `src/data/levels.ts`

**Commits:**
```bash
git add src/systems/LevelSystem.ts
git commit -m "Implement level system"

git add src/logic/levelLogic.ts
git commit -m "Add level progression logic"

git add src/data/levels.ts
git commit -m "Define level data and progression"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

## PHASE 7: ADVANCED FEATURES

### Step 16: Enemy/Obstacle System

**Branch:** `feature/enemies`

**What to implement:**
- [ ] Enemy component
- [ ] Enemy AI/movement patterns
- [ ] Enemy spawning
- [ ] Enemy collision with player

**Files to create:**
- `src/components/Enemy.tsx`
- `src/systems/EnemySystem.ts`
- `src/logic/enemyLogic.ts`

**Commits:**
```bash
git add src/components/Enemy.tsx
git commit -m "Create Enemy component"

git add src/systems/EnemySystem.ts
git commit -m "Implement enemy management system"

git add src/logic/enemyLogic.ts
git commit -m "Add enemy AI and behavior logic"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 17: Items/Pickups System

**Branch:** `feature/items`

**What to implement:**
- [ ] Item component
- [ ] Item pickup detection
- [ ] Item effects on player
- [ ] Item spawning

**Files to create:**
- `src/components/Item.tsx`
- `src/systems/ItemSystem.ts`
- `src/logic/itemLogic.ts`

**Commits:**
```bash
git add src/components/Item.tsx
git commit -m "Create Item component"

git add src/systems/ItemSystem.ts
git commit -m "Implement item system"

git add src/logic/itemLogic.ts
git commit -m "Add item pickup and effect logic"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

## PHASE 8: POLISH & OPTIMIZATION

### Step 18: Animations & Visual Effects

**Branch:** `feature/animations`

**What to implement:**
- [ ] Player animations
- [ ] Enemy animations (if applicable)
- [ ] UI transitions
- [ ] Particle effects (if applicable)

**Files to create:**
- `src/components/AnimatedSprite.tsx`
- `src/utils/animationUtils.ts`

**Commits:**
```bash
git add src/components/AnimatedSprite.tsx
git commit -m "Add sprite animation component"

git add src/utils/animationUtils.ts
git commit -m "Add animation utility functions"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 19: Performance Optimization

**Branch:** `feature/performance`

**What to implement:**
- [ ] Render optimization
- [ ] Collision detection optimization
- [ ] Memory leak fixes
- [ ] FPS monitoring

**Commits:**
```bash
git commit -m "Optimize rendering and collision detection"
git commit -m "Fix memory leaks in game loop"
git commit -m "Add performance monitoring"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 20: Data Persistence

**Branch:** `feature/persistence`

**What to implement:**
- [ ] High score saving (localStorage/DB)
- [ ] Player progress tracking
- [ ] Settings persistence
- [ ] Save/Load functionality

**Files to create:**
- `src/systems/PersistenceSystem.ts`
- `src/utils/storageUtils.ts`

**Commits:**
```bash
git add src/systems/PersistenceSystem.ts
git commit -m "Implement data persistence system"

git add src/utils/storageUtils.ts
git commit -m "Add storage utility functions"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

## PHASE 9: TESTING & FINAL POLISH

### Step 21: Unit Tests

**Branch:** `feature/testing`

**What to implement:**
- [ ] Unit tests for game logic
- [ ] Tests for collision detection
- [ ] Tests for scoring
- [ ] Tests for state transitions

**Files to create:**
- `tests/gameLogic.test.ts`
- `tests/collision.test.ts`
- `tests/scoring.test.ts`
- `tests/state.test.ts`

**Commits:**
```bash
git add tests/
git commit -m "Add unit tests for game systems"
```

**When done:**
- [ ] Create Pull Request to `develop`
- [ ] All tests passing
- [ ] Code coverage at acceptable level
- [ ] Review and merge
- [ ] Update DEV_LOG.md

---

### Step 22: Final Playtest & Bug Fixes

**What to do:**
- [ ] Play through all levels
- [ ] Test edge cases
- [ ] Report issues in GitHub Issues
- [ ] Fix critical bugs
- [ ] Polish UI/UX

**Commits:**
```bash
git commit -m "Fix critical bugs found in playtesting"
git commit -m "Polish UI and improve user experience"
```

---

### Step 23: Release

**What to do:**
- [ ] Update README.md with full instructions
- [ ] Merge `develop` into `main`
- [ ] Create Release v1.0.0 on GitHub
- [ ] Tag release commit

**Commits:**
```bash
git checkout main
git merge develop
git tag -a v1.0.0 -m "Initial release of game clone"
git push origin main --tags
```

---

## COMMIT MESSAGE GUIDELINES

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)

**Examples:**
```
feat(movement): add smooth player acceleration
fix(collision): prevent players from passing through walls
refactor(scoring): simplify point calculation logic
perf(renderer): optimize entity rendering with spatial hashing
test(collision): add tests for edge cases
```

---

## PULL REQUEST TEMPLATE

When creating a PR, use this structure:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Performance improvement
- [ ] Documentation

## Related Issues
Closes #123

## Testing
How was this tested? What scenarios were covered?

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## TESTING CHECKLIST

Before merging any PR:

- [ ] Feature works as designed
- [ ] No console errors or warnings
- [ ] Code is readable and commented
- [ ] Tests pass
- [ ] No performance regressions
- [ ] Edge cases handled

---

## DEPLOYMENT CHECKLIST

Before releasing v1.0.0:

- [ ] All features implemented
- [ ] All tests passing
- [ ] Documentation complete
- [ ] README updated
- [ ] Performance acceptable
- [ ] No critical bugs
- [ ] High score saving works
- [ ] All game states functional

---

## TIPS FOR SUCCESS

1. **Small, focused commits** - Easier to review and revert if needed
2. **Test early and often** - Catch bugs before they compound
3. **Document as you go** - Future you will thank present you
4. **Playtesting regularly** - Find issues organically
5. **Refactor incrementally** - Don't wait until the end
6. **Version your work** - Use semantic versioning

