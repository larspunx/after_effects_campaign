(function () {
    app.beginUndoGroup("Duplicate flag+plane pair");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { app.endUndoGroup(); return; }

    // Znajdź zaznaczone warstwy — jedna flaga, jeden samolot
    var flagLayer  = null;
    var planeLayer = null;

    for (var i = 1; i <= comp.numLayers; i++) {
        var L = comp.layer(i);
        if (!L.selected) continue;
        if (L.name.toLowerCase().indexOf("flag") >= 0) flagLayer  = L;
        else                                             planeLayer = L;
    }

    if (!flagLayer || !planeLayer) {
        // fallback: pierwsze dwie zaznaczone
        var sel = [];
        for (var j = 1; j <= comp.numLayers; j++) {
            if (comp.layer(j).selected) sel.push(comp.layer(j));
        }
        if (sel.length >= 2) { flagLayer = sel[0]; planeLayer = sel[1]; }
    }

    if (!flagLayer || !planeLayer) { app.endUndoGroup(); return; }

    // Duplikuj samolot i flagę
    var newPlane = planeLayer.duplicate();
    var newFlag  = flagLayer.duplicate();

    // Nowy samolot dziedziczy parenta oryginalnego (np. MAP_Background)
    if (planeLayer.parent && !newPlane.parent) {
        newPlane.parent = planeLayer.parent;
    }

    // Nowa flaga: brak parenta (tak jak oryginał)
    newFlag.parent = null;

    // Przebuduj Position expression nowej flagi — podmień nazwę samolotu
    var pos = newFlag.property("Position");
    if (pos && pos.expressionEnabled && pos.expression) {
        var expr = pos.expression;
        // Zamień nazwę starego samolotu na nowego
        expr = expr.split('"' + planeLayer.name + '"').join('"' + newPlane.name + '"');
        expr = expr.split("'" + planeLayer.name + "'").join("'" + newPlane.name + "'");
        try { pos.expression = expr; } catch (e) {}
    }

    // Skopiuj też Rotation expression (trzymanie poziomu)
    var rot     = flagLayer.property("Rotation");
    var newRot  = newFlag.property("Rotation");
    if (rot && rot.expressionEnabled && rot.expression) {
        var rotExpr = rot.expression;
        rotExpr = rotExpr.split('"' + planeLayer.name + '"').join('"' + newPlane.name + '"');
        rotExpr = rotExpr.split("'" + planeLayer.name + "'").join("'" + newPlane.name + "'");
        try { newRot.expression = rotExpr; } catch (e) {}
    }

    // Odznacz oryginały, zaznacz nowe
    flagLayer.selected  = false;
    planeLayer.selected = false;
    newFlag.selected    = true;
    newPlane.selected   = true;

    // Info do weryfikacji
    newFlag.comment = "follows: " + newPlane.name;

    app.endUndoGroup();
})();
