using UnityEngine;

/// <summary>
/// Battery/Energy management system for REPO
/// Tracks energy drain based on activity, applies speed penalties at low energy
/// </summary>
public class REPOBattery : MonoBehaviour
{
    [Header("Energy Parameters")]
    [SerializeField] private float maxEnergy = 100f;
    [SerializeField] private float idleDrainRate = 0.5f;
    [SerializeField] private float walkDrainRate = 2f;
    [SerializeField] private float sprintDrainRate = 5f;
    [SerializeField] private float scanDrainCost = 5f;

    [Header("Battery Thresholds")]
    [SerializeField] private float lowBatteryThreshold = 20f;
    [SerializeField] private float criticalThreshold = 5f;
    [SerializeField] private float lowBatterySpeedPenalty = 0.7f;
    [SerializeField] private float criticalSpeedPenalty = 0.5f;

    private float currentEnergy;
    private REPOMovement movement;

    public float CurrentEnergy => currentEnergy;
    public float EnergyPercent => currentEnergy / maxEnergy;

    public void Initialize(float max)
    {
        maxEnergy = max;
        currentEnergy = maxEnergy;
        movement = GetComponent<REPOMovement>();
    }

    public void DrainEnergy(float deltaTime)
    {
        if (currentEnergy <= 0) return;

        float drainRate = idleDrainRate;

        if (movement != null)
        {
            if (movement.IsSprinting)
                drainRate = sprintDrainRate;
            else if (movement.CurrentSpeed > 0.1f)
                drainRate = walkDrainRate;
        }

        currentEnergy -= drainRate * deltaTime;
        currentEnergy = Mathf.Max(currentEnergy, 0);

        ApplySpeedPenalty();
    }

    private void ApplySpeedPenalty()
    {
        if (movement == null) return;

        if (currentEnergy <= criticalThreshold)
            movement.SetSpeedMultiplier(criticalSpeedPenalty);
        else if (currentEnergy <= lowBatteryThreshold)
            movement.SetSpeedMultiplier(lowBatterySpeedPenalty);
        else
            movement.SetSpeedMultiplier(1f);
    }

    public void ChargeEnergy(float amount)
    {
        currentEnergy = Mathf.Min(currentEnergy + amount, maxEnergy);
    }

    public void FullCharge()
    {
        currentEnergy = maxEnergy;
    }

    public bool CanScan()
    {
        return currentEnergy >= scanDrainCost;
    }

    public void CostScan()
    {
        if (CanScan())
            currentEnergy -= scanDrainCost;
    }

    public bool IsLowBattery => currentEnergy <= lowBatteryThreshold;
    public bool IsCritical => currentEnergy <= criticalThreshold;
}
