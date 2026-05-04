(function constantSpeedOne() {
    var TARGET = "1_PLANE_df_przechwyc_A";
    var LOG    = "/Users/mac/tsg/AfterEffects/Scripts/_constant_speed.log";

    function logMsg(s) {
        try {
            var f = new File(LOG); f.open("a"); f.writeln(s); f.close();
        } catch (e) {}
    }

    try { var clear = new File(LOG); clear.open("w"); clear.close(); } catch (e) {}

    app.beginUndoGroup("Constant Speed: " + TARGET);

    var found = null, foundComp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            if (it.layer(li).name === TARGET) {
                found = it.layer(li);
                foundComp = it;
                break;
            }
        }
        if (found) break;
    }

    if (!found) {
        logMsg("Nie znaleziono warstwy: " + TARGET);
        // wypisz wszystkie warstwy z nazwą zawierającą PLANE jako pomoc
        for (var ci = 1; ci <= app.project.numItems; ci++) {
            var c = app.project.item(ci);
            if (!(c instanceof CompItem)) continue;
            for (var lj = 1; lj <= c.numLayers; lj++) {
                if (c.layer(lj).name.indexOf("PLANE") >= 0) {
                    logMsg("  found: " + c.name + " / " + c.layer(lj).name);
                }
            }
        }
        app.endUndoGroup();
        return;
    }

    logMsg("Layer: " + foundComp.name + " / " + found.name);

    var pos = found.property("Position");
    if (!pos) { logMsg("Brak property Position"); app.endUndoGroup(); return; }
    if (pos.numKeys < 2) { logMsg("Za malo keyframe'ow: " + pos.numKeys); app.endUndoGroup(); return; }

    logMsg("Keyframes: " + pos.numKeys);
    for (var k = 1; k <= pos.numKeys; k++) {
        logMsg("  k" + k + " t=" + pos.keyTime(k).toFixed(3) + " val=" + pos.keyValue(k).toString());
    }

    // 1) Spatial auto-bezier — gladka krzywa
    for (var ka = 1; ka <= pos.numKeys; ka++) {
        try { pos.setSpatialAutoBezierAtKey(ka, true); } catch (e) { logMsg("  err auto-bezier k" + ka + ": " + e); }
    }

    // 2) Roving na srodkowych keyframe'ach — AE rozklada je proporcjonalnie do dlugosci krzywej
    for (var kr = 2; kr <= pos.numKeys - 1; kr++) {
        try { pos.setRovingAtKey(kr, true); } catch (e) { logMsg("  err roving k" + kr + ": " + e); }
    }

    // 3) Linear ease + linear interp na pierwszym i ostatnim — bez przyspieszania
    var linEase = [new KeyframeEase(0, 33.33)];
    try {
        pos.setTemporalEaseAtKey(1, linEase, linEase);
        pos.setTemporalEaseAtKey(pos.numKeys, linEase, linEase);
        pos.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        pos.setInterpolationTypeAtKey(pos.numKeys, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
    } catch (e) { logMsg("  err ease/interp: " + e); }

    logMsg("OK — stala predkosc ustawiona dla " + TARGET);
    app.endUndoGroup();
})();
