// Pełny reset 1_info_slot — bez keyframe'ów, slot ma być widoczny zawsze.
(function () {
    var TARGET_NAME = "1_info_slot";

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Brak Main_Comp"); return; }

    var layer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === TARGET_NAME) { layer = comp.layer(l); break; }
    }
    if (!layer) { alert("Brak " + TARGET_NAME); return; }

    app.beginUndoGroup("Reset " + TARGET_NAME);

    layer.enabled = true;
    layer.shy = false;

    var tg = layer.property("ADBE Transform Group");
    var anchor = tg.property("ADBE Anchor Point");
    var pos    = tg.property("ADBE Position");
    var scale  = tg.property("ADBE Scale");
    var opacity = tg.property("ADBE Opacity");

    // Czyść keyframe'y na transformach
    function clearKeys(p) { while (p && p.numKeys > 0) p.removeKey(1); }
    clearKeys(anchor);
    clearKeys(pos);
    clearKeys(scale);
    clearKeys(opacity);

    // Anchor -> środek źródła
    var rect = layer.sourceRectAtTime(comp.time, false);
    var ax = rect.left + rect.width / 2;
    var ay = rect.top + rect.height / 2;
    var aOld = anchor.value;
    anchor.setValue(aOld.length === 3 ? [ax, ay, aOld[2]] : [ax, ay]);

    // Position -> środek kompozycji
    var pOld = pos.value;
    pos.setValue(pOld.length === 3 ? [comp.width / 2, comp.height / 2, pOld[2]] : [comp.width / 2, comp.height / 2]);

    // Scale 100
    var sOld = scale.value;
    scale.setValue(sOld.length === 3 ? [100, 100, 100] : [100, 100]);

    // Opacity 100
    opacity.setValue(100);

    // Wyłącz parent (gdyby parent był poza ekranem)
    layer.parent = null;

    app.endUndoGroup();
})();
