(function () {
    app.beginUndoGroup("Link flag scale to MAP_Background");

    var EXPR =
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

            var rot = L.property("Rotation");
            if (!rot || !rot.expressionEnabled) continue;

            var sc = L.property("Scale");
            if (!sc) continue;

            try {
                sc.expression = EXPR;
                L.comment = "linked → MAP_Background";
            } catch (e) {
                L.comment = "ERR: " + e.toString();
            }
        }
    }
    app.endUndoGroup();
})();
