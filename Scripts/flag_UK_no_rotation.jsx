// 2_flag_UK leci z bomberem ale nie obraca się — expression kontruje
// rotację rodzica (2_PLANE_bomber).
(function () {
    var TARGET_NAME = "2_flag_UK";

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
    if (!layer.parent) { alert(TARGET_NAME + " nie ma rodzica — nie ma czego kontrować"); return; }

    app.beginUndoGroup("Lock " + TARGET_NAME + " rotation");

    var rotProp = layer.property("ADBE Transform Group").property("ADBE Rotate Z");
    rotProp.expression = "-parent.transform.rotation";

    app.endUndoGroup();
})();
