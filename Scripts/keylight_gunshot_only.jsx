(function keylightGunshotOnly() {
    app.beginUndoGroup("Keylight Gunshot Only");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // Znajdź TYLKO warstwę z Gunshot — nie dotykamy niczego innego
    var layer = null;
    for (var j = 1; j <= comp.numLayers; j++) {
        if (comp.layer(j).name.indexOf("Gunshot_Green") !== -1 ||
            comp.layer(j).source && comp.layer(j).source.name &&
            comp.layer(j).source.name.indexOf("Gunshot_Green") !== -1) {
            layer = comp.layer(j);
            break;
        }
    }

    if (!layer) {
        alert("Nie znaleziono warstwy z Gunshot_Green_Screen w kompozycji.\nUpewnij się że warstwa jest w Main_Comp.");
        return;
    }

    // Usuń poprzednie efekty tylko z tej warstwy
    while (layer.Effects.numProperties > 0) {
        layer.Effects.property(1).remove();
    }

    // Blending Mode: ADD — czarne = przeźroczyste, ogień widoczny
    layer.blendingMode = BlendingMode.ADD;

    // Keylight 1.2 — usuwa zielone tło
    var kl = layer.Effects.addProperty("Keylight (1.2)");
    kl.property("Screen Colour").setValue([0.38, 0.87, 0.20]);
    kl.property("Screen Gain").setValue(110);
    kl.property("Clip Black").setValue(15);
    kl.property("Clip White").setValue(90);
    kl.property("Screen Pre-blur").setValue(0.8);

    app.endUndoGroup();

    alert("Gotowe!\nTylko warstwa '" + layer.name + "' została zmieniona.\n\nJeśli zostały resztki zieleni:\nF3 → Keylight → Screen Colour → pipeta → kliknij w zielony obszar");
})();
