(function () {
    app.beginUndoGroup("Link flag scale to plane");

    var done = 0;
    var skipped = 0;

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toLowerCase().indexOf("flag") < 0) continue;

            var rot = L.property("Rotation");
            if (!rot || !rot.expressionEnabled) { skipped++; continue; }

            var pos = L.property("Position");
            var srcExpr = pos && pos.expressionEnabled ? pos.expression : "";

            // wyciągnij pierwszą referencję typu thisComp.layer("PLANE...")
            var match = srcExpr.match(/thisComp\.layer\(\s*["']([^"']*PLANE[^"']*)["']\s*\)/i);
            if (!match) { skipped++; L.comment = "no plane in pos expr"; continue; }
            var planeName = match[1];

            var sc = L.property("Scale");
            if (!sc) { skipped++; continue; }

            // Expression: flaga = value × efektywnaSkala(plane) / 100
            // efektywna = local × parent.scale / 100 (jeśli plane ma parenta)
            var EXPR =
                "var p = thisComp.layer(\"" + planeName + "\");\n" +
                "var s = p.transform.scale;\n" +
                "if (p.hasParent) {\n" +
                "    var ps = p.parent.transform.scale;\n" +
                "    s = [s[0]*ps[0]/100, s[1]*ps[1]/100];\n" +
                "}\n" +
                "[value[0]*s[0]/100, value[1]*s[1]/100]";

            try {
                sc.expression = EXPR;
                L.comment = "linked → " + planeName;
                done++;
            } catch (e) {
                L.comment = "ERR: " + e.toString();
                skipped++;
            }
        }
    }
    app.endUndoGroup();
})();
