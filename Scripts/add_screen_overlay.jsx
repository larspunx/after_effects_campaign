// Efekt starego ekranu wojskowego: szum + linie skanowania.
(function () {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { alert("Brak aktywnego compa"); return; }

    app.beginUndoGroup("Add screen overlay");

    // Usuń poprzednie jeśli istnieją.
    for (var k = comp.numLayers; k >= 1; k--) {
        var n = comp.layer(k).name;
        if (n === "VFX_GRAIN" || n === "VFX_SCANLINES") comp.layer(k).remove();
    }

    // --- SCANLINES: czarny solid, Multiply, poziome paski ---
    var scan = comp.layers.addSolid([0, 0, 0], "VFX_SCANLINES", comp.width, comp.height, 1);
    scan.moveToBeginning();
    scan.blendingMode = BlendingMode.MULTIPLY;
    scan.opacity.setValue(30);

    var vb = scan.property("Effects").addProperty("ADBE Venetian Blinds");
    if (vb) {
        vb.property(1).setValue(50);  // Transition Completion 50%
        vb.property(2).setValue(90);  // Direction: poziome
        vb.property(3).setValue(4);   // Width 4px
    }

    // --- GRAIN: adjustment layer + Noise, Normal, niska opacity ---
    var grain = comp.layers.addSolid([0, 0, 0], "VFX_GRAIN", comp.width, comp.height, 1);
    grain.moveToBeginning();
    grain.adjustmentLayer = true;   // adjustment — nie zakrywa, stosuje efekt na wszystko pod spodem
    grain.opacity.setValue(18);

    var noise = grain.property("Effects").addProperty("ADBE Noise");
    if (noise) {
        noise.property(1).setValue(12);   // Amount of Noise 12%
        noise.property(2).setValue(false); // Use Color Noise: off (mono)
        noise.property(3).setValue(false); // Clip Result Values: off
    }

    app.endUndoGroup();
    alert("OK — VFX_GRAIN (adjustment, 18%) + VFX_SCANLINES (Multiply, 30%)\nDostosuj opacity do smaku.");
})();
