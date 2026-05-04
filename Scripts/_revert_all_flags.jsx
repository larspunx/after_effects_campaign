(function () {
    app.beginUndoGroup("REVERT all flag expressions");

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toLowerCase().indexOf("flag") < 0) continue;
            if (L.parent) continue;

            var pos = L.property("Position");
            var sc  = L.property("Scale");

            // Usuń expression na Scale (przywraca statyczną wartość)
            if (sc && sc.expressionEnabled) {
                try { sc.expression = ""; } catch (e) {}
            }

            // Przywróć oryginalny Position expression (usuń m-multiplier, cofnij do oryginału)
            if (pos && pos.expressionEnabled) {
                var expr = pos.expression || "";
                // Jeśli mój expression jest tam (ma MAP_Background i m =) — cofnij do oryginału
                if (expr.indexOf("MAP_Background") >= 0 && expr.indexOf("var m =") >= 0) {
                    // Wyciągnij plane name i offset, odbuduj oryginalny expression BEZ m
                    var planeMatch = expr.match(/thisComp\.layer\(\s*["']([^"']+)["']\s*\)/);
                    var lastBracket = null, bm2;
                    var bracketRe2 = /\[([^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*)\]/g;
                    while ((bm2 = bracketRe2.exec(expr)) !== null) lastBracket = bm2[1];
                    var nums = lastBracket ? lastBracket.match(/-?\d+\.?\d*/g) : null;
                    var dx = null, dy = null;
                    if (nums && nums.length === 2) { dx = parseFloat(nums[0]); dy = parseFloat(nums[1]); }
                    else if (nums && nums.length === 4 && nums[0] === "0" && nums[2] === "1") { dx = parseFloat(nums[1]); dy = parseFloat(nums[3]); }

                    if (planeMatch && dx !== null) {
                        var planeName = planeMatch[1];
                        try {
                            pos.expression =
                                "var t = thisComp.layer(\"" + planeName + "\");\n" +
                                "var p = t.toWorld(t.anchorPoint);\n" +
                                "[p[0] + (" + dx + "), p[1] + (" + dy + ")]";
                        } catch (e) {}
                    }
                }
            }

            // Wyczyść Comment
            try { L.comment = ""; } catch (e) {}
        }
    }

    // Cofnij bump skali (podziel przez 3 jeśli base > 70 — sygnatura bumpu)
    for (var i2 = 1; i2 <= app.project.numItems; i2++) {
        var it2 = app.project.item(i2);
        if (!(it2 instanceof CompItem)) continue;
        for (var li2 = 1; li2 <= it2.numLayers; li2++) {
            var L2 = it2.layer(li2);
            if (L2.name.toLowerCase().indexOf("flag") < 0) continue;
            if (L2.parent) continue;
            var sc2 = L2.property("Scale");
            if (!sc2 || sc2.expressionEnabled) continue;
            var v = sc2.value;
            if (v[0] > 70) {
                try { sc2.setValue([v[0] / 3, v[1] / 3, v.length > 2 ? v[2] : 100]); } catch (e) {}
            }
        }
    }

    app.endUndoGroup();
})();
