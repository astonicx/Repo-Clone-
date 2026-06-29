using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Procedurally builds a multi-room facility: floor, perimeter walls,
/// interior partition walls with doorways, loot, enemies, charging
/// stations and an extraction zone.
/// </summary>
public class LevelBuilder
{
    private const float Half = 24f;          // facility half-extent (48x48)
    private const float WallHeight = 3.5f;
    private const float WallThick = 0.5f;
    private const float DoorWidth = 5f;

    public Vector3 PlayerSpawn { get; private set; }

    private readonly Color floorColor = new Color(0.16f, 0.18f, 0.22f);
    private readonly Color wallColor = new Color(0.30f, 0.33f, 0.40f);
    private readonly Color partitionColor = new Color(0.26f, 0.30f, 0.36f);

    private Transform root;

    public void Build()
    {
        root = new GameObject("Level").transform;

        BuildFloor();
        BuildPerimeter();
        BuildInteriorWalls();
        BuildProps();

        // Room centers (2x2 grid)
        Vector3 roomSW = new Vector3(-12, 0, -12);
        Vector3 roomSE = new Vector3(12, 0, -12);
        Vector3 roomNW = new Vector3(-12, 0, 12);
        Vector3 roomNE = new Vector3(12, 0, 12);

        PlayerSpawn = roomSW + Vector3.up * 1.2f;

        // Loot spread across all rooms (5 total)
        SpawnLoot(roomSW + new Vector3(4, 0, 3));
        SpawnLoot(roomSE + new Vector3(-3, 0, 4));
        SpawnLoot(roomNW + new Vector3(3, 0, -4));
        SpawnLoot(roomNE + new Vector3(-4, 0, -3));
        SpawnLoot(roomNE + new Vector3(4, 0, 4));

        // Enemies in rooms away from spawn (3 total)
        SpawnEnemy(roomSE, roomSE + new Vector3(0, 0, 6), roomSE + new Vector3(0, 0, -6));
        SpawnEnemy(roomNW, roomNW + new Vector3(6, 0, 0), roomNW + new Vector3(-6, 0, 0));
        SpawnEnemy(roomNE, roomNE + new Vector3(5, 0, 5), roomNE + new Vector3(-5, 0, -5));

        // Charging stations
        SpawnChargingStation(roomSW + new Vector3(-6, 0, -6));
        SpawnChargingStation(roomNW + new Vector3(-6, 0, 6));

        // Extraction zone in the far (NE) room
        SpawnExit(roomNE);

        // Lighting + ambient
        BuildLighting();
    }

    private void BuildFloor()
    {
        GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
        floor.name = "Floor";
        floor.transform.SetParent(root, false);
        floor.transform.localScale = new Vector3(Half * 2f / 10f, 1, Half * 2f / 10f);
        floor.GetComponent<Renderer>().sharedMaterial = REPOBuildUtils.MakeMat(floorColor);
    }

    private void BuildPerimeter()
    {
        CreateWall("Wall_N", new Vector3(0, WallHeight / 2f, Half), new Vector3(Half * 2f, WallHeight, WallThick), wallColor);
        CreateWall("Wall_S", new Vector3(0, WallHeight / 2f, -Half), new Vector3(Half * 2f, WallHeight, WallThick), wallColor);
        CreateWall("Wall_E", new Vector3(Half, WallHeight / 2f, 0), new Vector3(WallThick, WallHeight, Half * 2f), wallColor);
        CreateWall("Wall_W", new Vector3(-Half, WallHeight / 2f, 0), new Vector3(WallThick, WallHeight, Half * 2f), wallColor);
    }

    private void BuildInteriorWalls()
    {
        // Vertical partition along x = 0, with two doorways
        BuildWallWithGaps(true, 0f, -Half, Half, new float[] { -12f, 12f });
        // Horizontal partition along z = 0, with two doorways
        BuildWallWithGaps(false, 0f, -Half, Half, new float[] { -12f, 12f });
    }

    /// <summary>
    /// Builds a straight wall with gaps (doorways) cut out.
    /// vertical=true => wall runs along Z at fixed X. false => along X at fixed Z.
    /// </summary>
    private void BuildWallWithGaps(bool vertical, float fixedCoord, float start, float end, float[] gapCenters)
    {
        List<float> cuts = new List<float> { start };
        foreach (float g in gapCenters)
        {
            cuts.Add(g - DoorWidth / 2f);
            cuts.Add(g + DoorWidth / 2f);
        }
        cuts.Add(end);
        cuts.Sort();

        for (int i = 0; i < cuts.Count; i += 2)
        {
            float a = cuts[i];
            float b = cuts[i + 1];
            float len = b - a;
            if (len <= 0.05f) continue;
            float mid = (a + b) / 2f;

            Vector3 pos, scale;
            if (vertical)
            {
                pos = new Vector3(fixedCoord, WallHeight / 2f, mid);
                scale = new Vector3(WallThick, WallHeight, len);
            }
            else
            {
                pos = new Vector3(mid, WallHeight / 2f, fixedCoord);
                scale = new Vector3(len, WallHeight, WallThick);
            }
            CreateWall("Partition", pos, scale, partitionColor);
        }
    }

