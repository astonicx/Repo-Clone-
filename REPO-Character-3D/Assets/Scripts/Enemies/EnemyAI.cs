using UnityEngine;

/// <summary>
/// Simple hostile robot AI: patrols, detects the player within range,
/// chases, and attacks (damages) when close. Builds its own red visual.
/// </summary>
[RequireComponent(typeof(CharacterController))]
public class EnemyAI : MonoBehaviour
{
    [Header("AI Parameters")]
    [SerializeField] private float detectRange = 14f;
    [SerializeField] private float attackRange = 2.3f;
    [SerializeField] private float moveSpeed = 3.2f;
    [SerializeField] private float patrolSpeed = 1.6f;
    [SerializeField] private float turnSpeed = 6f;
    [SerializeField] private float damage = 12f;
    [SerializeField] private float attackCooldown = 1.2f;
    [SerializeField] private float gravity = 12f;

    private Transform player;
    private REPOController playerCtrl;
    private CharacterController cc;
    private float cooldownTimer;

    private Vector3 patrolA;
    private Vector3 patrolB;
    private bool towardB = true;
    private float verticalVel;

    public void SetPatrol(Vector3 a, Vector3 b)
    {
        patrolA = a;
        patrolB = b;
    }

    private void Start()
    {
        cc = GetComponent<CharacterController>();
        playerCtrl = FindObjectOfType<REPOController>();
        if (playerCtrl != null) player = playerCtrl.transform;

        if (patrolA == Vector3.zero && patrolB == Vector3.zero)
        {
            patrolA = transform.position + Vector3.forward * 4f;
            patrolB = transform.position - Vector3.forward * 4f;
        }

        BuildBody();
    }

    private void Update()
    {
        if (GameManager.Instance == null || GameManager.Instance.State != GameManager.GameState.Playing)
            return;
        if (player == null) return;

        float dist = Vector3.Distance(transform.position, player.position);

        if (dist <= detectRange && HasLineOfSight())
        {
            ChasePlayer(dist);
        }
        else
        {
            Patrol();
        }
    }

    private void ChasePlayer(float dist)
    {
        Vector3 dir = player.position - transform.position;
        dir.y = 0;
        if (dir.sqrMagnitude > 0.001f) dir.Normalize();
        FaceDirection(dir);

        if (dist > attackRange)
        {
            MoveWithGravity(dir * moveSpeed);
        }
        else
        {
            MoveWithGravity(Vector3.zero);
            cooldownTimer -= Time.deltaTime;
            if (cooldownTimer <= 0f)
            {
                cooldownTimer = attackCooldown;
                if (playerCtrl != null) playerCtrl.TakeDamage(damage);
            }
        }
    }

    private void Patrol()
    {
        Vector3 target = towardB ? patrolB : patrolA;
        Vector3 dir = target - transform.position;
        dir.y = 0;

        if (dir.magnitude < 0.6f)
        {
            towardB = !towardB;
        }
        else
        {
            dir.Normalize();
            FaceDirection(dir);
            MoveWithGravity(dir * patrolSpeed);
        }
    }

    private void MoveWithGravity(Vector3 horizontal)
    {
        if (cc == null) return;
        if (cc.isGrounded && verticalVel < 0) verticalVel = -1f;
        verticalVel -= gravity * Time.deltaTime;
        Vector3 move = horizontal + Vector3.up * verticalVel;
        cc.Move(move * Time.deltaTime);
    }

    private void FaceDirection(Vector3 dir)
    {
        if (dir.sqrMagnitude < 0.001f) return;
        Quaternion target = Quaternion.LookRotation(dir);
        transform.rotation = Quaternion.Slerp(transform.rotation, target, turnSpeed * Time.deltaTime);
    }

    private bool HasLineOfSight()
    {
        Vector3 origin = transform.position + Vector3.up * 1f;
        Vector3 toPlayer = (player.position + Vector3.up * 1f) - origin;
        if (Physics.Raycast(origin, toPlayer.normalized, out RaycastHit hit, detectRange))
        {
            return hit.collider.GetComponent<REPOController>() != null
                || hit.collider.transform.IsChildOf(player);
        }
        return false;
    }

    private void BuildBody()
    {
        Material bodyMat = REPOBuildUtils.MakeMat(new Color(0.7f, 0.12f, 0.12f));
        Material eyeMat = REPOBuildUtils.MakeMat(new Color(1f, 0.3f, 0.1f), true);
        Material jointMat = REPOBuildUtils.MakeMat(new Color(0.15f, 0.15f, 0.15f));

        Transform root = new GameObject("Enemy_Visual").transform;
        root.SetParent(transform, false);

        Transform torso = REPOBuildUtils.CreateVisual(root, "Torso", PrimitiveType.Capsule, bodyMat,
            new Vector3(0, 1f, 0), new Vector3(0.9f, 1f, 0.9f));
        Transform head = REPOBuildUtils.CreateVisual(torso, "Head", PrimitiveType.Sphere, bodyMat,
            new Vector3(0, 0.7f, 0), new Vector3(0.6f, 0.6f, 0.6f));
        REPOBuildUtils.CreateVisual(head, "Eye", PrimitiveType.Sphere, eyeMat,
            new Vector3(0, 0, 0.4f), new Vector3(0.4f, 0.4f, 0.35f));
        REPOBuildUtils.CreateVisual(torso, "Spike", PrimitiveType.Cylinder, jointMat,
            new Vector3(0, 1.1f, 0), new Vector3(0.08f, 0.3f, 0.08f));
    }
}
