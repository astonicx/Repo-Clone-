using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Runtime-built heads-up display: health bar, battery bar, objective text,
/// crosshair, and win/lose overlay. No prefabs or scene setup required.
/// </summary>
public class HUDManager : MonoBehaviour
{
    private REPOHealth health;
    private REPOBattery battery;

    private Image healthFill;
    private Image batteryFill;
    private Text objectiveText;
    private Text centerText;
    private Text hintText;
    private GameObject overlay;

    private Sprite whiteSprite;
    private Font font;

    private void Start()
    {
        var player = FindObjectOfType<REPOController>();
        if (player != null)
        {
            health = player.GetComponent<REPOHealth>();
            battery = player.GetComponent<REPOBattery>();
        }

        whiteSprite = REPOBuildUtils.WhiteSprite();
        font = REPOBuildUtils.BuiltinFont();

        BuildCanvas();
    }

    private void Update()
    {
        // Health bar
        if (health != null && healthFill != null)
            healthFill.fillAmount = Mathf.Clamp01(health.HealthPercent);

        // Battery bar
        if (battery != null && batteryFill != null)
        {
            float p = Mathf.Clamp01(battery.EnergyPercent);
            batteryFill.fillAmount = p;
            batteryFill.color = battery.IsCritical ? new Color(1f, 0.2f, 0.2f)
                              : battery.IsLowBattery ? new Color(1f, 0.7f, 0.1f)
                              : new Color(0.1f, 0.85f, 1f);
        }

        // Objectives + state
        var gm = GameManager.Instance;
        if (gm != null)
        {
            if (objectiveText != null)
            {
                if (gm.AllLootCollected)
                    objectiveText.text = "Loot " + gm.LootCollected + "/" + gm.LootTotal + "  —  REACH THE EXIT (blue pad)";
                else
                    objectiveText.text = "Collect loot:  " + gm.LootCollected + "/" + gm.LootTotal;
            }

            if (gm.State == GameManager.GameState.Won)
                ShowOverlay("MISSION COMPLETE", new Color(0.3f, 1f, 0.5f));
            else if (gm.State == GameManager.GameState.Lost)
                ShowOverlay("MISSION FAILED", new Color(1f, 0.3f, 0.3f));
            else
                HideOverlay();
        }
    }

    private void BuildCanvas()
    {
        GameObject canvasGO = new GameObject("HUD_Canvas");
        canvasGO.transform.SetParent(transform, false);
        Canvas canvas = canvasGO.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        CanvasScaler scaler = canvasGO.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        canvasGO.AddComponent<GraphicRaycaster>();

        Transform parent = canvasGO.transform;

        // --- Health bar (top-left) ---
        MakeLabel(parent, "HP", new Vector2(30, -30), new Vector2(120, 30), "HEALTH", 22, TextAnchor.MiddleLeft);
        MakeBarBackground(parent, new Vector2(30, -60), new Vector2(360, 26));
        healthFill = MakeBarFill(parent, new Vector2(33, -63), new Vector2(354, 20), new Color(0.9f, 0.25f, 0.25f));

        // --- Battery bar (below health) ---
        MakeLabel(parent, "BAT", new Vector2(30, -96), new Vector2(120, 30), "BATTERY", 22, TextAnchor.MiddleLeft);
        MakeBarBackground(parent, new Vector2(30, -126), new Vector2(360, 26));
        batteryFill = MakeBarFill(parent, new Vector2(33, -129), new Vector2(354, 20), new Color(0.1f, 0.85f, 1f));

        // --- Objective text (top-center) ---
        objectiveText = MakeLabel(parent, "Objective", new Vector2(0, -34), new Vector2(900, 40),
            "Collect loot: 0/0", 26, TextAnchor.MiddleCenter);
        SetAnchor(objectiveText.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f));
        objectiveText.rectTransform.anchoredPosition = new Vector2(0, -34);

