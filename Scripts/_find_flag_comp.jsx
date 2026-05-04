(function () {
    var report = [];
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        var hits = [];
        for (var l = 1; l <= it.numLayers; l++) {
            var nm = it.layer(l).name;
            var lo = nm.toLowerCase();
            if (lo.indexOf("_flag_") >= 0 || lo.indexOf("_plane_") >= 0) {
                hits.push("  " + l + ": " + nm);
            }
        }
        if (hits.length > 0) {
            report.push("COMP: " + it.name + " (layers=" + it.numLayers + ")");
            report.push(hits.join("\n"));
            report.push("");
        }
    }
    alert(report.length ? report.join("\n") : "Brak warstw flag/plane w projekcie");
})();
