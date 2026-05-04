(function () {
    app.beginUndoGroup("Remove Auto Contrast effects");
    var count = 0;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            var fx = L.property("Effects");
            if (!fx) continue;
            for (var fi = fx.numProperties; fi >= 1; fi--) {
                var ef = fx.property(fi);
                if (ef.name.toLowerCase().indexOf("auto contrast") >= 0 ||
                    ef.matchName === "ADBE Auto Contrast") {
                    ef.remove();
                    count++;
                }
            }
        }
    }
    app.endUndoGroup();
})();
