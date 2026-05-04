(function inspectFlags() {
    app.beginUndoGroup("Inspect Flags");
    var report = [];
    var clipboardPayload = "";

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toUpperCase().indexOf("FLAG") < 0) continue;

            var pos = L.property("Position");
            var sc  = L.property("Scale");
            var rot = L.property("Rotation");

            var posExpr = pos ? (pos.expressionEnabled ? pos.expression : "") : "";
            var scExpr  = sc  ? (sc.expressionEnabled  ? sc.expression  : "") : "";
            var rotExpr = rot ? (rot.expressionEnabled ? rot.expression : "") : "";
            var parent  = L.parent ? L.parent.name : "(none)";

            report.push(
                it.name + " / " + L.name +
                " | parent=" + parent +
                " | scaleExpr=" + (scExpr ? "YES (" + scExpr.length + " chars)" : "no") +
                " | posExpr=" + (posExpr ? "YES" : "no") +
                " | rotExpr=" + (rotExpr ? "YES" : "no")
            );
        }
    }

    // Look for MAP_Background presence per comp
    for (var i2 = 1; i2 <= app.project.numItems; i2++) {
        var it2 = app.project.item(i2);
        if (!(it2 instanceof CompItem)) continue;
        var hasMap = false;
        for (var li2 = 1; li2 <= it2.numLayers; li2++) {
            if (it2.layer(li2).name === "MAP_Background") { hasMap = true; break; }
        }
        report.push("comp '" + it2.name + "' MAP_Background=" + (hasMap ? "YES" : "no"));
    }

    clipboardPayload = report.join("\n");
    try {
        var f = new File("/tmp/_ae_flags.txt");
        f.encoding = "UTF-8";
        f.open("w");
        f.write(clipboardPayload);
        f.close();
    } catch (e) {}

    app.endUndoGroup();
})();
