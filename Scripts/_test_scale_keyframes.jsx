(function () {
    app.beginUndoGroup("Test scale link with keyframes");

    var flag = null, mapL = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name === "1_flag_UK") flag = L;
            if (L.name === "MAP_Background") mapL = L;
        }
    }
    if (!flag || !mapL) { return; }

    var sc = flag.property("Scale");
    var ms = mapL.property("Scale");

    var report = "map.numKeys=" + ms.numKeys;
    if (ms.numKeys > 0) {
        report += " | keyframes:";
        for (var k = 1; k <= ms.numKeys; k++) {
            var t = ms.keyTime(k);
            var v = ms.keyValue(k);
            var flagAtT = sc.valueAtTime(t, false);
            report += " [t=" + t.toFixed(2) + " map=" + v.toString() + " flag=" + flagAtT.toString() + "]";
        }
    } else {
        report += " | static map=" + ms.value.toString() + " flag=" + sc.value.toString();
    }

    flag.comment = report;
    app.endUndoGroup();
})();
