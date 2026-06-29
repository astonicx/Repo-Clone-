# REPO Character - Unity Project Setup

## Quick Start

### Option 1: Open with Unity Hub (Recommended)
1. **Open Unity Hub**
2. Click **"Add"** → Select `/workspaces/Repo-Clone-/REPO-Character-3D` folder
3. **Open with Unity 2023.2 LTS** (or newer)
4. Wait for project import (first time may take 2-3 minutes)
5. Open scene: `Assets/Scenes/TestScene.unity`
6. Click **Play** ▶️
## ⚡ ZERO-SETUP PLAY (No manual scene building!)

This project now **auto-builds the entire game when you press Play**.

1. Open the project in Unity 2023.2 LTS
2. Open **any** scene (or just the empty `Assets/Scenes/TestScene.unity`)
3. Press **Play** ▶️

A script (`REPOGameBootstrap.cs`) runs automatically and creates:
- ✅ Ground, walls, crates, and a ramp
- ✅ The **REPO robot** (built from primitive shapes — white body, cyan accents, glowing green optic, antenna)
- ✅ Third-person camera that follows REPO
- ✅ Lighting
- ✅ A green **charging station** and a blue **door** you can interact with
- ✅ InputManager

You can immediately:
- **WASD** to walk, **Shift** to sprint, **Space** to jump
- **Move mouse** to orbit the camera, **scroll** to zoom
- **Q** to scan, **E** to interact (face the door/charging pad)

> Want to use your own 3D model instead of the primitive robot? Import an
> `.fbx` into `Assets/Models/REPO/`, drop it in the scene, add the REPO
> scripts to it, and set `REPOGameBootstrap.AutoStartEnabled = false`.

### Option 2: Open from File System
1. Copy `/workspaces/Repo-Clone-/REPO-Character-3D` to your local machine
2. Open Unity → **Open Project** → Navigate to folder
3. Select the folder and open with Unity 2023.2 LTS or newer
---

## Project Structure

```
REPO-Character-3D/
├── Assets/
│   ├── Scripts/
│   │   ├── Character/
│   │   │   ├── REPOController.cs       ← Main system coordinator
│   │   │   ├── REPOMovement.cs         ← WASD movement + physics
│   │   │   ├── REPOHealth.cs           ← Health/damage system
│   │   │   └── REPOCameraController.cs ← Third-person camera
│   │   ├── Sensors/
│   │   │   └── REPOSensor.cs           ← Scanning system
│   │   ├── Interaction/
│   │   │   └── REPOInteraction.cs      ← World interaction
│   │   └── Utilities/
│   │       └── InputManager.cs         ← Input mapping
│   ├── Reference/
│   │   ├── image1.webp  ← Character design reference
│   │   ├── image2.webp  ← Character details reference
│   │   └── image3.webp  ← Gameplay reference
│   ├── Scenes/
│   │   └── TestScene.unity ← Test level
│   └── Materials/          ← Character materials (coming soon)
├── Docs/
│   ├── CharacterVisualReference.md     ← Design specs
│   └── GameplayActionsReference.md     ← Gameplay reference
└── ProjectSettings/                     ← Unity project config
```

---

## Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move |
| **Space** | Jump |
| **Shift** | Sprint |
| **Q** | Scan |
| **E** | Interact |
| **Mouse** | Look around (drag) |
| **Scroll** | Zoom camera |
| **Tab** | Toggle minimap |
| **Esc** | Pause |

---

## Setting Up Scene in Unity

### Step 1: Create Ground Plane
1. In Hierarchy, right-click → **3D Object → Plane**
2. Scale it up (scale: 10, 10, 1)
3. Add **Material** → Set to gray color
4. Add **Box Collider**

### Step 2: Add REPO Character
1. Right-click Hierarchy → **3D Object → Capsule**
2. Name it **"REPO"**
3. Add these scripts:
   - `REPOController.cs`
   - `REPOMovement.cs`
   - `REPOHealth.cs`
   - `REPOBattery.cs`
   - `REPOSensor.cs`
   - `REPOInteraction.cs`
