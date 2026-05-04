(function () {
    app.beginUndoGroup("Flag UK scale link v2");
    var stamp = new Date().toTimeString().substring(0, 8);

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name !== "1_flag_UK") continue;

            var sc = L.property("Scale");
            var status = "[" + stamp + "] ";
            try {
                sc.expression =
                    "var s = value;\n" +
                    "try {\n" +
                    "  var m = thisComp.layer(\"MAP_Background\").transform.scale;\n" +
                    "  [s[0]*m[0]/100, s[1]*m[1]/100]\n" +
                    "} catch(e) { s }";
                status += "expr SET (enabled=" + sc.expressionEnabled + ", len=" + sc.expression.length + ")";
            } catch (e) {
                status += "ERR: " + e.toString();
            }
            L.comment = status;
        }
    }
    app.endUndoGroup();
})();
