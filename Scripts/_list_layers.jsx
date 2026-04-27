// Listuje wszystkie warstwy w Main_Comp do JS Console (Window > JavaScript Console).
(function () {
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") {
            var c = app.project.item(i);
            $.writeln("=== Main_Comp layers (" + c.numLayers + ") ===");
            for (var l = 1; l <= c.numLayers; l++) {
                $.writeln("  " + l + ": " + c.layer(l).name);
            }
            return;
        }
    }
})();
