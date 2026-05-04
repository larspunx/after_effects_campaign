(function () {
    app.beginUndoGroup("Check flag state");

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toLowerCase().indexOf("flag") < 0) continue;

            var rot = L.property("Rotation");
            var sc  = L.property("Scale");
            var pos = L.property("Position");

            var report =
                "rot=" + (rot && rot.expressionEnabled ? "Y" : "n") +
                " pos=" + (pos && pos.expressionEnabled ? "Y" : "n") +
                " sc=" + (sc && sc.expressionEnabled ? "Y" : "n") +
                " base=" + (sc ? sc.value.toString() : "?") +
                " parent=" + (L.parent ? L.parent.name : "none");

            if (sc && sc.expressionEnabled && sc.expression) {
                var hasMap = sc.expression.indexOf("MAP_Background") >= 0;
                var hasPlane = sc.expression.indexOf("PLANE") >= 0;
                report += " expr→" + (hasMap ? "MAP" : (hasPlane ? "PLANE" : "OTHER"));
            }

            L.comment = report;
        }
    }
    app.endUndoGroup();
})();
