(function () {
    app.beginUndoGroup("Restore flag expression");
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { app.endUndoGroup(); return; }
    for (var i = 1; i <= comp.numLayers; i++) {
        var L = comp.layer(i);
        if (!L.selected) continue;
        if (L.name.toLowerCase().indexOf("flag") < 0) continue;
        var pos = L.property("Position");
        if (pos && pos.expression && !pos.expressionEnabled) {
            pos.expressionEnabled = true;
        }
    }
    app.endUndoGroup();
})();
