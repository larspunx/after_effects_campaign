(function () {
    app.beginUndoGroup("Unlock flag position");
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { app.endUndoGroup(); return; }

    for (var i = 1; i <= comp.numLayers; i++) {
        var L = comp.layer(i);
        if (!L.selected) continue;
        if (L.name.toLowerCase().indexOf("flag") < 0) continue;

        var pos = L.property("Position");
        if (pos && pos.expressionEnabled) {
            // Zapamiętaj aktualną wartość przed wyłączeniem
            var curVal = pos.valueAtTime(comp.time, false);
            pos.expressionEnabled = false;
            pos.setValue(curVal);
        }
    }
    app.endUndoGroup();
})();
