(function () {
    app.beginUndoGroup("Create SCENE precomp");

    // Znajdź Main_Comp
    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i) instanceof CompItem &&
            app.project.item(i).name === "Main_Comp") {
            comp = app.project.item(i); break;
        }
    }
    if (!comp) { app.endUndoGroup(); return; }

    // 1) Zapamiętaj keyframe'y scale i anchor MAP_Background
    var mapScaleKeys = [];
    var mapAnchor = [comp.width / 2, comp.height / 2];
    for (var li = 1; li <= comp.numLayers; li++) {
        var L = comp.layer(li);
        if (L.name !== "MAP_Background") continue;
        var ap = L.property("Anchor Point");
        mapAnchor = [ap.value[0], ap.value[1]];
        var ms = L.property("Scale");
        for (var k = 1; k <= ms.numKeys; k++) {
            mapScaleKeys.push({ t: ms.keyTime(k), v: ms.keyValue(k) });
        }
        break;
    }

    // 2) Zaznacz wszystkie warstwy
    for (var sel = 1; sel <= comp.numLayers; sel++) {
        comp.layer(sel).selected = true;
    }

    // 3) Pre-compose przez wbudowaną komendę AE (ID 2071 = Layer > Pre-compose)
    app.project.activeItem = comp;
    app.executeCommand(2071);

    // 4) Po pre-compose: znajdź nową warstwę SCENE i jej kompę
    var sceneLayer = null;
    for (var fi = 1; fi <= comp.numLayers; fi++) {
        if (comp.layer(fi).source instanceof CompItem) {
            sceneLayer = comp.layer(fi);
            break;
        }
    }
    if (!sceneLayer) { app.endUndoGroup(); return; }

    sceneLayer.name = "SCENE";
    var sceneComp = sceneLayer.source;
    sceneComp.name = "SCENE";

    // 5) Wyzeruj MAP_Background.scale wewnątrz SCENE
    for (var si = 1; si <= sceneComp.numLayers; si++) {
        if (sceneComp.layer(si).name !== "MAP_Background") continue;
        var ms2 = sceneComp.layer(si).property("Scale");
        for (var rk = ms2.numKeys; rk >= 1; rk--) ms2.removeKey(rk);
        ms2.setValue([100, 100, 100]);
        break;
    }

    // 6) Anchor Point warstwy SCENE = oryginalny punkt zoomu mapy
    sceneLayer.property("Anchor Point").setValue([mapAnchor[0], mapAnchor[1]]);
    sceneLayer.property("Position").setValue([mapAnchor[0], mapAnchor[1]]);

    // 7) Przenieś animację scale na SCENE
    var sceneSc = sceneLayer.property("Scale");
    if (mapScaleKeys.length >= 2) {
        for (var sk = 0; sk < mapScaleKeys.length; sk++) {
            sceneSc.setValueAtTime(mapScaleKeys[sk].t, [mapScaleKeys[sk].v[0], mapScaleKeys[sk].v[1], 100]);
        }
        var linEase = [new KeyframeEase(0, 33.33)];
        sceneSc.setTemporalEaseAtKey(1, linEase, linEase);
        sceneSc.setTemporalEaseAtKey(sceneSc.numKeys, linEase, linEase);
    }

    comp.time = 0;
    app.endUndoGroup();
})();
