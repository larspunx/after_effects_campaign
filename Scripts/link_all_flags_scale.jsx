(function linkAllFlagsScale() {
    app.beginUndoGroup("Link all flag scales to MAP_Background");

    var EXPR =
        "var s = value;\n" +
        "try {\n" +
        "  var m = thisComp.layer(\"MAP_Background\").transform.scale;\n" +
        "  [s[0]*m[0]/100, s[1]*m[1]/100]\n" +
        "} catch(e) { s }";

    var stamp = new Date().toTimeString().substring(0, 8);
    var changed = 0;
    var skipped = 0;

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;

        // MAP_Background musi być w tej samej kompie
        var hasMap = false;
        for (var mi = 1; mi <= it.numLayers; mi++) {
            if (it.layer(mi).name === "MAP_Background") { hasMap = true; break; }
        }
        if (!hasMap) continue;

        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            // sygnatura "flag" w nazwie (case-insensitive)
            if (L.name.toLowerCase().indexOf("flag") < 0) continue;

            // pattern "trzymanie poziomu" = expression na Rotation (przeciwdziałający rotacji rodzica/celu)
            var rot = L.property("Rotation");
            var hasRotExpr = rot && rot.expressionEnabled && rot.expression && rot.expression.length > 0;
            if (!hasRotExpr) {
                L.comment = "[" + stamp + "] skip: brak rotation expr";
                skipped++;
                continue;
            }

            var sc = L.property("Scale");
            if (!sc) { skipped++; continue; }

            try {
                sc.expression = EXPR;
                L.comment = "[" + stamp + "] scale linked → MAP_Background";
                changed++;
            } catch (e) {
                L.comment = "[" + stamp + "] ERR: " + e.toString();
                skipped++;
            }
        }
    }

    app.endUndoGroup();
})();
