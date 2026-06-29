using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Central game state, objectives and win/lose logic for REPO.
/// </summary>
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    public enum GameState { Playing, Won, Lost }
    public GameState State { get; private set; } = GameState.Playing;

    public int LootCollected { get; private set; }
    public int LootTotal { get; set; }
    public bool AllLootCollected => LootTotal > 0 && LootCollected >= LootTotal;

    private REPOController player;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        State = GameState.Playing;
        LootCollected = 0;
        LootTotal = 0;
    }

    private void Start()
    {
        player = FindObjectOfType<REPOController>();
    }

    private void Update()
    {
        if (State != GameState.Playing)
        {
            if (Input.GetKeyDown(KeyCode.R))
                Restart();
            return;
        }

        if (player != null && !player.IsAlive)
            Lose();
    }

    public void RegisterLoot() => LootTotal++;

    public void CollectLoot()
    {
        if (State != GameState.Playing) return;
        LootCollected++;
    }

    public void TryReachExit()
    {
        if (State == GameState.Playing && AllLootCollected)
            Win();
    }

    public void Win()
    {
        if (State != GameState.Playing) return;
        State = GameState.Won;
        UnlockCursor();
        Debug.Log("MISSION COMPLETE!");
    }

    public void Lose()
    {
        if (State != GameState.Playing) return;
        State = GameState.Lost;
        UnlockCursor();
        Debug.Log("MISSION FAILED!");
    }

    public void Restart()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    private void UnlockCursor()
    {
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
    }
}
