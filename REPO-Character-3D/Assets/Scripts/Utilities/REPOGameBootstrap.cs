using UnityEngine;

/// <summary>
/// Assembles the full REPO game at runtime: multi-room level, player robot,
/// camera, HUD, game manager, enemies, loot and objectives.
/// Pressing Play in any scene builds the entire playable game.
/// </summary>
public class REPOGameBootstrap : MonoBehaviour
{
    private void Awake()
    {
        // 1. Core managers
        BuildInputManager();
        GameObject gmObj = new GameObject("GameManager");
        gmObj.AddComponent<GameManager>();

        // 2. Level (rooms, walls, loot, enemies, exit, lighting)
        LevelBuilder level = new LevelBuilder();
        level.Build();

        // 3. Player
        GameObject repo = BuildCharacter(level.PlayerSpawn);

        // 4. Camera
        BuildCamera(repo);

        // 5. HUD
        GameObject hud = new GameObject("HUDManager");
        hud.AddComponent<HUDManager>();

        LockCursor();
    }

    private void BuildInputManager()
    {
        if (FindObjectOfType<InputManager>() == null)
        {
            GameObject im = new GameObject("InputManager");
            im.AddComponent<InputManager>();
        }
    }

    private GameObject BuildCharacter(Vector3 spawn)
    {
        GameObject repo = new GameObject("REPO");
        repo.transform.position = spawn;

        CharacterController cc = repo.AddComponent<CharacterController>();
        cc.height = 2.2f;
        cc.radius = 0.45f;
        cc.center = new Vector3(0, 1.1f, 0);

        repo.AddComponent<REPOModelBuilder>();
        repo.AddComponent<REPOMovement>();
        repo.AddComponent<REPOHealth>();
        repo.AddComponent<REPOBattery>();
        repo.AddComponent<REPOSensor>();
        repo.AddComponent<REPOInteraction>();
        repo.AddComponent<REPOController>();

        return repo;
    }

    private void BuildCamera(GameObject repo)
    {
        GameObject camObj = Camera.main != null ? Camera.main.gameObject : new GameObject("Main Camera");
        if (camObj.GetComponent<Camera>() == null) camObj.AddComponent<Camera>();
        if (camObj.GetComponent<AudioListener>() == null) camObj.AddComponent<AudioListener>();
        camObj.tag = "MainCamera";

        REPOCameraController camCtrl = camObj.GetComponent<REPOCameraController>();
        if (camCtrl == null) camCtrl = camObj.AddComponent<REPOCameraController>();
        camCtrl.SetTarget(repo.transform);

        camObj.transform.position = repo.transform.position + new Vector3(0, 2, -4);
    }

    private void LockCursor()
    {
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }
}
