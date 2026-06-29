using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Persistent launcher that auto-builds the REPO game on play and rebuilds it
/// whenever the scene reloads (e.g. after pressing R to restart).
/// </summary>
public class REPOLauncher : MonoBehaviour
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    private static void Init()
    {
        GameObject go = new GameObject("REPOLauncher");
        DontDestroyOnLoad(go);
        go.AddComponent<REPOLauncher>();
    }

    private void OnEnable()
    {
        SceneManager.sceneLoaded += OnSceneLoaded;
    }

    private void OnDisable()
    {
        SceneManager.sceneLoaded -= OnSceneLoaded;
    }

    private void Start()
    {
        // Build for the very first scene (sceneLoaded may not fire for it).
        BuildIfNeeded();
    }

    private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        BuildIfNeeded();
    }

    private void BuildIfNeeded()
    {
        if (FindObjectOfType<REPOController>() != null) return;
        if (FindObjectOfType<REPOGameBootstrap>() != null) return;

        GameObject go = new GameObject("REPO_GameBootstrap");
        go.AddComponent<REPOGameBootstrap>();
    }
}
