(function () {
    app.beginUndoGroup("Debug parser");

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name !== "1_flag_UK") continue;

            var pos = L.property("Position");
            var raw = pos.expression || "";
            var lenBefore = raw.length;

            var r1 = raw.match(/\[\s*(-?[\d\.]+)\s*,\s*(-?[\d\.]+)\s*\]\s*;?\s*$/m);
            var r2 = raw.match(/\[\s*\w+\[0\]\s*\+\s*\(?\s*(-?[\d\.]+)\s*\)?\s*,\s*\w+\[1\]\s*\+\s*\(?\s*(-?[\d\.]+)\s*\)?\s*\]/);
            var r3 = raw.match(/p\[0\]\s*\+\s*\(?\s*(-?[\d\.]+)/);
            var r4 = raw.match(/p\[1\]\s*\+\s*\(?\s*(-?[\d\.]+)/);

            L.comment = "len=" + lenBefore +
                " r1=" + (r1 ? r1[1] + "," + r1[2] : "no") +
                " r2=" + (r2 ? r2[1] + "," + r2[2] : "no") +
                " r3=" + (r3 ? r3[1] : "no") +
                " r4=" + (r4 ? r4[1] : "no");
        }
    }
    app.endUndoGroup();
})();
