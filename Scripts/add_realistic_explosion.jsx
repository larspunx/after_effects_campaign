/**
 * Realistyczny wybuch — Fractal Noise + Glow + animacja maski
 * File > Scripts > Run Script File...
 */

(function addRealisticExplosion() {
    app.beginUndoGroup("Add Realistic Explosion");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // ── Konfiguracja ───────────────────────────────────────────────────────
    var EX   = 960;    // pozycja X wybuchu (px)
    var EY   = 540;    // pozycja Y wybuchu (px)
    var T    = 2.0;    // czas startu (sekundy)
    var SIZE = 300;    // rozmiar wybuchu (px) — zwiększ/zmniejsz wg potrzeb
    // ──────────────────────────────────────────────────────────────────────

    var W = SIZE * 2;
    var H = SIZE * 2;

    // ══════════════════════════════════════════════════════════════════════
    // 1. FLASH — błysk w momencie uderzenia
    // ══════════════════════════════════════════════════════════════════════
    var flash = comp.layers.addSolid([1.0, 0.95, 0.6], "EXPL_Flash", comp.width, comp.height, 1, 0.12);
    flash.startTime = T;
    flash.blendingMode = BlendingMode.ADD;
    flash.label = 8;
    flash.property("Opacity").setValueAtTime(T,        100);
    flash.property("Opacity").setValueAtTime(T + 0.06,  50);
    flash.property("Opacity").setValueAtTime(T + 0.12,   0);

    // ══════════════════════════════════════════════════════════════════════
    // 2. KULA OGNIA — Fractal Noise zabarwiony na ogień
    // ══════════════════════════════════════════════════════════════════════
    var fireDur = 1.8;
    var fire = comp.layers.addSolid([0, 0, 0], "EXPL_Fire", W, H, 1, fireDur);
    fire.startTime = T;
    fire.label = 2;
    fire.blendingMode = BlendingMode.SCREEN;
    fire.property("Position").setValue([EX, EY]);

    // Maska eliptyczna — ogranicza ogień do kuli
    var fireMask = fire.Masks.addProperty("Mask");
    var maskShape = new Shape();
    var r = SIZE * 0.8;
    maskShape.vertices  = [[-r,0],[0,-r],[r,0],[0,r]];
    maskShape.inTangents  = [[-r*0.55,-r*0.55],[r*0.55,-r*0.55],[r*0.55,r*0.55],[-r*0.55,r*0.55]];
    maskShape.outTangents = [[r*0.55,-r*0.55],[-r*0.55,-r*0.55],[-r*0.55,r*0.55],[r*0.55,r*0.55]];
    maskShape.closed = true;
    fireMask.property("Mask Path").setValue(maskShape);
    fireMask.property("Mask Feather").setValue([SIZE * 0.3, SIZE * 0.3]);
    fireMask.property("Mask Expansion").setValue(SIZE * 0.1);

    // Fractal Noise
    var fn = fire.Effects.addProperty("ADBE Fractal Noise");
    fn.property("ADBE FN-0001").setValue(1);    // Fractal Type = Basic
    fn.property("ADBE FN-0003").setValue(2.5);  // Contrast
    fn.property("ADBE FN-0004").setValue(0.7);  // Brightness (nieco ciemniejszy)
    fn.property("ADBE FN-0006").setValue(true);  // Invert
    fn.property("ADBE FN-0007").setValue(3.0);  // Complexity

    // Animacja Evolution — szum "płonie"
    fn.property("ADBE FN-0009").setValueAtTime(T,            0);
    fn.property("ADBE FN-0009").setValueAtTime(T + fireDur,  720);

    // Animacja Scale — wybuch rośnie, potem opada
    fn.property("ADBE FN Transform-0002").setValueAtTime(T,            80);
    fn.property("ADBE FN Transform-0002").setValueAtTime(T + 0.3,      200);
    fn.property("ADBE FN Transform-0002").setValueAtTime(T + fireDur,   350);

    // Levels — podbijamy biel żeby wyglądało jak ogień
    var lev = fire.Effects.addProperty("ADBE Levels2");
    lev.property("ADBE Levels2-0001").property(4).setValue(0.6);  // Input gamma

    // Colorama — zabarwiamy na pomarańcz/żółty/czerwony
    var colorama = fire.Effects.addProperty("ADBE Colorama");
    if (colorama) {
        colorama.property("ADBE Colorama-0002").setValue(4); // Output cycle = Fire
    }

    // Glow
    var glow = fire.Effects.addProperty("ADBE Glo2");
    glow.property("ADBE Glo2-0001").setValue(80);   // Threshold
    glow.property("ADBE Glo2-0002").setValue(SIZE * 0.4);  // Radius
    glow.property("ADBE Glo2-0004").setValue(1.5);  // Intensity

    // Skala całej warstwy — wybuch rośnie a potem znika
    fire.property("Scale").setValueAtTime(T,            [10,  10 ]);
    fire.property("Scale").setValueAtTime(T + 0.2,      [90,  90 ]);
    fire.property("Scale").setValueAtTime(T + 0.5,      [100, 100]);
    fire.property("Scale").setValueAtTime(T + fireDur,  [110, 110]);

    fire.property("Opacity").setValueAtTime(T,             100);
    fire.property("Opacity").setValueAtTime(T + fireDur * 0.5, 90);
    fire.property("Opacity").setValueAtTime(T + fireDur,     0);

    // ══════════════════════════════════════════════════════════════════════
    // 3. DYM — ciemny Fractal Noise unoszący się w górę
    // ══════════════════════════════════════════════════════════════════════
    var smokeDur = 4.0;
    var smoke = comp.layers.addSolid([0.08, 0.06, 0.05], "EXPL_Smoke", W * 1.5, H * 1.5, 1, smokeDur);
    smoke.startTime = T + 0.15;
    smoke.label = 1;
    smoke.blendingMode = BlendingMode.MULTIPLY;
    smoke.property("Position").setValue([EX, EY]);

    // Maska dymu — większa i bardziej rozmyta niż ogień
    var smokeMask = smoke.Masks.addProperty("Mask");
    var smokeShape = new Shape();
    var rs = SIZE * 0.9;
    smokeShape.vertices  = [[-rs,0],[0,-rs],[rs,0],[0,rs]];
    smokeShape.inTangents  = [[-rs*0.55,-rs*0.55],[rs*0.55,-rs*0.55],[rs*0.55,rs*0.55],[-rs*0.55,rs*0.55]];
    smokeShape.outTangents = [[rs*0.55,-rs*0.55],[-rs*0.55,-rs*0.55],[-rs*0.55,rs*0.55],[rs*0.55,rs*0.55]];
    smokeShape.closed = true;
    smokeMask.property("Mask Path").setValue(smokeShape);
    smokeMask.property("Mask Feather").setValue([SIZE * 0.6, SIZE * 0.6]);

    var sfn = smoke.Effects.addProperty("ADBE Fractal Noise");
    sfn.property("ADBE FN-0003").setValue(1.8);   // Contrast
    sfn.property("ADBE FN-0004").setValue(-0.3);  // Brightness
    sfn.property("ADBE FN-0007").setValue(5.0);   // Complexity

    // Dym ewoluuje i unosi się w górę
    sfn.property("ADBE FN-0009").setValueAtTime(T + 0.15, 0);
    sfn.property("ADBE FN-0009").setValueAtTime(T + smokeDur, 540);

    sfn.property("ADBE FN Transform-0001").property(1).setValueAtTime(T + 0.15, [0, 0]);
    sfn.property("ADBE FN Transform-0001").property(1).setValueAtTime(T + smokeDur, [0, -SIZE * 1.5]);

    smoke.property("Scale").setValueAtTime(T + 0.15,          [20,  20 ]);
    smoke.property("Scale").setValueAtTime(T + 0.6,           [80,  80 ]);
    smoke.property("Scale").setValueAtTime(T + smokeDur,      [160, 160]);

    smoke.property("Position").setValueAtTime(T + 0.15,   [EX, EY]);
    smoke.property("Position").setValueAtTime(T + smokeDur, [EX, EY - SIZE * 1.2]);

    smoke.property("Opacity").setValueAtTime(T + 0.15,          0);
    smoke.property("Opacity").setValueAtTime(T + 0.4,          85);
    smoke.property("Opacity").setValueAtTime(T + smokeDur * 0.6, 70);
    smoke.property("Opacity").setValueAtTime(T + smokeDur,       0);

    // ══════════════════════════════════════════════════════════════════════
    // 4. PIERŚCIEŃ UDERZENIOWY
    // ══════════════════════════════════════════════════════════════════════
    var ring = comp.layers.addShape();
    ring.name = "EXPL_Shockwave";
    ring.startTime = T;
    ring.blendingMode = BlendingMode.ADD;
    ring.label = 8;

    var rGrp = ring.property("Contents").addProperty("ADBE Vector Group");
    var rEl  = rGrp.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    rEl.property("Size").setValue([SIZE * 0.1, SIZE * 0.1]);
    var rSt  = rGrp.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    rSt.property("Color").setValue([1.0, 0.8, 0.4]);
    rSt.property("Stroke Width").setValue(8);
    rGrp.property("Transform").property("Position").setValue([EX, EY]);

    ring.property("Scale").setValueAtTime(T,       [0,   0  ]);
    ring.property("Scale").setValueAtTime(T + 0.4, [SIZE * 0.7, SIZE * 0.7]);
    ring.property("Opacity").setValueAtTime(T,       100);
    ring.property("Opacity").setValueAtTime(T + 0.15, 80);
    ring.property("Opacity").setValueAtTime(T + 0.4,   0);

    // ── Ustaw głowicę ──────────────────────────────────────────────────────
    comp.time = T;

    app.endUndoGroup();

    alert(
        "Realistyczny wybuch dodany!\n\n" +
        "Start: " + T + "s  |  Pozycja: " + EX + ", " + EY + "\n\n" +
        "Naciśnij 0 (numpad) → RAM Preview\n\n" +
        "Aby zmienić pozycję/rozmiar:\n" +
        "Otwórz skrypt i zmień EX, EY i SIZE na górze pliku."
    );
})();
