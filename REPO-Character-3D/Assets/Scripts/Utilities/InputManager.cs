using UnityEngine;

/// <summary>
/// Centralized input management for REPO
/// </summary>
public class InputManager : MonoBehaviour
{
    public static InputManager Instance { get; private set; }

    [Header("Movement Keys")]
    [SerializeField] private KeyCode moveForward = KeyCode.W;
    [SerializeField] private KeyCode moveBack = KeyCode.S;
    [SerializeField] private KeyCode moveLeft = KeyCode.A;
    [SerializeField] private KeyCode moveRight = KeyCode.D;
    [SerializeField] private KeyCode sprint = KeyCode.LeftShift;
    [SerializeField] private KeyCode jump = KeyCode.Space;

    [Header("Action Keys")]
    [SerializeField] private KeyCode scan = KeyCode.Q;
    [SerializeField] private KeyCode interact = KeyCode.E;
    [SerializeField] private KeyCode toggleMap = KeyCode.Tab;
    [SerializeField] private KeyCode pause = KeyCode.Escape;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public bool GetMoveForward() => Input.GetKey(moveForward);
    public bool GetMoveBack() => Input.GetKey(moveBack);
    public bool GetMoveLeft() => Input.GetKey(moveLeft);
    public bool GetMoveRight() => Input.GetKey(moveRight);
    public bool GetSprint() => Input.GetKey(sprint);
    public bool GetJump() => Input.GetKeyDown(jump);

    public bool GetScan() => Input.GetKeyDown(scan);
    public bool GetInteract() => Input.GetKeyDown(interact);
    public bool GetToggleMap() => Input.GetKeyDown(toggleMap);
    public bool GetPause() => Input.GetKeyDown(pause);

    public void SetMoveForwardKey(KeyCode key) => moveForward = key;
    public void SetMoveBackKey(KeyCode key) => moveBack = key;
    public void SetMoveLeftKey(KeyCode key) => moveLeft = key;
    public void SetMoveRightKey(KeyCode key) => moveRight = key;
}
