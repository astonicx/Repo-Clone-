using UnityEngine;

/// <summary>
/// Interaction system for REPO
/// </summary>
public abstract class Interactable : MonoBehaviour
{
    public abstract void OnInteract(GameObject interactor);
    
    public virtual void OnSelected() { }
    public virtual void OnDeselected() { }
}

public class REPOInteraction : MonoBehaviour
{
    [Header("Interaction Parameters")]
    [SerializeField] private float interactionRange = 3f;
    [SerializeField] private Camera mainCamera;

    private Interactable currentInteractable;
    private InputManager inputManager;

    private void Start()
    {
        if (mainCamera == null)
            mainCamera = Camera.main;
        
        inputManager = InputManager.Instance;
    }

    private void Update()
    {
        UpdateNearbyInteractable();

        if (inputManager != null && inputManager.GetInteract() && currentInteractable != null)
            Interact();
    }

    public void UpdateNearbyInteractable()
    {
        Interactable nearestInteractable = FindNearestInteractable();

        if (nearestInteractable != currentInteractable)
        {
            currentInteractable?.OnDeselected();
            currentInteractable = nearestInteractable;
            currentInteractable?.OnSelected();
        }
    }

    private Interactable FindNearestInteractable()
    {
        if (mainCamera == null) return null;

        Vector3 rayOrigin = mainCamera.transform.position;
        Vector3 rayDirection = mainCamera.transform.forward;

        RaycastHit hit;
        if (Physics.Raycast(rayOrigin, rayDirection, out hit, interactionRange))
        {
            Interactable interactable = hit.collider.GetComponent<Interactable>();
            return interactable;
        }

        return null;
    }

    public void Interact()
    {
        if (currentInteractable != null)
        {
            currentInteractable.OnInteract(gameObject);
        }
    }
}

public class InteractableDoor : Interactable
{
    [SerializeField] private Animator animator;
    private bool isOpen = false;

    public override void OnSelected()
    {
        Debug.Log("Door selected");
    }

    public override void OnInteract(GameObject interactor)
    {
        isOpen = !isOpen;
        if (animator != null)
            animator.SetBool("IsOpen", isOpen);
        
        Debug.Log(isOpen ? "Door opened" : "Door closed");
    }
}

public class InteractableChargingStation : Interactable
{
    [SerializeField] private float chargeAmount = 50f;

    public override void OnSelected()
    {
        Debug.Log("Charging station selected");
    }

    public override void OnInteract(GameObject interactor)
    {
        REPOBattery targetBattery = interactor.GetComponent<REPOBattery>();
        if (targetBattery != null)
        {
            targetBattery.ChargeEnergy(chargeAmount);
            Debug.Log("REPO charging...");
        }
    }
}
