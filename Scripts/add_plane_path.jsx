/**
 * Dodaje warstwę PLANE poruszającą się po zdefiniowanej trasie (waypointach)
 * z Auto-Orient — nos samolotu zawsze zgodnie z kierunkiem lotu.
 *
 * Edycja trasy:
 *   1) Zmień tablicę WAYPOINTS poniżej, albo
 *   2) Po uruchomieniu — zaznacz warstwę PLANE → P → w panelu Composition
 *      widać uchwyty bezier; ciągnij je żeby wygiąć trasę.
 *
 * File > Scripts > Run Script File...
 */

(function addPlanePath() {
    app.beginUndoGroup("Add Plane Path");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // Idempotencja — usuń starą warstwę PLANE jeśli istnieje
    for (var rmI = comp.numLayers; rmI >= 1; rmI--) {
        if (comp.layer(rmI).name === "PLANE") comp.layer(rmI).remove();
    }

    // ── Konfiguracja ───────────────────────────────────────────────────────
    // Punkty trasy w przestrzeni kompozycji [x, y]. Min. 2 punkty.
    // Pierwszy i ostatni waypoint = uchwyty wjazdu/wyjazdu (poza kadrem).
    var WAYPOINTS = [
        [-150, 540],   // START — off-screen left (wjazd)
        [150,  900],
        [500,  700],
        [950,  500],
        [1400, 600],
        [1800, 350],
        [2070, 540]    // END — off-screen right (wyjazd)
    ];
    var T_START = 0;        // start lotu (sekundy)
    var T_END   = 10;       // koniec lotu (sekundy)
    var SIZE    = 30;       // rozmiar placeholderu trójkąta (px) — używane gdy brak PNG

    // Asset PNG. Jeśli ustawiony i znaleziony w panelu Project — zostaje użyty
    // zamiast trójkąta. PNG powinien mieć samolot skierowany w PRAWO (+X),
    // żeby Auto-Orient pokazywał nos zgodnie z kierunkiem lotu.
    var PLANE_ASSET     = "89145.png";
    var PLANE_SCALE_PCT = 25;   // skala warstwy PNG (%) gdy używamy assetu
    var ROTATION_OFFSET = 0;    // dodatkowy obrót (deg) gdy PNG nie patrzy w prawo
    // ──────────────────────────────────────────────────────────────────────

    if (WAYPOINTS.length < 2) { alert("Potrzeba co najmniej 2 waypointy."); return; }

    // ── Znajdź asset PNG w panelu Project (jeśli zdefiniowany) ─────────────
    var planeAsset = null;
    if (PLANE_ASSET) {
        for (var fi = 1; fi <= proj.numItems; fi++) {
            if (proj.item(fi).name === PLANE_ASSET) { planeAsset = proj.item(fi); break; }
        }
    }

    var plane;
    if (planeAsset) {
        // ── PNG samolotu ───────────────────────────────────────────────────
        plane = comp.layers.add(planeAsset);
        plane.name  = "PLANE";
        plane.label = 11;
        plane.property("Scale").setValue([PLANE_SCALE_PCT, PLANE_SCALE_PCT]);
    } else {
        // ── Fallback: shape layer (biały trójkąt skierowany w +X) ──────────
        plane = comp.layers.addShape();
        plane.name  = "PLANE";
        plane.label = 11;

        var grp  = plane.property("Contents").addProperty("ADBE Vector Group");
        var grpC = grp.property("Contents");

        var pathProp = grpC.addProperty("ADBE Vector Shape - Group");
        var s = new Shape();
        s.vertices    = [[SIZE, 0], [-SIZE * 0.6, SIZE * 0.5], [-SIZE * 0.6, -SIZE * 0.5]];
        s.inTangents  = [[0, 0], [0, 0], [0, 0]];
        s.outTangents = [[0, 0], [0, 0], [0, 0]];
        s.closed      = true;
        pathProp.property("Path").setValue(s);

        var fill = grpC.addProperty("ADBE Vector Graphic - Fill");
        fill.property("Color").setValue([1, 1, 1]);

        var stroke = grpC.addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("Color").setValue([0, 0, 0]);
        stroke.property("Stroke Width").setValue(1.5);
    }

    // ── Position keyframes — równo rozłożone po waypointach ────────────────
    var pos = plane.property("Position");
    var n = WAYPOINTS.length;
    for (var k = 0; k < n; k++) {
        var t = T_START + (T_END - T_START) * (k / (n - 1));
        pos.setValueAtTime(t, WAYPOINTS[k]);
    }

    // Bezier z auto-tangents = płynna krzywa przez wszystkie punkty
    for (var ki = 1; ki <= pos.numKeys; ki++) {
        pos.setSpatialAutoBezierAtKey(ki, true);
        pos.setInterpolationTypeAtKey(
            ki,
            KeyframeInterpolationType.BEZIER,
            KeyframeInterpolationType.BEZIER
        );
    }

    // Stała prędkość — środkowe keyframe'y rovują (AE samo rozkłada je w czasie
    // proporcjonalnie do długości krzywej). Pierwszy i ostatni trzymają T_START/T_END.
    for (var rk = 2; rk <= pos.numKeys - 1; rk++) {
        pos.setRovingAtKey(rk, true);
    }

    // Liniowy "in/out" na pierwszym i ostatnim — bez ease, żeby prędkość naprawdę
    // była stała (Easy Ease w skrajnych keyframe'ach łamie roving — daje przyspiesz./zwoln.)
    var linearEase = [new KeyframeEase(0, 33.33)];
    pos.setTemporalEaseAtKey(1, linearEase, linearEase);
    pos.setTemporalEaseAtKey(pos.numKeys, linearEase, linearEase);
    pos.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
    pos.setInterpolationTypeAtKey(pos.numKeys, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);

    // ── Auto-Orient: nos w kierunku ruchu ──────────────────────────────────
    plane.autoOrient = AutoOrientType.ALONG_PATH;

    // Korekta orientacji jeśli PNG nie jest skierowany w prawo
    if (ROTATION_OFFSET !== 0) {
        plane.property("Rotation").expression = "value + " + ROTATION_OFFSET;
    }

    // ── Render order: na samej górze (nad mapą, nad wybuchami) ─────────────
    plane.moveToBeginning();

    comp.time = T_START;
    app.endUndoGroup();

    alert(
        "Samolot dodany!\n\n" +
        "Waypointy: " + n + "  |  Czas lotu: " + T_START + "s → " + T_END + "s\n" +
        "Auto-Orient: nos zgodnie z kierunkiem ruchu.\n\n" +
        "Edycja trasy:\n" +
        "• Zaznacz warstwę PLANE, naciśnij P — w composition view\n" +
        "  zobaczysz krzywą i uchwyty bezier (ciągnij = wyginanie trasy).\n" +
        "• Albo zmień tablicę WAYPOINTS w skrypcie i uruchom ponownie\n" +
        "  (najpierw usuń starą warstwę PLANE).\n\n" +
        "Aby podmienić placeholder na PNG samolotu:\n" +
        "1) Zaimportuj plik samolotu (skierowany w prawo!)\n" +
        "2) Zaznacz warstwę PLANE w timeline\n" +
        "3) Z wciśniętym Alt przeciągnij PNG na warstwę PLANE\n" +
        "   → keyframe'y i Auto-Orient zostają, zmienia się tylko źródło."
    );
})();
