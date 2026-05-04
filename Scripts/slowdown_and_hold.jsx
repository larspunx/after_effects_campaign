/**
 * Spowalnia animację Position na ostatnich 2 sek + przedłuża widoczność
 * warstwy o 3 sek po dotarciu do końca trasy.
 *
 * Cele: 3_PLANE_df_przechwyc_bitwa_RIGHT i 3_PLANE_df_przechwyc_bitwa
 *
 * Logika dla każdej warstwy:
 *   1) Znajdź ostatni keyframe Position (czas T_END)
 *   2) Wstaw nowy keyframe w T_END - 2s z aktualną sampled-pozycją (krzywa
 *      trasy nie zmienia kształtu, dodaje się tylko "checkpoint czasowy")
 *   3) Wyłącz roving na nowym keyframe (anchor czasowy)
 *   4) Easy Ease (75% influence) między nowym a ostatnim → hamowanie
 *   5) outPoint warstwy = T_END + 3s → samolot zostaje widoczny po końcu
 */

(function slowdownAndHold() {
    app.beginUndoGroup("Slowdown And Hold");

    var TARGETS = [
        "3_PLANE_df_przechwyc_bitwa_RIGHT",
        "3_PLANE_df_przechwyc_bitwa"
    ];
    var SLOWDOWN_SEC = 2;
    var HOLD_SEC     = 3;
    var EASE_INFLUENCE = 75;  // % — wyższa wartość = mocniejsze hamowanie

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var report = [];

    for (var t = 0; t < TARGETS.length; t++) {
        var layerName = TARGETS[t];
        var layer = null;
        for (var l = 1; l <= comp.numLayers; l++) {
            if (comp.layer(l).name === layerName) { layer = comp.layer(l); break; }
        }
        if (!layer) {
            report.push("• " + layerName + " — NOT FOUND");
            continue;
        }

        var pos = layer.property("Position");
        if (!pos || pos.numKeys < 2) {
            report.push("• " + layerName + " — Position bez keyframe'ów (skip)");
            continue;
        }

        var lastIdx  = pos.numKeys;
        var lastTime = pos.keyTime(lastIdx);
        var firstTime = pos.keyTime(1);
        var slowdownStart = lastTime - SLOWDOWN_SEC;

        if (slowdownStart <= firstTime) {
            report.push("• " + layerName + " — trasa za krótka na " + SLOWDOWN_SEC + "s slowdown (skip)");
            continue;
        }

        // Sample bieżącej pozycji w slowdownStart (zachowuje istniejącą krzywą)
        var sampledPos;
        try {
            sampledPos = pos.valueAtTime(slowdownStart, false);
        } catch (e) {
            report.push("• " + layerName + " — valueAtTime failed: " + e);
            continue;
        }

        pos.setValueAtTime(slowdownStart, sampledPos);

        // Znajdź indeks nowo dodanego keyframe'a
        var newIdx = -1;
        for (var k = 1; k <= pos.numKeys; k++) {
            if (Math.abs(pos.keyTime(k) - slowdownStart) < 0.0001) { newIdx = k; break; }
        }
        if (newIdx === -1) {
            report.push("• " + layerName + " — nie znaleziono nowego keyframe (skip ease)");
            // i tak rozszerzymy outPoint poniżej
        } else {
            // Wyłącz roving (anchor czasowy)
            try { if (pos.keyRoving(newIdx)) pos.setRovingAtKey(newIdx, false); } catch (e) {}

            var newLastIdx = pos.numKeys; // może się zmienić

            // Bezier interpolation z Easy Ease między newIdx a newLastIdx
            var slowEase = new KeyframeEase(0, EASE_INFLUENCE);
            var linEase  = new KeyframeEase(0, 33.33);

            try {
                pos.setInterpolationTypeAtKey(newIdx,
                    KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.BEZIER);
                pos.setTemporalEaseAtKey(newIdx, [linEase], [slowEase]);

                pos.setInterpolationTypeAtKey(newLastIdx,
                    KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.LINEAR);
                pos.setTemporalEaseAtKey(newLastIdx, [slowEase], [linEase]);
            } catch (e) {
                report.push("  (ease apply error: " + e + ")");
            }
        }

        // Wydłuż widoczność: outPoint = T_END + HOLD_SEC
        var targetOut = lastTime + HOLD_SEC;
        try {
            if (layer.outPoint < targetOut) layer.outPoint = targetOut;
        } catch (e) {
            report.push("  (outPoint extend error: " + e + ")");
        }

        report.push("• " + layerName + " — ✓ slowdown ostatnie " + SLOWDOWN_SEC + "s, hold +" + HOLD_SEC + "s");
    }

    app.endUndoGroup();

    alert("Slowdown + Hold:\n\n" + report.join("\n"));
})();
