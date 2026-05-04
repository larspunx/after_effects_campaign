(function () {
    app.beginUndoGroup("Bump flag size 3x");
    var MULT = 3;
    var stamp = new Date().toTimeString().substring(0, 8);

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toLowerCase().indexOf("flag") < 0) continue;

            var rot = L.property("Rotation");
            if (!rot || !rot.expressionEnabled) continue;

            var sc = L.property("Scale");
            if (!sc) continue;

            try {
                if (sc.numKeys > 0) {
                    for (var k = 1; k <= sc.numKeys; k++) {
                        var v = sc.keyValue(k);
                        sc.setValueAtKey(k, [v[0] * MULT, v[1] * MULT, v.length > 2 ? v[2] : 100]);
                    }
                } else {
                    var cur = sc.value;
                    sc.setValue([cur[0] * MULT, cur[1] * MULT, cur.length > 2 ? cur[2] : 100]);
                }
                L.comment = "[" + stamp + "] base scale ×" + MULT;
            } catch (e) {
                L.comment = "[" + stamp + "] ERR " + e.toString();
            }
        }
    }
    app.endUndoGroup();
})();
