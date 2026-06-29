# R.E.P.O. GAME CLONE — Development Workflow Guide

A complete, Copilot-assisted system for building **R.E.P.O.** — a cooperative physics-based horror extraction game using React + Vite + Three.js.

---

## What Is This?

This project recreates R.E.P.O. with:

- ✅ **Exact game mechanics** (extraction gameplay, physics interaction, monster threats)
- ✅ **Physics-based item interaction** (Cannon-ES physics engine)
- ✅ **Procedurally-generated facilities** (unique layouts per mission)
- ✅ **AI-controlled monsters** (noise detection, intelligent pathfinding)
- ✅ **Team coordination system** (4-player co-op support)
- ✅ **Complete UI/HUD system** (minimap, health, stamina, loot tracking)
- ✅ **Full progression system** (shop, upgrades, persistence)
- ✅ **Fully original code** (zero copyrighted content)
- ✅ **Comprehensive documentation** (20+ phases, fully specified)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm install better-sqlite3
```

### 2. Start Development Server

```bash
npm run dev:all
```

The app will run on `http://localhost:5173`

### 3. Explore the Documentation

Before writing any code:

1. Read [docs/GAME_SYSTEMS.md](docs/GAME_SYSTEMS.md) — This defines all game mechanics
2. Read [docs/BUILD_STEPS.md](docs/BUILD_STEPS.md) — Step-by-step implementation guide
3. Check [docs/DEV_LOG.md](docs/DEV_LOG.md) — Progress tracking

---

## Project Structure

```
RepoClone/
├── src/
│   ├── components/          # React UI components (Player, Enemy, HUD, etc.)
│   ├── systems/             # Game systems (GameState, Physics, Collision, etc.)
│   ├── logic/               # Pure game logic (movement, collision, scoring)
│   ├── ui/                  # UI-specific code
│   ├── utils/               # Utility functions
│   ├── hooks/               # React hooks (useInput, useGameState, etc.)
│   └── App.tsx
├── docs/
│   ├── GAME_SYSTEMS.md      # Complete game mechanics documentation
│   ├── BUILD_STEPS.md       # 23-phase implementation guide
│   └── DEV_LOG.md           # Daily progress tracking
├── tests/                   # Unit and integration tests
├── .copilot-instructions.md # GitHub Copilot system prompt
├── package.json
└── README.md (this file)
```

---

## How to Use This System

### For Developers

1. **Define the game** — Read the original game thoroughly, document mechanics in `GAME_SYSTEMS.md`
2. **Follow BUILD_STEPS.md** — Each step is a feature branch with clear objectives
3. **Create branches** — Each feature gets its own branch (`feature/movement`, etc.)
4. **Commit frequently** — Small, logical commits with clear messages
5. **Use Copilot** — Let it assist with code generation and suggestions
6. **Update DEV_LOG.md** — Track progress daily
7. **Open PRs** — Review your own code, merge to `develop`, then `main`

### For GitHub Copilot

Copilot has clear instructions in [.copilot-instructions.md](.copilot-instructions.md). It will:

- Generate modular, well-commented code
- Follow the structure defined in GAME_SYSTEMS.md
- Suggest improvements and edge cases
- Help with documentation and testing
- Never copy original game code or assets

---

## Development Workflow

### Starting a New Feature

```bash
# 1. Create a feature branch
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. Reference GAME_SYSTEMS.md for specifications
# 3. Write code in src/systems, src/logic, src/components, etc.
# 4. Test locally with npm run dev

# 5. Commit with clear messages
git add .
git commit -m "feat(scope): add feature description"

# 6. Push and create a Pull Request
git push -u origin feature/your-feature-name
```

### Merging a Feature

```bash
# 1. Create Pull Request on GitHub
# 2. Review your own code first
# 3. Link to GAME_SYSTEMS.md to show it matches specs
# 4. Merge to develop
git checkout develop
git pull origin develop
git merge --no-ff feature/your-feature-name
git push origin develop

# 5. Delete the branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### Release Checklist

```bash
# When ready for release
git checkout main
git pull origin main
git merge develop
git tag -a v1.0.0 -m "Release v1.0.0: Initial game clone"
git push origin main --tags
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `docs/GAME_SYSTEMS.md` | Complete specification of all game mechanics |
| `docs/BUILD_STEPS.md` | 23-phase step-by-step development plan |
| `docs/DEV_LOG.md` | Daily progress log |
| `.copilot-instructions.md` | GitHub Copilot system prompt |
| `src/systems/` | Game systems (state, physics, collision, etc.) |
| `src/logic/` | Pure game logic functions |
| `src/components/` | React components for rendering |
| `src/utils/` | Helper functions and utilities |

---

## Example: Building a Feature

### Scenario: Implement Player Movement

1. **Reference GAME_SYSTEMS.md**
   - Check "Movement System" section for specifications
   - Note the speed, constraints, controls

2. **Create a feature branch**
   ```bash
   git checkout -b feature/movement
   ```

3. **Create the component**
   ```bash
   # Ask Copilot: "Create a Player component that moves with arrow keys"
   # Copilot generates src/components/Player.tsx
   ```

