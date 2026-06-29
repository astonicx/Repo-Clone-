using UnityEngine;

/// <summary>
/// A collectible loot object. Registers itself with the GameManager and is
/// collected when the REPO player walks into it.
/// </summary>
[RequireComponent(typeof(Collider))]
public class LootItem : MonoBehaviour
{
    [SerializeField] private float spinSpeed = 60f;
    [SerializeField] private float bobHeight = 0.25f;
    [SerializeField] private float bobSpeed = 2f;

    private float baseY;
    private bool collected;

    private void Start()
    {
        baseY = transform.position.y;
        if (GameManager.Instance != null)
            GameManager.Instance.RegisterLoot();
    }

    private void Update()
    {
        // Idle animation: spin and bob
        transform.Rotate(Vector3.up, spinSpeed * Time.deltaTime, Space.World);
        Vector3 p = transform.position;
        p.y = baseY + Mathf.Sin(Time.time * bobSpeed) * bobHeight;
        transform.position = p;
    }

    private void OnTriggerEnter(Collider other)
    {
        if (collected) return;
        if (other.GetComponent<REPOController>() == null) return;

        collected = true;
        if (GameManager.Instance != null)
            GameManager.Instance.CollectLoot();

        Destroy(gameObject);
    }
}
