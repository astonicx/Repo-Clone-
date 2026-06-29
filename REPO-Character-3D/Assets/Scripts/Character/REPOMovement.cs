using UnityEngine;

/// <summary>
/// Physics-based movement system for REPO
/// Handles WASD input, jumping, sprinting, and acceleration
/// </summary>
public class REPOMovement : MonoBehaviour
{
    [Header("Movement Parameters")]
    [SerializeField] private float walkSpeed = 4f;
    [SerializeField] private float runSpeed = 8f;
    [SerializeField] private float acceleration = 15f;
    [SerializeField] private float deceleration = 25f;
    [SerializeField] private float maxSlopeAngle = 45f;

    [Header("Jump Parameters")]
    [SerializeField] private float jumpForce = 12f;
    [SerializeField] private float gravity = 9.81f;
    [SerializeField] private float groundCheckDistance = 0.2f;

    [Header("References")]
    [SerializeField] private CharacterController characterController;
    [SerializeField] private Animator animator;

    private Vector3 moveDirection = Vector3.zero;
    private Vector3 velocity = Vector3.zero;
    private float currentSpeed = 0f;
    private bool isGrounded = false;
    private bool isSprinting = false;
    private float speedMultiplier = 1f;

    private InputManager inputManager;

    private void Start()
    {
        if (characterController == null)
            characterController = GetComponent<CharacterController>();
        if (animator == null)
            animator = GetComponent<Animator>();
        
        inputManager = InputManager.Instance;
    }

    public void UpdateMovement(float deltaTime)
    {
        CheckGrounded();
        HandleInput();
        CalculateMovement(deltaTime);
        ApplyGravity(deltaTime);
        characterController.Move(velocity * deltaTime);
        UpdateAnimator();
    }

    private void CheckGrounded()
    {
        isGrounded = Physics.Raycast(transform.position, Vector3.down, groundCheckDistance);
    }

    private void HandleInput()
    {
        float moveX = 0;
        float moveZ = 0;

        if (inputManager.GetMoveForward()) moveZ += 1;
        if (inputManager.GetMoveBack()) moveZ -= 1;
        if (inputManager.GetMoveLeft()) moveX -= 1;
        if (inputManager.GetMoveRight()) moveX += 1;

        moveDirection = new Vector3(moveX, 0, moveZ).normalized;
        isSprinting = inputManager.GetSprint() && isGrounded;

        if (inputManager.GetJump() && isGrounded)
            Jump();
    }

    private void CalculateMovement(float deltaTime)
    {
        float targetSpeed = moveDirection.magnitude > 0.1f
            ? (isSprinting ? runSpeed : walkSpeed) * speedMultiplier
            : 0;

        currentSpeed = Mathf.Lerp(currentSpeed, targetSpeed, 
            moveDirection.magnitude > 0.1f ? acceleration * deltaTime : deceleration * deltaTime);

        Vector3 moveVelocity = transform.TransformDirection(moveDirection) * currentSpeed;
        velocity.x = moveVelocity.x;
        velocity.z = moveVelocity.z;
    }

    private void ApplyGravity(float deltaTime)
    {
        if (isGrounded && velocity.y < 0)
            velocity.y = -2f; // Small negative value to keep grounded
        else
            velocity.y -= gravity * deltaTime;
    }

    private void Jump()
    {
        velocity.y = Mathf.Sqrt(jumpForce * 2f * gravity);
        isGrounded = false;
    }

    private void UpdateAnimator()
    {
        if (animator == null) return;

        animator.SetFloat("Speed", currentSpeed);
        animator.SetBool("IsGrounded", isGrounded);
        animator.SetBool("IsSprinting", isSprinting);
    }

    public void SetSpeedMultiplier(float multiplier) => speedMultiplier = multiplier;
    public bool IsGrounded => isGrounded;
    public bool IsSprinting => isSprinting;
    public float CurrentSpeed => currentSpeed;
    public Vector3 Velocity => velocity;
}
