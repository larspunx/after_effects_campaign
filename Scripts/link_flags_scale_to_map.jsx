(function linkFlagsScaleToMap() {
    app.beginUndoGroup("Link Flag Scale to MAP_Background");

    // Expression: bazowa skala flagi × bieżąca skala mapy / 100.
    // Działa tylko gdy MAP_Background jest w tej samej kompie.
    var EXPR =
        "var s = value;\n" +
        "try {\n" +
        "    var m = thisComp.layer(\"MAP_Background\").transform.scale;\n" +
        "    [s[0] * m[0] / 100, s[1] * m[1] / 100];\n" +
        "} catch (e) {\n" +
        "    s;\n" +
        "}";

    var changed = 0;
    var skipped = 0;

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;

        // sprawdź czy comp ma MAP_Background — bez niego expression nie ma sensu
        var hasMap = false;
        for (var mi = 1; mi <= it.numLayers; mi++) {
            if (it.layer(mi).name === "MAP_Background") { hasMap = true; break; }
        }
        if (!hasMap) continue;

        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toUpperCase().indexOf("FLAG") < 0) continue;

            // tylko flagi "podpięte do rodzica" — czyli z parentem albo z expression na Position
            var pos = L.property("Position");
            var hasParent = !!L.parent;
            var hasPosExpr = pos && pos.expressionEnabled && pos.expression.length > 0;
            if (!hasParent && !hasPosExpr) continue;

            var sc = L.property("Scale");
            if (!sc) continue;
            if (sc.expressionEnabled && sc.expression.length > 0) { skipped++; continue; }

            sc.expression = EXPR;
            changed++;
        }
    }

    app.endUndoGroup();

    // zwróć info do AppleScript jako wartość ostatniego wyrażenia
    "changed=" + changed + " skipped=" + skipped;
})();
