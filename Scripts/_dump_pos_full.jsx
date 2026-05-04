(function () {
    app.beginUndoGroup("Dump full pos");

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name !== "1_flag_UK") continue;

            var pos = L.property("Position");
            var raw = pos.expression || "";

            // Zapisz do pliku jsx (które zawsze możemy odczytać)
            try {
                var f = new File("/Users/mac/tsg/AfterEffects/Scripts/_DUMP_pos_expr.txt");
                f.encoding = "UTF-8";
                f.open("w");
                f.write(raw);
                f.close();
            } catch (e) {}

            // Też do comment, ale z osobnymi liniami przerobionymi na ##
            L.comment = "FULL[" + raw.length + "]: " + raw.replace(/\n/g, "##");
        }
    }
    app.endUndoGroup();
})();
