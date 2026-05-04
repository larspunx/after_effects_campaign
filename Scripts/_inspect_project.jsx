(function inspectProject() {
    var out = [];
    out.push("=== Project: " + (app.project.file ? app.project.file.fsName : "(unsaved)") + " ===");

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        out.push("");
        out.push("COMP: " + it.name + "  [" + it.width + "x" + it.height + " @ " + it.frameRate + "fps  dur=" + it.duration.toFixed(2) + "s  layers=" + it.numLayers + "]");
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            var posKeys = 0;
            try {
                var p = L.property("Position");
                if (p) posKeys = p.numKeys;
            } catch (e) {}
            out.push("  [" + li + "] " + L.name + "  posKeys=" + posKeys + "  in=" + L.inPoint.toFixed(2) + " out=" + L.outPoint.toFixed(2));
        }
    }

    var f = new File("/Users/mac/tsg/AfterEffects/Scripts/_inspect_project.log");
    f.open("w");
    f.write(out.join("\n"));
    f.close();
})();
