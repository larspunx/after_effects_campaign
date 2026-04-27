/**
 * Usuwa Keylight i ustawia Blending Mode = SCREEN dla warstwy wybuch_samolotu.mov
 * (lub innej zawierającej "wybuch" w nazwie). Czarne tło → przezroczyste.
 */

(function screenBlendExplosion() {
    app.beginUndoGroup("Screen Blend Explosion");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var report = [];
    for (var l = 1; l <= comp.numLayers; l++) {
        var layer = comp.layer(l);
        var nmLow = layer.name.toLowerCase();
        if (nmLow.indexOf("wybuch") === -1) continue;

        // Usuń wszystkie efekty Keylight i Spill Suppressor
        var removed = 0;
        try {
            for (var ei = layer.Effects.numProperties; ei >= 1; ei--) {
                var eff = layer.Effects.property(ei);
                var mn = (eff.matchName || "").toLowerCase();
                var dn = (eff.name || "").toLowerCase();
                if (mn.indexOf("keylight") !== -1 || dn.indexOf("keylight") !== -1 ||
                    dn.indexOf("spill") !== -1) {
                    eff.remove();
                    removed++;
                }
            }
        } catch (e) {}

        // Blending Mode = SCREEN
        layer.blendingMode = BlendingMode.SCREEN;

        report.push("• " + layer.name + " — usunięto " + removed + " efekt(ów), tryb: SCREEN");
    }

    app.endUndoGroup();

    if (report.length === 0) {
        alert("Nie znaleziono warstwy z 'wybuch' w nazwie.");
    } else {
        alert("Tło wybuchu przezroczyste.\n\n" + report.join("\n"));
    }
})();
