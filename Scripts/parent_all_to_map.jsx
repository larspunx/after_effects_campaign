/**
 * Parentuje wszystkie warstwy treści do MAP_Background.
 * Skalowanie/pan mapy automatycznie przesuwa wszystkie dzieci.
 *
 * Pomijane: sama mapa, BG (tło ostateczne), CONTROLLER (null), plane1.
 *
 * UWAGA: PLANE ma keyframe'y w przestrzeni kompozycji. Po parentowaniu
 * AE może zinterpretować je w przestrzeni mapy → trasa się zmieni.
 * Jeśli tak — uruchom add_plane_path.jsx z PARENT_TO_MAP=true.
 *
 * File > Scripts > Run Script File...
 */

(function parentAllToMap() {
    app.beginUndoGroup("Parent All To Map");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // Znajdź mapę
    var mapLayer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === "MAP_Background") { mapLayer = comp.layer(l); break; }
    }
    if (!mapLayer) { alert("Nie znaleziono warstwy MAP_Background"); return; }

    // Warstwy które mają zostać NIEsparentowane (BG, CONTROLLER, plane1, sama mapa)
    var SKIP = {
        "MAP_Background": 1,
        "BG": 1,
        "CONTROLLER": 1,
        "plane1": 1,
        "[BG]": 1
    };

    var report = [];
    var parented = 0;

    for (var k = 1; k <= comp.numLayers; k++) {
        var layer = comp.layer(k);
        if (SKIP[layer.name]) continue;

        var prevParent = layer.parent ? layer.parent.name : "None";
        if (layer.parent === mapLayer) {
            report.push("• " + layer.name + " — already parented");
            continue;
        }

        try {
            layer.parent = mapLayer;
            report.push("• " + layer.name + " — parented (was: " + prevParent + ")");
            parented++;
        } catch (e) {
            report.push("• " + layer.name + " — FAILED: " + e);
        }
    }

    app.endUndoGroup();

    alert(
        "Parent → MAP_Background.\n\n" +
        report.join("\n") + "\n\n" +
        "Sparentowanych: " + parented + "\n\n" +
        "Sprawdź czy trasa PLANE wygląda jak wcześniej.\n" +
        "Jeśli nie — uruchom add_plane_path.jsx (waypointy zostaną odtworzone)."
    );
})();
