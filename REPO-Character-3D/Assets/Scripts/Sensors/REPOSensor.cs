using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Scanning and analysis system for REPO
/// </summary>
public class REPOSensor : MonoBehaviour
{
    [Header("Scan Parameters")]
    [SerializeField] private float scanRange = 15f;
    [SerializeField] private float scanRadius = 1f;
    [SerializeField] private float scanCone = 45f;
    [SerializeField] private float scanCooldown = 0.5f;

    private float scanTimer = 0f;
    private REPOBattery battery;

    public struct ScanData
    {
        public string objectID;
        public string objectName;
        public string objectType;
        public float distance;
        public string description;
    }

    private void Start()
    {
        battery = GetComponent<REPOBattery>();
    }

    public void UpdateSensor(float deltaTime)
    {
        scanTimer -= deltaTime;
    }

    public bool AttemptScan()
    {
        if (scanTimer > 0) return false;
        if (battery != null && !battery.CanScan()) return false;

        PerformScan();
        scanTimer = scanCooldown;
        battery?.CostScan();
        return true;
    }

    private void PerformScan()
    {
        Camera mainCamera = Camera.main;
        if (mainCamera == null) return;

        Vector3 scanOrigin = mainCamera.transform.position;
        Vector3 scanDirection = mainCamera.transform.forward;

        Collider[] nearbyObjects = Physics.OverlapSphere(transform.position + scanDirection * (scanRange * 0.5f), scanRadius);
        
        Debug.Log($"REPO Scan complete. Found {nearbyObjects.Length} objects.");
    }

    public ScanData GetNearestScannable()
    {
        Camera mainCamera = Camera.main;
        Vector3 scanOrigin = mainCamera ? mainCamera.transform.position : transform.position;
        Vector3 scanDirection = mainCamera ? mainCamera.transform.forward : transform.forward;

        Collider[] nearby = Physics.OverlapSphere(scanOrigin + scanDirection * scanRange * 0.5f, scanRadius);
        
        if (nearby.Length == 0)
            return new ScanData { objectName = "Nothing found" };

        return new ScanData { objectName = nearby[0].name, distance = Vector3.Distance(transform.position, nearby[0].transform.position) };
    }
}
