using UnityEngine;

/// <summary>
/// Procedurally builds a REPO robot character from primitive shapes.
/// This lets you play immediately without importing an external 3D model.
/// Attach to an empty GameObject named "REPO" and it builds the body on Awake.
/// </summary>
public class REPOModelBuilder : MonoBehaviour
{
    [Header("Body Colors")]
    [SerializeField] private Color bodyColor = new Color(0.85f, 0.85f, 0.88f);   // off-white plastic
    [SerializeField] private Color accentColor = new Color(0.1f, 0.8f, 0.95f);   // cyan glow
    [SerializeField] private Color jointColor = new Color(0.2f, 0.2f, 0.22f);    // dark joints
    [SerializeField] private Color eyeColor = new Color(0.1f, 1f, 0.6f);         // green optic

    [Header("Build Options")]
    [SerializeField] private bool buildOnAwake = true;

    private Transform body;
    private Transform head;

    private void Awake()
    {
        if (buildOnAwake)
            BuildModel();
    }

    public void BuildModel()
    {
        // Clear any existing visual children
        var existing = transform.Find("REPO_Visual");
        if (existing != null) DestroyImmediate(existing.gameObject);

        GameObject root = new GameObject("REPO_Visual");
        root.transform.SetParent(transform, false);
        root.transform.localPosition = Vector3.zero;

        Material bodyMat = MakeMaterial(bodyColor, false);
        Material accentMat = MakeMaterial(accentColor, true);
        Material jointMat = MakeMaterial(jointColor, false);
        Material eyeMat = MakeMaterial(eyeColor, true);

        // --- TORSO (rounded box) ---
        body = CreatePart(root.transform, "Torso", PrimitiveType.Cube, bodyMat,
            new Vector3(0, 1.0f, 0), new Vector3(0.7f, 0.9f, 0.5f));

        // --- CHEST PANEL (accent) ---
        CreatePart(body, "ChestPanel", PrimitiveType.Cube, accentMat,
            new Vector3(0, 0.1f, 0.51f * 0.5f / 0.5f), new Vector3(0.4f, 0.4f, 0.05f));

        // --- HEAD (sphere/dome) ---
        head = CreatePart(root.transform, "Head", PrimitiveType.Sphere, bodyMat,
            new Vector3(0, 1.65f, 0), new Vector3(0.5f, 0.45f, 0.5f));

        // --- EYE / OPTIC (glowing) ---
        CreatePart(head, "Optic", PrimitiveType.Sphere, eyeMat,
            new Vector3(0, 0, 0.45f), new Vector3(0.5f, 0.5f, 0.35f));

        // --- ANTENNA ---
        var antenna = CreatePart(head, "Antenna", PrimitiveType.Cylinder, jointMat,
            new Vector3(0.15f, 0.6f, 0), new Vector3(0.04f, 0.25f, 0.04f));
        CreatePart(antenna, "AntennaTip", PrimitiveType.Sphere, accentMat,
            new Vector3(0, 1.0f, 0), new Vector3(0.6f, 0.6f, 0.6f));

        // --- SHOULDERS + ARMS ---
        BuildArm(root.transform, "LeftArm", -1, bodyMat, jointMat);
        BuildArm(root.transform, "RightArm", 1, bodyMat, jointMat);

        // --- LEGS ---
        BuildLeg(root.transform, "LeftLeg", -1, bodyMat, jointMat);
        BuildLeg(root.transform, "RightLeg", 1, bodyMat, jointMat);

        Debug.Log("REPO model built from primitives.");
    }

    private void BuildArm(Transform parent, string name, int side, Material bodyMat, Material jointMat)
    {
        var shoulder = CreatePart(parent, name + "_Shoulder", PrimitiveType.Sphere, jointMat,
            new Vector3(0.45f * side, 1.25f, 0), new Vector3(0.22f, 0.22f, 0.22f));
        CreatePart(shoulder, name + "_Upper", PrimitiveType.Capsule, bodyMat,
            new Vector3(0.2f * side, -0.5f, 0), new Vector3(0.5f, 0.6f, 0.5f));
    }

    private void BuildLeg(Transform parent, string name, int side, Material bodyMat, Material jointMat)
    {
        var hip = CreatePart(parent, name + "_Hip", PrimitiveType.Sphere, jointMat,
            new Vector3(0.2f * side, 0.55f, 0), new Vector3(0.22f, 0.22f, 0.22f));
        var leg = CreatePart(hip, name + "_Lower", PrimitiveType.Capsule, bodyMat,
            new Vector3(0, -1.1f, 0), new Vector3(1.1f, 1.1f, 1.1f));
        CreatePart(leg, name + "_Foot", PrimitiveType.Cube, jointMat,
            new Vector3(0, -0.6f, 0.15f), new Vector3(1.0f, 0.25f, 1.6f));
    }

    private Transform CreatePart(Transform parent, string name, PrimitiveType type,
        Material mat, Vector3 localPos, Vector3 localScale)
    {
        GameObject part = GameObject.CreatePrimitive(type);
        part.name = name;
        // Remove individual colliders (CharacterController handles collision)
        var col = part.GetComponent<Collider>();
        if (col != null) Destroy(col);
        part.transform.SetParent(parent, false);
        part.transform.localPosition = localPos;
        part.transform.localScale = localScale;
        part.GetComponent<Renderer>().sharedMaterial = mat;
        return part.transform;
    }

    private Material MakeMaterial(Color color, bool emissive)
    {
        // Works with both Built-in and URP standard shaders
        Shader shader = Shader.Find("Universal Render Pipeline/Lit");
        if (shader == null) shader = Shader.Find("Standard");
        Material mat = new Material(shader);
        mat.color = color;
        if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", color);
        if (emissive)
        {
            mat.EnableKeyword("_EMISSION");
            if (mat.HasProperty("_EmissionColor")) mat.SetColor("_EmissionColor", color * 1.5f);
        }
        return mat;
    }
}
