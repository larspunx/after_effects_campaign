(function addGunshotKeying() {
    app.beginUndoGroup("Add Gunshot Keying");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var filePath = "/Users/mac/tsg/AfterEffects/Assets/Footage/Gunshot_Green_Screen_Muzzle_Flash_original_2010332.mp4";
    var f = new File(filePath);
    if (!f.exists) { alert("Brak pliku:\n" + filePath); return; }

    // Import footage (lub znajdź już zaimportowany)
    var footage = null;
    for (var j = 1; j <= proj.numItems; j++) {
        if (proj.item(j).name.indexOf("Gunshot_Green") !== -1) {
            footage = proj.item(j); break;
        }
    }
    if (!footage) {
        footage = proj.importFile(new ImportOptions(f));
    }

    // Usuń starą warstwę jeśli istnieje
    for (var d = comp.numLayers; d >= 1; d--) {
        if (comp.layer(d).name === "GUNSHOT") {
            comp.layer(d).remove();
        }
    }

    // Dodaj do kompozycji
    var layer = comp.layers.add(footage);
    layer.name         = "GUNSHOT";
    layer.label        = 8;
    layer.startTime    = 0;

    // ADD blending — ogień/błysk świeci przez warstwy, czarny = przeźroczysty
    layer.blendingMode = BlendingMode.ADD;

    // Wyśrodkuj
    layer.property("Position").setValue([960, 540]);

    // ── Keylight 1.2 — usuwa zielone tło ─────────────────────────────────
    var keylight = layer.Effects.addProperty("Keylight (1.2)");
    if (keylight) {
        // Kolor zielonego tła z tego videa (jasna zieleń ~#61DE33)
        keylight.property("Screen Colour").setValue([0.38, 0.87, 0.20]);
        keylight.property("Screen Gain").setValue(110);
        keylight.property("Screen Balance").setValue(50);
        keylight.property("Clip Black").setValue(15);
        keylight.property("Clip White").setValue(90);
        keylight.property("Screen Pre-blur").setValue(1.0);
    }

    // ── Simple Choker — usuwa resztki zielonej obwódki ───────────────────
    var choker = layer.Effects.addProperty("ADBE Simple Choker");
    if (choker) {
        choker.property("ADBE Simple Choker-0001").setValue(-1.5);
    }

    // ── Glow — lekki poświat efektu strzału ──────────────────────────────
    var glow = layer.Effects.addProperty("ADBE Glo2");
    if (glow) {
        glow.property("ADBE Glo2-0001").setValue(55);
        glow.property("ADBE Glo2-0002").setValue(20);
        glow.property("ADBE Glo2-0004").setValue(1.3);
    }

    comp.time = 0;
    layer.selected = true;
    app.endUndoGroup();

    alert(
        "Warstwa GUNSHOT dodana!\n\n" +
        "Zielone tło usunięte przez Keylight 1.2\n" +
        "Blending Mode: ADD — widoczny tylko efekt strzału\n\n" +
        "Jeśli zostały ślady zieleni:\n" +
        "Effects → Keylight 1.2 → Screen Colour\n" +
        "→ kliknij pipetą w zielone tło w kompozycji\n\n" +
        "0 (numpad) → RAM Preview"
    );
})();
