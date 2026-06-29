using UnityEngine;

/// <summary>
/// Health and damage system for REPO
/// Tracks current health, applies damage, triggers death
/// </summary>
public class REPOHealth : MonoBehaviour
{
    [SerializeField] private float maxHealth = 100f;
    private float currentHealth;
    private bool isDead = false;

    [SerializeField] private Animator animator;

    public float CurrentHealth => currentHealth;
    public bool IsAlive => !isDead;
    public float HealthPercent => currentHealth / maxHealth;

    public void Initialize(float max)
    {
        maxHealth = max;
        currentHealth = maxHealth;
        isDead = false;
    }

    public void TakeDamage(float amount)
    {
        if (isDead) return;

        currentHealth -= amount;
        Debug.Log($"REPO took {amount} damage. Health: {currentHealth}/{maxHealth}");

        if (animator != null)
            animator.SetTrigger("Hit");

        if (currentHealth <= 0)
            Die();
    }

    public void Repair(float amount)
    {
        if (isDead) return;

        currentHealth = Mathf.Min(currentHealth + amount, maxHealth);
        Debug.Log($"REPO repaired {amount}. Health: {currentHealth}/{maxHealth}");
    }

    private void Die()
    {
        isDead = true;
        Debug.Log("REPO has been destroyed!");

        if (animator != null)
            animator.SetTrigger("Death");

        GetComponent<Collider>().enabled = false;
    }

    public void FullRepair()
    {
        currentHealth = maxHealth;
        isDead = false;
        GetComponent<Collider>().enabled = true;
    }
}
