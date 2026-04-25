/**
 * Animacja wybuchu bomby — tylko shape layers i solids (bez CC Particle World)
 * File > Scripts > Run Script File...
 */

(function addExplosion() {
    app.beginUndoGroup("Add Explosion");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var fps = comp.frameRate;
    var f   = 1 / fps;

    // ── Konfiguracja — zmień wg potrzeb ───────────────────────────────────
    var EX = 960;    // pozycja X wybuchu
    var EY = 540;    // pozycja Y wybuchu
    var T  = 2.0;    // czas startu (sekundy)
    // ──────────────────────────────────────────────────────────────────────

    // ── Helper: dodaj pierścień uderzeniowy ───────────────────────────────
    function addRing(name, color, strokeW, endScale, duration, delayF) {
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.startTime = T + delayF * f;
        layer.label = 8;
        layer.blendingMode = BlendingMode.ADD;

        var grp = layer.property("Contents").addProperty("ADBE Vector Group");
        grp.name = "Ring";

        var el = grp.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
        el.property("Size").setValue([20, 20]);

        var st = grp.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        st.property("Color").setValue(color);
        st.property("Stroke Width").setValue(strokeW);

        grp.property("Transform").property("Position").setValue([EX, EY]);

        var scaleProp = layer.property("Scale");
        scaleProp.setValueAtTime(T + delayF * f,            [0,  0 ]);
        scaleProp.setValueAtTime(T + delayF * f + duration, [endScale, endScale]);

        var opProp = layer.property("Opacity");
        opProp.setValueAtTime(T + delayF * f,                       100);
        opProp.setValueAtTime(T + delayF * f + duration * 0.6,       80);
        opProp.setValueAtTime(T + delayF * f + duration,              0);

        return layer;
    }

    // ── Helper: dodaj iskrę (linia lecąca w danym kierunku) ───────────────
    function addSpark(angle, speed, lifeTime, color) {
        var rad    = angle * Math.PI / 180;
        var endX   = EX + Math.cos(rad) * speed * 100;
        var endY   = EY + Math.sin(rad) * speed * 100;
        var randT  = T + (Math.random() * 0.05);

        var layer  = comp.layers.addShape();
        layer.name = "SPARK_" + angle;
        layer.startTime = randT;
        layer.label = 3;
        layer.blendingMode = BlendingMode.ADD;

        var grp  = layer.property("Contents").addProperty("ADBE Vector Group");
        var path = grp.property("Contents").addProperty("ADBE Vector Shape - Group");

        var stroke = grp.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("Color").setValue(color);
        stroke.property("Stroke Width").setValue(3);
        stroke.property("Line Cap").setValue(2);

        var posProp = layer.property("Position");
        posProp.setValueAtTime(randT,             [EX, EY]);
        posProp.setValueAtTime(randT + lifeTime,  [endX, endY]);

        layer.property("Opacity").setValueAtTime(randT,                100);
        layer.property("Opacity").setValueAtTime(randT + lifeTime * 0.5, 80);
        layer.property("Opacity").setValueAtTime(randT + lifeTime,       0);

        layer.property("Scale").setValueAtTime(randT,            [100, 100]);
        layer.property("Scale").setValueAtTime(randT + lifeTime, [20,  20 ]);

        return layer;
    }

    // ══════════════════════════════════════════════════════════════════════
    // 1. FLASH
    // ══════════════════════════════════════════════════════════════════════
    var flash = comp.layers.addSolid([1.0, 0.95, 0.5], "FLASH", comp.width, comp.height, 1, f * 8);
    flash.startTime = T;
    flash.blendingMode = BlendingMode.ADD;
    flash.label = 8;
    flash.property("Opacity").setValueAtTime(T,         100);
    flash.property("Opacity").setValueAtTime(T + f * 2,  70);
    flash.property("Opacity").setValueAtTime(T + f * 8,   0);

    // ══════════════════════════════════════════════════════════════════════
    // 2. PIERŚCIENIE UDERZENIOWE
    // ══════════════════════════════════════════════════════════════════════
    addRing("SHOCKWAVE_1", [1.0, 0.7, 0.1], 14, 280, 0.45, 0);
    addRing("SHOCKWAVE_2", [1.0, 1.0, 1.0],  6, 160, 0.22, 0);
    addRing("SHOCKWAVE_3", [1.0, 0.4, 0.0],  8, 200, 0.55, 3); // z opóźnieniem 3 klatki

    // ══════════════════════════════════════════════════════════════════════
    // 3. ISKRY (16 kierunków)
    // ══════════════════════════════════════════════════════════════════════
    var sparkColors = [
        [1.0, 0.9, 0.3],
        [1.0, 0.5, 0.1],
        [1.0, 1.0, 0.8]
    ];
    var numSparks = 16;
    for (var s = 0; s < numSparks; s++) {
        var angle = (360 / numSparks) * s + (Math.random() * 15 - 7);
        var spd   = 1.2 + Math.random() * 1.5;
        var life  = 0.3 + Math.random() * 0.4;
        var col   = sparkColors[Math.floor(Math.random() * sparkColors.length)];
        addSpark(angle, spd, life, col);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. KULA OGNIA (circle shape, rozszerza się i zanika)
    // ══════════════════════════════════════════════════════════════════════
    var fireball = comp.layers.addShape();
    fireball.name = "FIREBALL";
    fireball.startTime = T;
    fireball.label = 2;
    fireball.blendingMode = BlendingMode.ADD;

    var fbGrp  = fireball.property("Contents").addProperty("ADBE Vector Group");
    fbGrp.name = "FireCircle";

    var fbEl   = fbGrp.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    fbEl.property("Size").setValue([60, 60]);

    var fbFill = fbGrp.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    fbFill.property("Color").setValue([1.0, 0.4, 0.05]);

    fbGrp.property("Transform").property("Position").setValue([EX, EY]);

    fireball.property("Scale").setValueAtTime(T,        [0,   0  ]);
    fireball.property("Scale").setValueAtTime(T + 0.12, [120, 120]);
    fireball.property("Scale").setValueAtTime(T + 0.45, [200, 200]);

    fireball.property("Opacity").setValueAtTime(T,        100);
    fireball.property("Opacity").setValueAtTime(T + 0.15, 100);
    fireball.property("Opacity").setValueAtTime(T + 0.45,   0);

    // ══════════════════════════════════════════════════════════════════════
    // 5. DYMEK (circle shape, ciemny, unosi się w górę)
    // ══════════════════════════════════════════════════════════════════════
    var smoke = comp.layers.addShape();
    smoke.name = "SMOKE";
    smoke.startTime = T + 0.1;
    smoke.label = 1;
    smoke.blendingMode = BlendingMode.NORMAL;

    var smGrp  = smoke.property("Contents").addProperty("ADBE Vector Group");
    smGrp.name = "SmokeCircle";

    var smEl   = smGrp.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    smEl.property("Size").setValue([40, 40]);

    var smFill = smGrp.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    smFill.property("Color").setValue([0.15, 0.12, 0.10]);

    smGrp.property("Transform").property("Position").setValue([EX, EY]);

    smoke.property("Scale").setValueAtTime(T + 0.1,  [30,  30 ]);
    smoke.property("Scale").setValueAtTime(T + 2.0,  [300, 300]);

    smoke.property("Position").setValueAtTime(T + 0.1, [EX, EY]);
    smoke.property("Position").setValueAtTime(T + 2.5, [EX, EY - 120]);

    smoke.property("Opacity").setValueAtTime(T + 0.1, 85);
    smoke.property("Opacity").setValueAtTime(T + 1.0, 60);
    smoke.property("Opacity").setValueAtTime(T + 2.5,  0);

    // ── Ustaw głowicę na moment wybuchu ───────────────────────────────────
    comp.time = T;

    app.endUndoGroup();

    alert(
        "Wybuch dodany! Start: " + T + "s\n\n" +
        "Naciśnij 0 (numpad) → RAM Preview\n\n" +
        "Chcesz zmienić pozycję wybuchu?\n" +
        "Edytuj zmienne EX i EY w skrypcie\n" +
        "(domyślnie: środek kompozycji 960, 540)"
    );
})();