4. **Create the logic**
   ```bash
   # Ask Copilot: "Create movement logic with boundary constraints"
   # Copilot generates src/logic/movement.ts
   ```

5. **Test locally**
   ```bash
   npm run dev
   # Try moving the player with arrow keys
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "feat(movement): implement player movement with arrow keys"
   git push -u origin feature/movement
   ```

7. **Open a PR**
   - Add description: "Implements basic player movement as specified in GAME_SYSTEMS.md"
   - Link to the relevant section in docs

8. **Merge when satisfied**
   ```bash
   git checkout develop
   git merge feature/movement
   ```

9. **Update DEV_LOG.md**
   - Note what was implemented
   - Note any issues or refinements needed

---

## GitHub Copilot Commands

Once inside VS Code with Copilot:

```
# Ask Copilot to help with specific tasks:

@copilot #file:docs/GAME_SYSTEMS.md
  How should player collision work?

@copilot create a component that renders the player sprite

@copilot refactor this code to be more modular

@copilot add comments explaining this game logic

@copilot write tests for the movement system

@copilot what edge cases should we handle for scoring?
```

---

## Development Phases

There are **23 phases** to complete the game clone:

| Phase | Steps | Focus |
|-------|-------|-------|
| 1 | 1-3 | Project Setup |
| 2 | 4-5 | Documentation & Planning |
| 3 | 6-8 | Core Systems (State, Loop, Input) |
| 4 | 9-12 | Gameplay Mechanics (Player, Movement, Collision, Scoring) |
| 5 | 13-14 | UI & Visual Systems |
| 6 | 15 | Levels & Progression |
| 7 | 16-17 | Advanced Features (Enemies, Items) |
| 8 | 18-20 | Polish & Optimization |
| 9 | 21-23 | Testing & Release |

See [docs/BUILD_STEPS.md](docs/BUILD_STEPS.md) for complete details.

---

## Best Practices

### ✅ DO

- Create small, focused commits
- Write clear commit messages
- Document code with comments
- Test frequently with `npm run dev`
- Update GAME_SYSTEMS.md as you discover new mechanics
- Update DEV_LOG.md daily
- Use feature branches
- Review your own code before merging
- Link to documentation in your PR descriptions

### ❌ DON'T

- Copy original game code
- Copy original game assets (art, music, text)
- Make large unreviewed commits
- Merge without testing
- Skip documentation
- Ignore edge cases
- Use cryptic variable names

---

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Check for linting issues
npm run lint

# Format code
npm run format
```

---

## Git Branches

**Main branches:**
- `main` — Production-ready, stable version
- `develop` — Development version, all features merged here

**Feature branches:**
- `feature/movement`
- `feature/collision`
- `feature/scoring`
- `feature/ui`
- `feature/game-state`
- etc.

**Never commit directly to `main` or `develop`** — always use feature branches and PRs.

---

## Setting Up for Copilot

1. Ensure `.copilot-instructions.md` is in the repo root
2. VS Code will automatically use this when Copilot is active
3. Reference it in your Copilot questions: `@copilot #file:.copilot-instructions.md`

---

## Data Persistence

This project includes `better-sqlite3` for local database support:

```typescript
import Database from 'better-sqlite3';

const db = new Database('game.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS high_scores (
    id INTEGER PRIMARY KEY,
    score INTEGER,
    playerName TEXT,
    level INTEGER,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert score
db.prepare('INSERT INTO high_scores (score, playerName, level) VALUES (?, ?, ?)')
  .run(1000, 'Player1', 5);

// Query scores
const scores = db.prepare('SELECT * FROM high_scores ORDER BY score DESC LIMIT 10').all();
```

---

## Troubleshooting

### Dev server won't start
```bash
npm install
npm run dev
```

### Better-sqlite3 issues
```bash
npm install --save better-sqlite3
```

### Git conflicts
```bash
git status
# Resolve conflicts manually
git add .
git commit -m "Resolve merge conflicts"
```

### Tests failing
```bash
npm run test
# Check test output for specific failures
```

---

## Resources

- **Vite Documentation:** https://vitejs.dev
- **React Documentation:** https://react.dev
- **GitHub Copilot:** https://copilot.github.com
- **Game Development Concepts:** Check `/docs`

---

## License

This project is a learning resource for game development and GitHub Copilot integration. Respect the licenses of any original games you're cloning.

---

## Support

Having issues? Check:

1. [docs/BUILD_STEPS.md](docs/BUILD_STEPS.md) — Step-by-step guidance
2. [docs/GAME_SYSTEMS.md](docs/GAME_SYSTEMS.md) — Technical specifications
3. [docs/DEV_LOG.md](docs/DEV_LOG.md) — Progress and known issues
4. GitHub Issues — Report bugs or ask for help

---

## Next Steps

1. **Define your game** — What game are you cloning?
2. **Complete GAME_SYSTEMS.md** — Document all mechanics
3. **Start Phase 1** — Follow BUILD_STEPS.md step by step
4. **Use Copilot** — Let it assist with code generation
5. **Commit regularly** — Build incrementally
6. **Have fun!** — Building games is awesome! 🎮

---

**Happy developing! 🚀**

