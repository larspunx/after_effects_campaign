(function () {
    app.beginUndoGroup("Reset MAP_Background scale");
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            if (it.layer(li).name !== "MAP_Background") continue;
            var sc = it.layer(li).property("Scale");
            for (var k = sc.numKeys; k >= 1; k--) sc.removeKey(k);
            sc.setValue([100, 100, 100]);
        }
    }
    app.endUndoGroup();
})();
