using UnityEngine;

/// <summary>
/// Extraction zone. When the player enters AND all loot is collected,
/// the mission is won.
/// </summary>
[RequireComponent(typeof(Collider))]
public class ExitZone : MonoBehaviour
{
    private void OnTriggerEnter(Collider other)
    {
        if (other.GetComponent<REPOController>() == null) return;
        if (GameManager.Instance != null)
            GameManager.Instance.TryReachExit();
    }
}