        // --- Crosshair (center) ---
        Image dot = MakeImage(parent, "Crosshair", new Vector2(0, 0), new Vector2(6, 6), Color.white);
        SetAnchor(dot.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f));
        dot.rectTransform.anchoredPosition = Vector2.zero;

        // --- Controls hint (bottom-left) ---
        hintText = MakeLabel(parent, "Hint", new Vector2(30, 30), new Vector2(700, 30),
            "WASD move · Shift sprint · Space jump · Q scan · E interact · Mouse look", 18, TextAnchor.LowerLeft);
        SetAnchor(hintText.rectTransform, new Vector2(0f, 0f), new Vector2(0f, 0f), new Vector2(0f, 0f));
        hintText.rectTransform.anchoredPosition = new Vector2(30, 30);

        // --- Win/Lose overlay (hidden) ---
        overlay = new GameObject("Overlay");
        overlay.transform.SetParent(parent, false);
        Image bg = overlay.AddComponent<Image>();
        bg.sprite = whiteSprite;
        bg.color = new Color(0, 0, 0, 0.7f);
        RectTransform bgRT = bg.rectTransform;
        bgRT.anchorMin = Vector2.zero; bgRT.anchorMax = Vector2.one;
        bgRT.offsetMin = Vector2.zero; bgRT.offsetMax = Vector2.zero;

        centerText = MakeLabel(overlay.transform, "CenterText", Vector2.zero, new Vector2(1000, 120),
            "", 64, TextAnchor.MiddleCenter);
        SetAnchor(centerText.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f));
        centerText.rectTransform.anchoredPosition = new Vector2(0, 30);

        Text restart = MakeLabel(overlay.transform, "Restart", Vector2.zero, new Vector2(1000, 50),
            "Press R to restart", 28, TextAnchor.MiddleCenter);
        SetAnchor(restart.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f));
        restart.rectTransform.anchoredPosition = new Vector2(0, -60);

        overlay.SetActive(false);
    }

    private void ShowOverlay(string message, Color color)
    {
        if (overlay == null) return;
        overlay.SetActive(true);
        if (centerText != null)
        {
            centerText.text = message;
            centerText.color = color;
        }
    }

    private void HideOverlay()
    {
        if (overlay != null && overlay.activeSelf)
            overlay.SetActive(false);
    }

    // ---------- UI builder helpers ----------

    private void MakeBarBackground(Transform parent, Vector2 topLeftPos, Vector2 size)
    {
        Image bg = MakeImage(parent, "BarBG", topLeftPos, size, new Color(0, 0, 0, 0.6f));
    }

    private Image MakeBarFill(Transform parent, Vector2 topLeftPos, Vector2 size, Color color)
    {
        Image img = MakeImage(parent, "BarFill", topLeftPos, size, color);
        img.type = Image.Type.Filled;
        img.fillMethod = Image.FillMethod.Horizontal;
        img.fillOrigin = (int)Image.OriginHorizontal.Left;
        img.fillAmount = 1f;
        return img;
    }

    private Image MakeImage(Transform parent, string name, Vector2 topLeftPos, Vector2 size, Color color)
    {
        GameObject go = new GameObject(name);
        go.transform.SetParent(parent, false);
        Image img = go.AddComponent<Image>();
        img.sprite = whiteSprite;
        img.color = color;
        RectTransform rt = img.rectTransform;
        SetAnchor(rt, new Vector2(0, 1), new Vector2(0, 1), new Vector2(0, 1));
        rt.sizeDelta = size;
        rt.anchoredPosition = topLeftPos;
        return img;
    }

    private Text MakeLabel(Transform parent, string name, Vector2 topLeftPos, Vector2 size,
        string text, int fontSize, TextAnchor align)
    {
        GameObject go = new GameObject(name);
        go.transform.SetParent(parent, false);
        Text t = go.AddComponent<Text>();
        t.text = text;
        t.font = font;
        t.fontSize = fontSize;
        t.alignment = align;
        t.color = Color.white;
        t.horizontalOverflow = HorizontalWrapMode.Overflow;
        t.verticalOverflow = VerticalWrapMode.Overflow;
        RectTransform rt = t.rectTransform;
        SetAnchor(rt, new Vector2(0, 1), new Vector2(0, 1), new Vector2(0, 1));
        rt.sizeDelta = size;
        rt.anchoredPosition = topLeftPos;
        return t;
    }

    private void SetAnchor(RectTransform rt, Vector2 min, Vector2 max, Vector2 pivot)
    {
        rt.anchorMin = min;
        rt.anchorMax = max;
        rt.pivot = pivot;
    }
}
