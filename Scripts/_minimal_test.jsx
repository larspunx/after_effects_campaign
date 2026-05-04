(function () {
    app.beginUndoGroup("Minimal test");
    var stamp = new Date().toTimeString().substring(0, 8);
    // Write to comment of EVERY layer in every comp - hard to miss
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            if (it.layer(li).name === "1_flag_UK") {
                it.layer(li).comment = "TEST_MARKER_" + stamp;
            }
        }
    }
    app.endUndoGroup();
})();
