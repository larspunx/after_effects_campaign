(function () {
    app.beginUndoGroup("Repin flag offset");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { app.endUndoGroup(); return; }

    // Znajdź zaznaczoną flagę
    var flag = null;
    for (var i = 1; i <= comp.numLayers; i++) {
        var L = comp.layer(i);
        if (L.selected && L.name.toLowerCase().indexOf("flag") >= 0) {
            flag = L; break;
        }
    }
    if (!flag) { app.endUndoGroup(); return; }

    // Wyciągnij nazwę samolotu z istniejącego expression (lub poprzedniego)
    var pos = flag.property("Position");
    var planeName = null;

    // Sprawdź czy expression jest zapisany (nawet jeśli disabled)
    var existingExpr = pos.expression || "";
    var match = existingExpr.match(/thisComp\.layer\(\s*["']([^"']+)["']\s*\)/);
    if (match) planeName = match[1];

    if (!planeName) { app.endUndoGroup(); return; }

    // Znajdź warstwę samolotu
    var plane = null;
    for (var j = 1; j <= comp.numLayers; j++) {
        if (comp.layer(j).name === planeName) { plane = comp.layer(j); break; }
    }
    if (!plane) { app.endUndoGroup(); return; }

    // Pobierz aktualne pozycje w comp-space
    var t = comp.time;

    // Pozycja flagi (statyczna, bo expression wyłączony)
    var flagPos = pos.valueAtTime(t, false);

    // Pozycja samolotu w comp-space (przez toWorld)
    var tmpNull = comp.layers.addNull();
    tmpNull.name = "_tmp_probe";
    tmpNull.property("Position").expression =
        'var p = thisComp.layer("' + planeName + '");' +
        'p.toWorld(p.transform.anchorPoint)';
    var planeCompPos = tmpNull.property("Position").valueAtTime(t, false);
    tmpNull.remove();

    // Nowy offset
    var dx = flagPos[0] - planeCompPos[0];
    var dy = flagPos[1] - planeCompPos[1];

    // Ustaw nowy expression z nowym offsetem
    var newExpr =
        'var t = thisComp.layer("' + planeName + '");\n' +
        'var p = t.toWorld(t.anchorPoint);\n' +
        '[p[0] + (' + dx.toFixed(2) + '), p[1] + (' + dy.toFixed(2) + ')]';

    pos.expression = newExpr;
    flag.comment = "offset=[" + dx.toFixed(1) + ", " + dy.toFixed(1) + "] from " + planeName;

    app.endUndoGroup();
})();
