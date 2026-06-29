using UnityEngine;

/// <summary>
/// Third-person orbital camera controller for REPO
/// </summary>
public class REPOCameraController : MonoBehaviour
{
    [Header("Camera Parameters")]
    [SerializeField] private Transform target;
    [SerializeField] private float followDistance = 3f;
    [SerializeField] private float followHeight = 1.5f;
    [SerializeField] private float rotationSpeed = 100f;
    [SerializeField] private float smoothDampTime = 0.1f;

    [Header("Rotation Limits")]
    [SerializeField] private float minVerticalAngle = -30f;
    [SerializeField] private float maxVerticalAngle = 60f;
    [SerializeField] private float minCameraDistance = 0.5f;
    [SerializeField] private float maxCameraDistance = 10f;

    private float horizontalAngle = 0f;
    private float verticalAngle = 30f;
    private Vector3 currentVelocity = Vector3.zero;

    private void Start()
    {
        if (target == null)
            target = transform.parent;
    }

    private void LateUpdate()
    {
        HandleInput();
        UpdateCamera();
    }

    private void HandleInput()
    {
        float mouseX = Input.GetAxis("Mouse X");
        float mouseY = Input.GetAxis("Mouse Y");
        float scroll = Input.GetAxis("Mouse ScrollWheel");

        horizontalAngle += mouseX * rotationSpeed * Time.deltaTime;
        verticalAngle -= mouseY * rotationSpeed * Time.deltaTime;
        verticalAngle = Mathf.Clamp(verticalAngle, minVerticalAngle, maxVerticalAngle);

        if (scroll != 0)
        {
            followDistance -= scroll * 2f;
            followDistance = Mathf.Clamp(followDistance, minCameraDistance, maxCameraDistance);
        }
    }

    private void UpdateCamera()
    {
        if (target == null) return;

        Vector3 targetPosition = target.position + Vector3.up * followHeight;
        Quaternion rotation = Quaternion.Euler(verticalAngle, horizontalAngle, 0);
        Vector3 cameraPosition = targetPosition - rotation * Vector3.forward * followDistance;

        cameraPosition = Vector3.SmoothDamp(transform.position, cameraPosition, ref currentVelocity, smoothDampTime);

        transform.position = cameraPosition;
        transform.LookAt(targetPosition);
    }

    public void SetTarget(Transform newTarget) => target = newTarget;
}
