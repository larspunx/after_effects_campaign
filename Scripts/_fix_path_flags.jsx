(function () {
    app.beginUndoGroup("Fix path flags: scale offset with map");

    var SCALE_EXPR =
        "var s = value;\n" +
        "try {\n" +
        "  var m = thisComp.layer(\"MAP_Background\").transform.scale;\n" +
        "  [s[0]*m[0]/100, s[1]*m[1]/100]\n" +
        "} catch(e) { s }";

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;

        var hasMap = false;
        for (var mi = 1; mi <= it.numLayers; mi++) {
            if (it.layer(mi).name === "MAP_Background") { hasMap = true; break; }
        }
        if (!hasMap) continue;

        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toLowerCase().indexOf("flag") < 0) continue;
            if (L.parent) continue;

            var pos = L.property("Position");
            if (!pos || !pos.expressionEnabled) continue;
            var posExpr = pos.expression || "";

            // Wyciągnij nazwę plane'a i offset z istniejącego expression.
            // Pattern: thisComp.layer("...")  ...  [dx, dy] na końcu.
            var planeMatch = posExpr.match(/thisComp\.layer\(\s*["']([^"']+)["']\s*\)/);

            // Znajdź OSTATNI blok [...] w expression i wyciągnij z niego pierwsze
            // dwie liczby ze znakami. Działa dla wszystkich formatów:
            //   [10, -20]
            //   [p[0] + (-90), p[1] + (-55)]
            //   [-90 * m, -55 * m]
            var dx = null, dy = null;
            var bracketRe = /\[([^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*)\]/g;
            var lastBlock = null, bm;
            while ((bm = bracketRe.exec(posExpr)) !== null) lastBlock = bm[1];
            if (lastBlock !== null) {
                var nums = lastBlock.match(/-?\d+\.?\d*/g);
                if (nums && nums.length >= 2) {
                    // pomiń liczby które są indeksami w p[0]/p[1] (czyli pojedyncze 0 lub 1
                    // w środku struktury "p[0]"); pierwsze 2 liczby z OSTATNIEGO bloku to offset
                    // - dla "[p[0] + (-90), p[1] + (-55)]" → ["0", "-90", "1", "-55"]
                    // - dla "[-90 * m, -55 * m]" → ["-90", "-55"]
                    // - dla "[10, -20]" → ["10", "-20"]
                    if (nums.length === 2) {
                        dx = parseFloat(nums[0]);
                        dy = parseFloat(nums[1]);
                    } else if (nums.length === 4 && nums[0] === "0" && nums[2] === "1") {
                        dx = parseFloat(nums[1]);
                        dy = parseFloat(nums[3]);
                    }
                }
            }

            if (!planeMatch || dx === null) {
                L.comment = "skip: parse fail (block=" + (lastBlock || "null") + ")";
                continue;
            }

            var planeName = planeMatch[1];

            // Nowy Position: offset skalowany razem z mapą.
            // Używam toWorld (pasuje do oryginalnego patternu z flag_*_follow_no_rotation.jsx)
            var newPosExpr =
                "var t = thisComp.layer(\"" + planeName + "\");\n" +
                "var p = t.toWorld(t.anchorPoint);\n" +
                "var m = thisComp.layer(\"MAP_Background\").transform.scale[0] / 100;\n" +
                "[p[0] + (" + dx + " * m), p[1] + (" + dy + " * m)]";

            try {
                pos.expression = newPosExpr;
            } catch (e) {
                L.comment = "ERR pos: " + e.toString();
                continue;
            }

            // Scale linkowany do mapy
            var sc = L.property("Scale");
            if (sc) {
                try { sc.expression = SCALE_EXPR; } catch (e) {}
            }

            L.comment = "fixed: " + planeName + " off=[" + dx + "," + dy + "]";
        }
    }
    app.endUndoGroup();
})();
