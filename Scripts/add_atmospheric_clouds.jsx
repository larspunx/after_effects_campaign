/**
 * Atmosferyczne chmury nad mapą — system 2 warstw z paralaksą.
 *
 *   CLOUDS_BASE   — duża, powolna baza (delikatna mgła w tle)
 *   CLOUDS_WISPY  — drobne pasma, szybsze, ostrzejsze (warstwa wyżej)
 *
 * Każda warstwa: Fractal Noise → Curves (crush blacks → transparency w SCREEN)
 *                → Fast Box Blur (miękkość) → Glow (bloom whites) → Tint.
 * Plus subtelne "oddychanie" przez Turbulent Displace.
 *
 * File > Scripts > Run Script File...
 */

(function addAtmosphericClouds() {
    app.beginUndoGroup("Add Atmospheric Clouds");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // Idempotencja
    for (var rmI = comp.numLayers; rmI >= 1; rmI--) {
        var nm = comp.layer(rmI).name;
        if (nm === "CLOUDS_BASE" || nm === "CLOUDS_WISPY" || nm === "CLOUDS") {
            comp.layer(rmI).remove();
        }
    }

    function setIf(group, propName, value) {
        if (!group) return;
        try { var p = group.property(propName); if (p) p.setValue(value); } catch (e) {}
    }
    function setIfTime(group, propName, time, value) {
        if (!group) return;
        try { var p = group.property(propName); if (p) p.setValueAtTime(time, value); } catch (e) {}
    }
    function safeAdd(effGroup, effectName) {
        try { return effGroup.addProperty(effectName); }
        catch (e) { $.writeln("[clouds] addProperty FAILED: " + effectName + " — " + e); return null; }
    }
    function safeAddAny(effGroup, candidates) {
        for (var i = 0; i < candidates.length; i++) {
            var r = safeAdd(effGroup, candidates[i]);
            if (r) return r;
        }
        return null;
    }

    /**
     * Tworzy warstwę chmur z pełnym stosem efektów.
     * @param name        nazwa warstwy
     * @param noiseScale  skala Fractal Noise (większa = większe chmury)
     * @param contrast    kontrast (większy = ostrzejsze pasma)
     * @param brightness  jasność
     * @param complexity  złożoność (1-10)
     * @param evolutionTurn   ile stopni Evolution przez całą kompozycję
     * @param driftPx     jak daleko zdryfują w poziomie
     * @param blurAmount  Fast Box Blur Iterations × radius (miękkość)
     * @param crushBlack  Curves — punkt crushowania czerni (0-1, większe = mniej chmur)
     * @param liftWhite   Curves — punkt rozjaśniania bieli (0-1, mniejsze = jaśniejsze chmury)
     * @param glowRadius  Glow radius
     * @param tintColor   kolor wartości "white" (RGB 0-1)
     * @param opacity     opacity warstwy (%)
     */
    function makeCloudLayer(opts) {
        var L = comp.layers.addSolid([0.5, 0.5, 0.5], opts.name,
                                      comp.width, comp.height, 1, comp.duration);
        L.label = 6;
        L.blendingMode = BlendingMode.SCREEN;
        try { L.property("Opacity").setValue(opts.opacity); } catch (e) {}

        // ── Fractal Noise ───────────────────────────────────────────────────
        var fn = safeAdd(L.Effects, "Fractal Noise");
        setIf(fn, "Fractal Type", 1);          // Basic
        setIf(fn, "Noise Type", 3);            // Soft Linear
        setIf(fn, "Contrast", opts.contrast);
        setIf(fn, "Brightness", opts.brightness);
        setIf(fn, "Complexity", opts.complexity);

        try {
            var transformGrp = fn ? fn.property("Transform") : null;
            if (transformGrp) {
                setIf(transformGrp, "Uniform Scaling", false);
                setIf(transformGrp, "Scale Width", opts.noiseScale * 1.4);
                setIf(transformGrp, "Scale Height", opts.noiseScale * 0.6);

                var offsetProp = transformGrp.property("Offset Turbulence");
                if (offsetProp) {
                    offsetProp.setValueAtTime(0,             [comp.width / 2, comp.height / 2]);
                    offsetProp.setValueAtTime(comp.duration, [comp.width / 2 + opts.driftPx, comp.height / 2 - opts.driftPx * 0.1]);
                }
            }
        } catch (e) { $.writeln("[clouds] transform/offset failed: " + e); }
        setIfTime(fn, "Evolution", 0,             0);
        setIfTime(fn, "Evolution", comp.duration, opts.evolutionTurn);

        // ── Levels — crush blacks (dziury) + lift whites ────────────────────
        var lev = safeAdd(L.Effects, "Levels");
        setIf(lev, "Input Black", opts.crushBlack * 255);
        setIf(lev, "Input White", opts.liftWhite * 255);
        setIf(lev, "Gamma", 1.1);

        // ── Turbulent Displace — subtelne morfowanie ────────────────────────
        var td = safeAdd(L.Effects, "Turbulent Displace");
        setIf(td, "Amount", 8);
        setIf(td, "Size", 80);
        setIfTime(td, "Evolution", 0,             0);
        setIfTime(td, "Evolution", comp.duration, 180);

        // ── Blur — miękkość, atmosferyczność ────────────────────────────────
        var blur = safeAddAny(L.Effects, ["Fast Box Blur", "Box Blur", "Gaussian Blur"]);
        setIf(blur, "Blur Radius", opts.blurAmount);
        setIf(blur, "Blurriness", opts.blurAmount);    // Gaussian
        setIf(blur, "Iterations", 3);
        setIf(blur, "Repeat Edge Pixels", true);

        // ── Glow — bloom whites ─────────────────────────────────────────────
        var glow = safeAdd(L.Effects, "Glow");
        setIf(glow, "Glow Threshold", 50);
        setIf(glow, "Glow Radius", opts.glowRadius);
        setIf(glow, "Glow Intensity", 0.6);

        // ── Tint — odcień nieba ─────────────────────────────────────────────
        var tint = safeAdd(L.Effects, "Tint");
        setIf(tint, "Map Black To", [0.02, 0.04, 0.08]);
        setIf(tint, "Map White To", opts.tintColor);
        setIf(tint, "Amount to Tint", 100);

        return L;
    }

    // ── Warstwa 1: BASE — duża, powolna mgła ──────────────────────────────
    var base = makeCloudLayer({
        name: "CLOUDS_BASE",
        noiseScale: 1400,    // duże kłęby
        contrast: 35,        // niski kontrast = miękka mgła
        brightness: -10,
        complexity: 3,
        evolutionTurn: 45,   // bardzo wolno się zmienia
        driftPx: 250,        // wolny dryf
        blurAmount: 30,      // mocno rozmyte
        crushBlack: 0.35,
        liftWhite: 0.85,
        glowRadius: 80,
        tintColor: [0.92, 0.95, 1.0],   // chłodny biały
        opacity: 35
    });

    // ── Warstwa 2: WISPY — drobne pasma, szybsze, ostrzejsze ───────────────
    var wispy = makeCloudLayer({
        name: "CLOUDS_WISPY",
        noiseScale: 550,     // drobniejsze pasma
        contrast: 80,        // wysoki kontrast = wyraźne włókna
        brightness: -25,
        complexity: 5,
        evolutionTurn: 180,  // szybciej się zmienia
        driftPx: 600,        // szybszy dryf — paralaksa
        blurAmount: 12,      // lekko rozmyte
        crushBlack: 0.55,    // mocniejszy crush — wisp pojawiają się tylko miejscami
        liftWhite: 0.90,
        glowRadius: 35,
        tintColor: [0.98, 0.98, 1.0],   // jasny biały
        opacity: 50
    });

    // ── Render order: oba nad MAP_Background, BASE niżej, WISPY wyżej ──────
    var mapLayer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === "MAP_Background") { mapLayer = comp.layer(l); break; }
    }
    if (mapLayer) {
        base.moveBefore(mapLayer);
        wispy.moveBefore(base);  // WISPY nad BASE
    }

    app.endUndoGroup();

    alert(
        "Atmosferyczne chmury dodane (2 warstwy z paralaksą).\n\n" +
        "CLOUDS_BASE — wolna mgła w tle\n" +
        "CLOUDS_WISPY — drobne pasma z subtelnym ruchem\n\n" +
        "Tuning per warstwa w opts {...} w skrypcie:\n" +
        "noiseScale, contrast, blurAmount, opacity, glowRadius."
    );
})();
