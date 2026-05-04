(function () {
    app.beginUndoGroup("Dump pos expr");

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name !== "1_flag_UK") continue;

            var pos = L.property("Position");
            var raw = pos && pos.expressionEnabled ? pos.expression : "(no expr)";
            // Replace newlines with | for inline display
            var compact = raw.replace(/\n/g, " | ");
            L.comment = "POS_EXPR: " + compact;
        }
    }
    app.endUndoGroup();
})();
