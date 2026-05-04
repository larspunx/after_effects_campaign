(function addAirplanePath() {
    app.beginUndoGroup("Add Airplane Path");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // ── Konfiguracja ───────────────────────────────────────────────────────
    // Wszystkie samoloty lecą z tą samą średnią prędkością (px/sek w comp space).
    // Czas lotu (tEnd) jest wyliczany automatycznie z długości trasy.
    var SPEED_PX_PER_SEC = 220;

    var planes = [
        { name: "PLANE_1", startX: 200,  startY: 400, endX: 1700, endY: 300, arcY: -120, tStart: 1.0,  scale: 15 },
        { name: "PLANE_2", startX: 1800, startY: 250, endX: 150,  endY: 600, arcY:  -80, tStart: 5.0,  scale: 12 },
        { name: "PLANE_3", startX: 250,  startY: 700, endX: 1750, endY: 500, arcY: -100, tStart: 11.0, scale: 10 },
    ];

    // Aproksymacja długości trasy A → mid (z arcY) → Z jako suma odległości euklidesowych
    function pathLength(sx, sy, mx, my, ex, ey) {
        var d1 = Math.sqrt((mx - sx) * (mx - sx) + (my - sy) * (my - sy));
        var d2 = Math.sqrt((ex - mx) * (ex - mx) + (ey - my) * (ey - my));
        return d1 + d2;
    }

    // ── Import pliku samolotu ──────────────────────────────────────────────
    var planePath = "/Users/mac/tsg/AfterEffects/Assets/Images/icon_airplane.png";
    var planeFile = new File(planePath);
    if (!planeFile.exists) { alert("Brak pliku: " + planePath); return; }

    var planeFootage = null;
    for (var j = 1; j <= proj.numItems; j++) {
        if (proj.item(j).name === "icon_airplane.png") { planeFootage = proj.item(j); break; }
    }
    if (!planeFootage) {
        planeFootage = proj.importFile(new ImportOptions(planeFile));
    }

    // Usuń stare warstwy
    for (var d = comp.numLayers; d >= 1; d--) {
        var ln = comp.layer(d).name;
        if (ln.indexOf("PLANE_") === 0 || ln.indexOf("POINT_") === 0 || ln.indexOf("LABEL_") === 0) {
            comp.layer(d).remove();
        }
    }

    // ── Helper: kółko markera ─────────────────────────────────────────────
    function addMarker(name, x, y, color, label, tStart, tEnd) {
        var m = comp.layers.addShape();
        m.name      = name;
        m.label     = label;
        m.startTime = tStart;
        m.outPoint  = tEnd;

        var grp  = m.property("Contents").addProperty("ADBE Vector Group");

        // Wypełniony krąg
        var el   = grp.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
        el.property("Size").setValue([18, 18]);

        var fill = grp.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        fill.property("Color").setValue(color);

        // Obwódka biała
        var st   = grp.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        st.property("Color").setValue([1, 1, 1]);
        st.property("Stroke Width").setValue(2);

        grp.property("Transform").property("Position").setValue([x, y]);

        // Pulsowanie — żeby było widoczne
        var sc = m.property("Scale");
        sc.setValueAtTime(tStart,       [0,   0  ]);
        sc.setValueAtTime(tStart + 0.3, [110, 110]);
        sc.setValueAtTime(tStart + 0.5, [100, 100]);

        return m;
    }

    // ── Helper: etykieta tekstowa ─────────────────────────────────────────
    function addLabel(name, txt, x, y, color, tStart, tEnd) {
        var tl = comp.layers.addText(txt);
        tl.name      = name;
        tl.startTime = tStart;
        tl.outPoint  = tEnd;
        tl.label     = 4;

        var td = tl.property("Source Text").value;
        td.resetCharStyle();
        td.fontSize        = 22;
        td.fillColor       = color;
        td.strokeColor     = [0, 0, 0];
        td.strokeWidth     = 2;
        td.applyStroke     = true;
        td.font            = "Arial-BoldMT";
        tl.property("Source Text").setValue(td);

        tl.property("Position").setValue([x + 12, y - 18]);

        var op = tl.property("Opacity");
        op.setValueAtTime(tStart,       0);
        op.setValueAtTime(tStart + 0.4, 100);

        return tl;
    }

    // ── Dodaj każdy samolot + markery ────────────────────────────────────
    var colors = [
        [1.0, 0.3, 0.3],  // czerwony
        [0.3, 0.8, 1.0],  // niebieski
        [0.3, 1.0, 0.5],  // zielony
    ];

    var summary = [];

    for (var p = 0; p < planes.length; p++) {
        var cfg   = planes[p];
        var col   = colors[p];

        var midX    = (cfg.startX + cfg.endX) / 2;
        var midY    = ((cfg.startY + cfg.endY) / 2) + cfg.arcY;

        // Czas lotu = długość trasy / prędkość → wszystkie samoloty z tą samą średnią prędkością
        var lengthPx = pathLength(cfg.startX, cfg.startY, midX, midY, cfg.endX, cfg.endY);
        var dur      = lengthPx / SPEED_PX_PER_SEC;
        var tEnd     = cfg.tStart + dur;
        var tMid     = cfg.tStart + dur / 2;

        summary.push(cfg.name + ": " + lengthPx.toFixed(0) + "px / " + dur.toFixed(2) + "s");

        // ── Marker START (A) ───────────────────────────────────────────────
        addMarker("POINT_" + cfg.name + "_A", cfg.startX, cfg.startY,
                  col, p + 1, cfg.tStart, comp.duration);
        addLabel("LABEL_" + cfg.name + "_A", "A",
                  cfg.startX, cfg.startY, col, cfg.tStart, comp.duration);

        // ── Marker END (Z) — pojawia się kiedy samolot dolatuje ───────────
        addMarker("POINT_" + cfg.name + "_Z", cfg.endX, cfg.endY,
                  col, p + 1, tEnd - 0.5, comp.duration);
        addLabel("LABEL_" + cfg.name + "_Z", "Z",
                  cfg.endX, cfg.endY, col, tEnd - 0.5, comp.duration);

        // ── Samolot ────────────────────────────────────────────────────────
        var layer = comp.layers.add(planeFootage, dur);
        layer.name      = cfg.name;
        layer.startTime = cfg.tStart;
        layer.label     = p + 1;

        layer.property("Scale").setValue([cfg.scale, cfg.scale]);
        layer.autoOrient = AutoOrientType.ALONG_PATH;

        var posProp = layer.property("Position");
        posProp.setValueAtTime(cfg.tStart, [cfg.startX, cfg.startY]);
        posProp.setValueAtTime(tMid,       [midX,       midY      ]);
        posProp.setValueAtTime(tEnd,       [cfg.endX,   cfg.endY  ]);

        // Auto-bezier spatial = gładki łuk przez 3 punkty
        for (var ki = 1; ki <= posProp.numKeys; ki++) {
            posProp.setSpatialAutoBezierAtKey(ki, true);
        }

        // Stała prędkość: środkowy keyframe roving (AE rozkłada go proporcjonalnie
        // do długości krzywej), pierwszy i ostatni linear (bez ease).
        posProp.setRovingAtKey(2, true);

        var linearEase = [new KeyframeEase(0, 33.33)];
        posProp.setTemporalEaseAtKey(1, linearEase, linearEase);
        posProp.setTemporalEaseAtKey(3, linearEase, linearEase);
        posProp.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        posProp.setInterpolationTypeAtKey(3, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);

        layer.property("Opacity").setValueAtTime(cfg.tStart,       0);
        layer.property("Opacity").setValueAtTime(cfg.tStart + 0.4, 100);
        layer.property("Opacity").setValueAtTime(tEnd       - 0.4, 100);
        layer.property("Opacity").setValueAtTime(tEnd,             0);
    }

    comp.layer("PLANE_1").selected = true;
    comp.time = 0;
    app.endUndoGroup();

    alert(
        "Gotowe! Stała średnia prędkość: " + SPEED_PX_PER_SEC + " px/s\n\n" +
        summary.join("\n") + "\n\n" +
        "Każdy samolot ma:\n" +
        "• Marker A (kółko) — punkt startu\n" +
        "• Marker Z (kółko) — punkt lądowania\n" +
        "• Edytowalną ścieżkę beziera\n\n" +
        "Aby zmienić prędkość — edytuj SPEED_PX_PER_SEC u góry skryptu i uruchom ponownie."
    );
})();