    private void BuildProps()
    {
        // A few crates / cover scattered around
        REPOBuildUtils.CreateBox("Crate", new Vector3(-16, 0.75f, -8), Vector3.one * 1.5f, new Color(0.5f, 0.4f, 0.25f), root);
        REPOBuildUtils.CreateBox("Crate", new Vector3(8, 0.75f, -16), Vector3.one * 1.5f, new Color(0.5f, 0.4f, 0.25f), root);
        REPOBuildUtils.CreateBox("Crate", new Vector3(16, 0.75f, 8), Vector3.one * 1.5f, new Color(0.5f, 0.4f, 0.25f), root);
        REPOBuildUtils.CreateBox("Console", new Vector3(-8, 0.5f, 16), new Vector3(2, 1, 1), new Color(0.2f, 0.4f, 0.5f), root);
    }

    private void CreateWall(string name, Vector3 pos, Vector3 scale, Color color)
    {
        REPOBuildUtils.CreateBox(name, pos, scale, color, root);
    }

    private void SpawnLoot(Vector3 pos)
    {
        GameObject loot = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        loot.name = "Loot";
        loot.transform.SetParent(root, false);
        loot.transform.position = pos + Vector3.up * 1f;
        loot.transform.localScale = Vector3.one * 0.7f;
        loot.GetComponent<Renderer>().sharedMaterial = REPOBuildUtils.MakeMat(new Color(1f, 0.84f, 0.1f), true);

        Collider col = loot.GetComponent<Collider>();
        col.isTrigger = true;

        Rigidbody rb = loot.AddComponent<Rigidbody>();
        rb.isKinematic = true;
        rb.useGravity = false;

        loot.AddComponent<LootItem>();
    }

    private void SpawnEnemy(Vector3 pos, Vector3 patrolA, Vector3 patrolB)
    {
        GameObject enemy = new GameObject("Enemy");
        enemy.transform.SetParent(root, false);
        enemy.transform.position = pos + Vector3.up * 1.1f;

        CharacterController cc = enemy.AddComponent<CharacterController>();
        cc.height = 2f;
        cc.radius = 0.45f;
        cc.center = new Vector3(0, 1f, 0);

        EnemyAI ai = enemy.AddComponent<EnemyAI>();
        ai.SetPatrol(patrolA + Vector3.up * 1.1f, patrolB + Vector3.up * 1.1f);
    }

    private void SpawnChargingStation(Vector3 pos)
    {
        GameObject pad = GameObject.CreatePrimitive(PrimitiveType.Cube);
        pad.name = "ChargingStation";
        pad.transform.SetParent(root, false);
        pad.transform.position = pos + Vector3.up * 0.25f;
        pad.transform.localScale = new Vector3(2.2f, 0.5f, 2.2f);
        pad.GetComponent<Renderer>().sharedMaterial = REPOBuildUtils.MakeMat(new Color(0.1f, 0.9f, 0.4f), true);
        pad.AddComponent<InteractableChargingStation>();
    }

    private void SpawnExit(Vector3 roomCenter)
    {
        // Glowing extraction pad
        GameObject pad = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        pad.name = "ExtractionPad";
        pad.transform.SetParent(root, false);
        pad.transform.position = roomCenter + Vector3.up * 0.05f;
        pad.transform.localScale = new Vector3(4f, 0.1f, 4f);
        pad.GetComponent<Renderer>().sharedMaterial = REPOBuildUtils.MakeMat(new Color(0.2f, 0.7f, 1f), true);
        Object.Destroy(pad.GetComponent<Collider>());

        // Trigger volume
        GameObject zone = new GameObject("ExitZone");
        zone.transform.SetParent(root, false);
        zone.transform.position = roomCenter + Vector3.up * 1.5f;
        BoxCollider bc = zone.AddComponent<BoxCollider>();
        bc.size = new Vector3(4f, 3f, 4f);
        bc.isTrigger = true;
        Rigidbody rb = zone.AddComponent<Rigidbody>();
        rb.isKinematic = true;
        rb.useGravity = false;
        zone.AddComponent<ExitZone>();
    }

    private void BuildLighting()
    {
        GameObject lightObj = new GameObject("Directional Light");
        Light light = lightObj.AddComponent<Light>();
        light.type = LightType.Directional;
        light.color = new Color(1f, 0.96f, 0.86f);
        light.intensity = 1.1f;
        light.shadows = LightShadows.Soft;
        lightObj.transform.rotation = Quaternion.Euler(50, -30, 0);

        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.32f, 0.34f, 0.4f);
    }
}
