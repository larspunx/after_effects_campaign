(function () {
    app.beginUndoGroup("Full render optimize");

    // 1) Usuń wszystkie Auto Contrast z całego projektu
    var removed = 0;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var fx = it.layer(li).property("Effects");
            if (!fx) continue;
            for (var fi = fx.numProperties; fi >= 1; fi--) {
                var ef = fx.property(fi);
                if (ef.name.toLowerCase().indexOf("auto contrast") >= 0 ||
                    ef.matchName === "ADBE Auto Contrast") {
                    ef.remove();
                    removed++;
                }
            }
        }
    }

    // 2) Disk Cache — 80 GB, włączony
    try {
        app.preferences.savePrefAsBool(
            "Disk Cache Preferences",
            "Disk Cache Enabled",
            PREFType.PREF_Type_MACHINE_SPECIFIC, true);
        app.preferences.savePrefAsLong(
            "Disk Cache Preferences",
            "Disk Cache Max Size (1000s of bytes)",
            PREFType.PREF_Type_MACHINE_SPECIFIC, 80000000);
    } catch (e) {}

    // 3) Render Multiple Frames Simultaneously
    try {
        app.preferences.savePrefAsBool(
            "Main Pref Section v2",
            "Render Multiple Frames Simultaneously",
            PREFType.PREF_Type_MACHINE_INDEPENDENT, true);
    } catch (e) {}

    // 4) Adaptive Resolution (szybszy podgląd)
    try {
        app.preferences.savePrefAsBool(
            "Main Pref Section",
            "Enable Adaptive Resolution",
            PREFType.PREF_Type_MACHINE_INDEPENDENT, true);
    } catch (e) {}

    // 5) Zapisz preferencje
    try { app.preferences.savePrefs(); } catch (e) {}

    app.endUndoGroup();

    alert("Gotowe!\n\nUsunieto Auto Contrast: " + removed + " efektow\nDisk Cache: 80 GB\nRender Multiple Frames: ON\n\nDo zrobienia recznie (1 min):\n- Preferences > Display > GPU Information > Metal\n- Eksport przez Cmd+Alt+M (Media Encoder)");
})();
