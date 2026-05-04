(function () {
    app.beginUndoGroup("Create SCENE_CONTROLLER");

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i) instanceof CompItem &&
            app.project.item(i).name === "Main_Comp") {
            comp = app.project.item(i); break;
        }
    }
    if (!comp) { app.endUndoGroup(); return; }

    // Usuń stary controller jeśli istnieje
    for (var d = comp.numLayers; d >= 1; d--) {
        if (comp.layer(d).name === "SCENE_CONTROLLER") comp.layer(d).remove();
    }

    // 1) Nowy Null
    var ctrl = comp.layers.addNull();
    ctrl.name  = "SCENE_CONTROLLER";
    ctrl.label = 14; // żółty
    ctrl.moveToBeginning();

    // Anchor Point i Position = środek kompy (zoom z centrum)
    var cx = comp.width  / 2;
    var cy = comp.height / 2;
    ctrl.property("Anchor Point").setValue([cx, cy]);
    ctrl.property("Position").setValue([cx, cy]);

    // 2) Zapamiętaj i przenieś animację scale z MAP_Background
    var mapLayer = null;
    for (var li = 1; li <= comp.numLayers; li++) {
        if (comp.layer(li).name === "MAP_Background") { mapLayer = comp.layer(li); break; }
    }

    if (mapLayer) {
        var mapSc = mapLayer.property("Scale");
        var ctrlSc = ctrl.property("Scale");
        if (mapSc.numKeys >= 2) {
            // Skopiuj keyframe'y na controller
            for (var k = 1; k <= mapSc.numKeys; k++) {
                var v = mapSc.keyValue(k);
                ctrlSc.setValueAtTime(mapSc.keyTime(k), [v[0], v[1], 100]);
            }
            var linEase = [new KeyframeEase(0, 33.33)];
            ctrlSc.setTemporalEaseAtKey(1, linEase, linEase);
            ctrlSc.setTemporalEaseAtKey(ctrlSc.numKeys, linEase, linEase);
            // Wyzeruj skalę MAP_Background
            for (var rk = mapSc.numKeys; rk >= 1; rk--) mapSc.removeKey(rk);
            mapSc.setValue([100, 100, 100]);
        }
    }

    // 3) Przypnij WSZYSTKIE warstwy (oprócz samego controllera) do SCENE_CONTROLLER
    for (var pi = 1; pi <= comp.numLayers; pi++) {
        var L = comp.layer(pi);
        if (L.name === "SCENE_CONTROLLER") continue;
        // Przypnij tylko warstwy bez parenta lub z parentem będącym inną warstwą w kompie
        // (nie ruszaj hierarchii wewnętrznej — plane→MAP_Background zostaje)
        if (!L.parent) {
            L.parent = ctrl;
        }
    }

    comp.time = 0;
    app.endUndoGroup();
})();
