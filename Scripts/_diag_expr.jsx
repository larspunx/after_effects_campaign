(function () {
    app.beginUndoGroup("Diag expr");
    var stamp = new Date().toTimeString().substring(0, 8);

    var flag = null, mapL = null, comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name === "1_flag_UK") { flag = L; comp = it; }
            if (L.name === "MAP_Background") mapL = L;
        }
    }

    if (!flag) return;

    // Step 1: confirm we found the layer
    flag.comment = "[" + stamp + "] step1: found, comp=" + (comp ? comp.name : "?") + " mapInSameComp=" + (mapL ? "Y" : "N");

    // Step 2: try setting expression
    var sc = flag.property("Scale");
    var step2 = "step2: ";
    try {
        sc.expression = "value*2";
        step2 += "set OK, enabled=" + sc.expressionEnabled + " len=" + sc.expression.length + " val=" + sc.value.toString();
    } catch (e) {
        step2 += "ERR " + e.toString();
    }
    flag.comment += " | " + step2;

    // Step 3: try real expression
    var step3 = "step3: ";
    try {
        sc.expression =
            "var s = value;\n" +
            "var m = thisComp.layer(\"MAP_Background\").transform.scale;\n" +
            "[s[0]*m[0]/100, s[1]*m[1]/100]";
        step3 += "set OK, enabled=" + sc.expressionEnabled + " val=" + sc.value.toString();
    } catch (e) {
        step3 += "ERR " + e.toString();
    }
    flag.comment += " | " + step3;

    app.endUndoGroup();
})();
