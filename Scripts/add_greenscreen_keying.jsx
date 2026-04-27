(function addGreenScreenKeying() {
    app.beginUndoGroup("Add Green Screen Keying");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var filePath = "/Users/mac/tsg/AfterEffects/Assets/Footage/Gun_Flashes_Muzzle_Shotgun_source_1436548.mp4";
    var f = new File(filePath);
    if (!f.exists) { alert("Brak pliku:\n" + filePath); return; }

    // Import footage
    var footage = null;
    for (var j = 1; j <= proj.numItems; j++) {
        if (proj.item(j).name.indexOf("Gun_Flashes") !== -1) {
            footage = proj.item(j); break;
        }
    }
    if (!footage) {
        footage = proj.importFile(new ImportOptions(f));
    }

    // Dodaj do kompozycji
    var layer = comp.layers.add(footage);
    layer.name         = "MUZZLE_FLASH";
    layer.label        = 8;
    layer.startTime    = 0;

    // Blending mode ADD — najlepszy dla efektów ognia/błysku na zielonym
    layer.blendingMode = BlendingMode.ADD;

    // ── Keylight 1.2 — usuwa zielone tło ─────────────────────────────────
    var keylight = layer.Effects.addProperty("Keylight (1.2)");

    if (keylight) {
        // Screen Colour — dokładny kolor zielonego tła z tego videa
        keylight.property("Screen Colour").setValue([0.38, 0.87, 0.20]);

        // Screen Gain — jak agresywnie usuwa kolor
        keylight.property("Screen Gain").setValue(105);

        // Screen Balance
        keylight.property("Screen Balance").setValue(50);

        // Clip Black / Clip White — wyczyść resztki zieleni
        keylight.property("Clip Black").setValue(10);
        keylight.property("Clip White").setValue(95);

        // Screen Pre-blur — wygładza krawędzie
        keylight.property("Screen Pre-blur").setValue(0.5);
    } else {
        // Fallback — jeśli Keylight niedostępny, użyj Color Range
        alert("Keylight niedostępny — aplikuję Color Range jako alternatywę");
        var cr = layer.Effects.addProperty("ADBE Color Range");
        cr.property("ADBE Color Range-0001").setValue(2); // tryb Lab
    }

    // ── Glow — lekki poświat efektu ───────────────────────────────────────
    var glow = layer.Effects.addProperty("ADBE Glo2");
    if (glow) {
        glow.property("ADBE Glo2-0001").setValue(60);   // Threshold
        glow.property("ADBE Glo2-0002").setValue(25);   // Radius
        glow.property("ADBE Glo2-0004").setValue(1.2);  // Intensity
    }

    // Pozycja — środek kompozycji (możesz przesunąć)
    layer.property("Position").setValue([960, 540]);

    comp.time = 0;
    app.endUndoGroup();

    alert(
        "Warstwa MUZZLE_FLASH dodana!\n\n" +
        "Zastosowano:\n" +
        "• Keylight 1.2 — usuwa zielone tło\n" +
        "• Blending Mode: ADD — ogień świeci przez warstwy\n" +
        "• Glow — lekki poświat\n\n" +
        "Jeśli zostały resztki zieleni:\n" +
        "Zaznacz warstwę → Effects → Keylight → Screen Colour\n" +
        "Kliknij pipetą (eyedropper) bezpośrednio w zielone tło\n\n" +
        "Naciśnij 0 (numpad) → RAM Preview"
    );
})();
