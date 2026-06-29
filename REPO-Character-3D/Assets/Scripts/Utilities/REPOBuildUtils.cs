using UnityEngine;

/// <summary>
/// Shared helpers for procedurally building the REPO game world.
/// </summary>
public static class REPOBuildUtils
{
    public static Material MakeMat(Color color, bool emissive = false)
    {
        Shader shader = Shader.Find("Universal Render Pipeline/Lit");
        if (shader == null) shader = Shader.Find("Standard");
        Material mat = new Material(shader);
        mat.color = color;
        if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", color);
        if (emissive)
        {
            mat.EnableKeyword("_EMISSION");
            if (mat.HasProperty("_EmissionColor")) mat.SetColor("_EmissionColor", color * 1.4f);
        }
        return mat;
    }

    public static GameObject CreateBox(string name, Vector3 pos, Vector3 scale, Color color, Transform parent = null)
    {
        GameObject box = GameObject.CreatePrimitive(PrimitiveType.Cube);
        box.name = name;
        if (parent != null) box.transform.SetParent(parent, false);
        box.transform.position = pos;
        box.transform.localScale = scale;
        box.GetComponent<Renderer>().sharedMaterial = MakeMat(color);
        return box;
    }

    /// <summary>Visual-only primitive with its collider removed.</summary>
    public static Transform CreateVisual(Transform parent, string name, PrimitiveType type,
        Material mat, Vector3 localPos, Vector3 localScale)
    {
        GameObject part = GameObject.CreatePrimitive(type);
        part.name = name;
        var col = part.GetComponent<Collider>();
        if (col != null) Object.Destroy(col);
        part.transform.SetParent(parent, false);
        part.transform.localPosition = localPos;
        part.transform.localScale = localScale;
        part.GetComponent<Renderer>().sharedMaterial = mat;
        return part.transform;
    }

    /// <summary>Builds a runtime sprite (white) for UI fill bars.</summary>
    public static Sprite WhiteSprite()
    {
        Texture2D tex = new Texture2D(4, 4);
        Color[] px = new Color[16];
        for (int i = 0; i < px.Length; i++) px[i] = Color.white;
        tex.SetPixels(px);
        tex.Apply();
        return Sprite.Create(tex, new Rect(0, 0, 4, 4), new Vector2(0.5f, 0.5f));
    }

    public static Font BuiltinFont()
    {
        Font f = null;
        try { f = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); } catch { }
        if (f == null) { try { f = Resources.GetBuiltinResource<Font>("Arial.ttf"); } catch { } }
        return f;
    }
}
