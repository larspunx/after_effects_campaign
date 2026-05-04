(function fixFlagUK() {
    app.beginUndoGroup("Fix 1_flag_UK scale link");

    var TARGET = "1_flag_UK";
    var EXPR =
        "var s = value;\n" +
        "try {\n" +
        "    var m = thisComp.layer(\"MAP_Background\").transform.scale;\n" +
        "    [s[0] * m[0] / 100, s[1] * m[1] / 100];\n" +
        "} catch (e) {\n" +
        "    s;\n" +
        "}";

    var hits = 0;
    var diag = [];

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name !== TARGET) continue;
            hits++;

            // Sprawdź obecność MAP_Background w tej kompie
            var hasMap = false;
            for (var mi = 1; mi <= it.numLayers; mi++) {
                if (it.layer(mi).name === "MAP_Background") { hasMap = true; break; }
            }

            var pos = L.property("Position");
            var sc  = L.property("Scale");
            var rot = L.property("Rotation");

            var info =
                "comp=" + it.name +
                " parent=" + (L.parent ? L.parent.name : "none") +
                " hasMap=" + hasMap +
                " posExpr=" + (pos && pos.expressionEnabled ? "Y" : "n") +
                " scExpr=" + (sc && sc.expressionEnabled ? "Y(" + (sc.expression ? sc.expression.length : 0) + ")" : "n") +
                " rotExpr=" + (rot && rot.expressionEnabled ? "Y" : "n");
            diag.push(info);

            // Ustaw expression bezwarunkowo (nadpisując ewentualny stary)
            if (sc) {
                try {
                    sc.expression = EXPR;
                } catch (e) {
                    diag.push("ERR set expr: " + e);
                }
            }

            // Wpisz diagnostykę do Comment warstwy
            L.comment = info;
        }
    }

    if (hits === 0) {
        // Nie znaleziono — wpisz info do dowolnej istniejącej warstwy żeby użytkownik wiedział
        for (var ci = 1; ci <= app.project.numItems; ci++) {
            var c2 = app.project.item(ci);
            if (c2 instanceof CompItem && c2.numLayers > 0) {
                c2.layer(1).comment = "NIE ZNALEZIONO 1_flag_UK w projekcie (sprawdzone " + app.project.numItems + " itemów)";
                break;
            }
        }
    }

    app.endUndoGroup();
})();
