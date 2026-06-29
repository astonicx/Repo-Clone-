using UnityEngine;

/// <summary>
/// One-click scene bootstrapper for REPO.
/// Place this on a single empty GameObject in an empty scene, press Play,
/// and it builds the entire playable game: ground, lights, REPO character,
/// camera, input manager, and a few interactables.
/// </summary>
public class REPOGameBootstrap : MonoBehaviour
{
    [Header("World")]
    [SerializeField] private float groundSize = 40f;
    [SerializeField] private Color groundColor = new Color(0.18f, 0.2f, 0.24f);

    [Header("Auto Start")]
    [Tooltip("If true, the game auto-builds on Play even in an empty scene.")]
    public static bool AutoStartEnabled = true;

    /// <summary>
    /// Runs automatically when entering Play mode. If no bootstrap exists in the
    /// scene, one is created so the game is instantly playable from any scene.
    /// </summary>
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void AutoBootstrap()
    {
        if (!AutoStartEnabled) return;
        if (FindObjectOfType<REPOGameBootstrap>() != null) return;
        // Only auto-build if the scene has no existing REPO character
        if (FindObjectOfType<REPOController>() != null) return;

        GameObject go = new GameObject("REPO_GameBootstrap");
        go.AddComponent<REPOGameBootstrap>();
    }

    private void Awake()
    {
        BuildWorld();
        BuildInputManager();
        GameObject repo = BuildCharacter();
        BuildCamera(repo);
        BuildInteractables();
        LockCursor();
    }

    private void BuildWorld()
    {
        // Ground
        GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "Ground";
        ground.transform.localScale = new Vector3(groundSize / 10f, 1, groundSize / 10f);
        ground.GetComponent<Renderer>().sharedMaterial = MakeMat(groundColor);

        // A few walls/obstacles
        CreateBox("Wall_N", new Vector3(0, 1.5f, groundSize / 2f), new Vector3(groundSize, 3, 0.5f), new Color(0.3f, 0.33f, 0.38f));
        CreateBox("Wall_S", new Vector3(0, 1.5f, -groundSize / 2f), new Vector3(groundSize, 3, 0.5f), new Color(0.3f, 0.33f, 0.38f));
        CreateBox("Wall_E", new Vector3(groundSize / 2f, 1.5f, 0), new Vector3(0.5f, 3, groundSize), new Color(0.3f, 0.33f, 0.38f));
        CreateBox("Wall_W", new Vector3(-groundSize / 2f, 1.5f, 0), new Vector3(0.5f, 3, groundSize), new Color(0.3f, 0.33f, 0.38f));

        CreateBox("Crate1", new Vector3(5, 0.75f, 4), new Vector3(1.5f, 1.5f, 1.5f), new Color(0.5f, 0.4f, 0.25f));
        CreateBox("Crate2", new Vector3(-6, 0.75f, 7), new Vector3(1.5f, 1.5f, 1.5f), new Color(0.5f, 0.4f, 0.25f));
        CreateBox("Ramp", new Vector3(8, 0.5f, -5), new Vector3(4, 0.3f, 4), new Color(0.4f, 0.42f, 0.45f));

        // Lighting
        GameObject lightObj = new GameObject("Directional Light");
        Light light = lightObj.AddComponent<Light>();
        light.type = LightType.Directional;
        light.color = new Color(1f, 0.96f, 0.84f);
        light.intensity = 1.1f;
        light.shadows = LightShadows.Soft;
        lightObj.transform.rotation = Quaternion.Euler(50, -30, 0);

        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.3f, 0.32f, 0.38f);
    }

    private void BuildInputManager()
    {
        if (FindObjectOfType<InputManager>() == null)
        {
            GameObject im = new GameObject("InputManager");
            im.AddComponent<InputManager>();
        }
    }

    private GameObject BuildCharacter()
    {
        GameObject repo = new GameObject("REPO");
        repo.transform.position = new Vector3(0, 1.1f, 0);

        // Collision capsule
        CharacterController cc = repo.AddComponent<CharacterController>();
        cc.height = 2.2f;
        cc.radius = 0.45f;
        cc.center = new Vector3(0, 1.1f, 0);

        // Visual model from primitives
        repo.AddComponent<REPOModelBuilder>();

        // Game systems
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

    private void BuildInteractables()
    {
        // Charging station (green pad)
        GameObject pad = GameObject.CreatePrimitive(PrimitiveType.Cube);
        pad.name = "ChargingStation";
        pad.transform.position = new Vector3(-8, 0.25f, -8);
        pad.transform.localScale = new Vector3(2, 0.5f, 2);
        pad.GetComponent<Renderer>().sharedMaterial = MakeMat(new Color(0.1f, 0.9f, 0.4f), true);
        pad.AddComponent<InteractableChargingStation>();

        // Door (blue panel)
        GameObject door = GameObject.CreatePrimitive(PrimitiveType.Cube);
        door.name = "Door";
        door.transform.position = new Vector3(10, 1.5f, 8);
        door.transform.localScale = new Vector3(2, 3, 0.3f);
        door.GetComponent<Renderer>().sharedMaterial = MakeMat(new Color(0.2f, 0.5f, 0.95f), true);
        door.AddComponent<InteractableDoor>();
    }

    private void CreateBox(string name, Vector3 pos, Vector3 scale, Color color)
    {
        GameObject box = GameObject.CreatePrimitive(PrimitiveType.Cube);
        box.name = name;
        box.transform.position = pos;
        box.transform.localScale = scale;
        box.GetComponent<Renderer>().sharedMaterial = MakeMat(color);
    }

    private Material MakeMat(Color color, bool emissive = false)
    {
        Shader shader = Shader.Find("Universal Render Pipeline/Lit");
        if (shader == null) shader = Shader.Find("Standard");
        Material mat = new Material(shader);
        mat.color = color;
        if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", color);
        if (emissive)
        {
            mat.EnableKeyword("_EMISSION");
            if (mat.HasProperty("_EmissionColor")) mat.SetColor("_EmissionColor", color * 1.2f);
        }
        return mat;
    }

    private void LockCursor()
    {
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }
}
