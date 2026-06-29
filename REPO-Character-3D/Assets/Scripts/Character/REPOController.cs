using UnityEngine;

/// <summary>
/// Main coordinator for REPO character system
/// Links all subsystems: Movement, Health, Battery, Sensor, Interaction, Camera
/// </summary>
public class REPOController : MonoBehaviour
{
    [Header("Components")]
    private REPOMovement movement;
    private REPOHealth health;
    private REPOBattery battery;
    private REPOSensor sensor;
    private REPOInteraction interaction;
    private REPOCameraController cameraController;

    [Header("Status")]
    [SerializeField] private bool isInitialized = false;
    public bool IsAlive => health.IsAlive;
    public float CurrentEnergy => battery.CurrentEnergy;
    public float CurrentHealth => health.CurrentHealth;

    private void Awake()
    {
        Initialize();
    }

    private void Initialize()
    {
        if (isInitialized) return;

        // Get or create components
        movement = GetComponent<REPOMovement>() ?? gameObject.AddComponent<REPOMovement>();
        health = GetComponent<REPOHealth>() ?? gameObject.AddComponent<REPOHealth>();
        battery = GetComponent<REPOBattery>() ?? gameObject.AddComponent<REPOBattery>();
        sensor = GetComponent<REPOSensor>() ?? gameObject.AddComponent<REPOSensor>();
        interaction = GetComponent<REPOInteraction>() ?? gameObject.AddComponent<REPOInteraction>();
        cameraController = GetComponentInChildren<REPOCameraController>() ?? FindObjectOfType<REPOCameraController>();

        // Initialize systems
        health.Initialize(maxHealth: 100);
        battery.Initialize(maxEnergy: 100);

        isInitialized = true;
        Debug.Log("REPO Systems initialized successfully!");
    }

    private void Update()
    {
        if (!isInitialized) return;

        // Update all systems
        movement.UpdateMovement(Time.deltaTime);
        sensor.UpdateSensor(Time.deltaTime);
        interaction.UpdateNearbyInteractable();
        battery.DrainEnergy(Time.deltaTime);

        // Handle scan input (Q)
        if (InputManager.Instance != null && InputManager.Instance.GetScan())
            sensor.AttemptScan();
    }

    // Getters
    public REPOMovement GetMovement() => movement;
    public REPOHealth GetHealth() => health;
    public REPOBattery GetBattery() => battery;
    public REPOSensor GetSensor() => sensor;
    public REPOInteraction GetInteraction() => interaction;
    public REPOCameraController GetCamera() => cameraController;

    public void TakeDamage(float amount)
    {
        health.TakeDamage(amount);
    }

    public void Repair(float amount)
    {
        health.Repair(amount);
    }
}
