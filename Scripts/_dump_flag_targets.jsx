(function () {
    app.beginUndoGroup("Dump flag targets");

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name.toLowerCase().indexOf("flag") < 0) continue;

            var rot = L.property("Rotation");
            if (!rot || !rot.expressionEnabled) continue;

            var pos = L.property("Position");
            var expr = pos && pos.expressionEnabled ? pos.expression : "";

            // wyciągnij wszystkie thisComp.layer("...") z expression
            var matches = expr.match(/thisComp\.layer\(\s*["']([^"']+)["']\s*\)/g) || [];
            var targets = [];
            for (var m = 0; m < matches.length; m++) {
                var nm = matches[m].match(/["']([^"']+)["']/)[1];
                if (targets.indexOf(nm) < 0) targets.push(nm);
            }

            L.comment = "follows: " + targets.join(", ");
        }
    }
    app.endUndoGroup();
})();