4. Add components:
   - **Character Controller** (assign to movement script)
   - **Animator** (will add animations later)

### Step 3: Add Camera
1. Create empty GameObject called **"CameraRoot"**
2. Parent it under REPO
3. Add script: `REPOCameraController.cs`
4. Assign Main Camera as child

### Step 4: Add InputManager
1. Create empty GameObject called **"InputManager"**
2. Add script: `InputManager.cs`

### Step 5: Add Lighting
1. **Lighting Settings** → Use default scene lighting or
2. Add directional light at angle (0, 45, 0)

### Step 6: Play!
1. Click **Play** ▶️
2. Use WASD to move
3. Use Mouse to look around
4. Press Q to scan
5. Press E to interact

---

## Connecting Reference Images to Character Design

### Using Reference Images

The three reference images in `Assets/Reference/` show:
- **image1.webp** → Character appearance and proportions
- **image2.webp** → Character details and materials
- **image3.webp** → Gameplay actions and poses

### Steps to Create 3D Model:

1. **View References**
   - Open all three `.webp` files from `Assets/Reference/`
   - Study the character design, colors, and proportions

2. **Option A: Import 3D Model**
   - If you have a `.fbx` or `.obj` file of REPO, place it in `Assets/Models/REPO/`
   - Unity will auto-import it
   - Create prefab and test in scene

3. **Option B: Create in Blender**
   - Open Blender
   - Use reference images as background guides
   - Model REPO based on the design
   - Export as `.fbx` to `Assets/Models/REPO/`
   - Return to Unity and test

4. **Option C: Use Generated Model**
   - Describe the reference images (colors, proportions, materials)
   - I can generate a `.fbx` file using AI modeling tools

---

## Battery/Energy System

The battery drains based on activity:
- **Idle:** 0.5 energy/sec
- **Walk:** 2 energy/sec
- **Sprint:** 5 energy/sec
- **Scan:** 5 energy cost per scan

At low battery (<20%): Speed reduced to 70%
At critical (<5%): Speed reduced to 50%

---

## Next Steps

1. ✅ Project structure created
2. ✅ Core systems scripted (Movement, Health, Battery, Sensor, Interaction)
3. ⏳ **Import/Create 3D Model** - Based on reference images
4. ⏳ Create animations (Idle, Walk, Run, Jump, Scan, Interact)
5. ⏳ Build test level with interactables
6. ⏳ Create UI/HUD for battery and health display

---

## Troubleshooting

**Scripts not compiling?**
- Ensure all scripts are in correct folders
- Check that InputManager is a singleton in scene

**Character moving slow/fast?**
- Adjust `walkSpeed` and `runSpeed` in REPOMovement
- Check `acceleration` and `deceleration` values

**Camera not following?**
- Ensure REPOCameraController is attached to a child object
- Set `target` to the REPO capsule

**Character falling through floor?**
- Check that ground plane has **Box Collider**
- Ensure character has **Character Controller** component

---

## How to Use in Remote VS Code + Unity

Since you're in remote VS Code, you have two options:

### Option 1: Use VS Code as Script Editor (RECOMMENDED)
1. Open the project in Unity on local machine
2. Set **Edit → Preferences → External Tools → External Script Editor** to **"Visual Studio Code"**
3. Open scripts from Unity → they'll open in remote VS Code
4. Edit scripts, save, and return to Unity
5. Click Play

### Option 2: Use VS Code Terminal + Unity CLI
1. Generate builds from terminal:
   ```bash
   /Applications/Unity/Hub/Editors/2023.2.20f1/Unity.app/Contents/MacOS/Unity \
     -projectPath "/path/to/REPO-Character-3D" \
     -executeMethod UnityEditor.SceneHierarchyHooks.UpdateHierarchyItem \
     -quit -batchmode
   ```

---

**Ready to test?** Open `/workspaces/Repo-Clone-/REPO-Character-3D` in Unity and hit Play! 🎮
