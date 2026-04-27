/**
 * Dodaje airport_white.png jako warstwę nad mapą, sparentowaną do MAP_Background.
 * Skalowanie/pan mapy automatycznie przesuwa też lotnisko.
 *
 * File > Scripts > Run Script File...
 */

(function addAirport() {
    app.beginUndoGroup("Add Airport");

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // Idempotencja
    for (var rmI = comp.numLayers; rmI >= 1; rmI--) {
        if (comp.layer(rmI).name === "AIRPORT") comp.layer(rmI).remove();
    }

    // Znajdź asset — najpierw dokładne dopasowanie, potem fuzzy "airport*"
    var asset = null;
    for (var k = 1; k <= proj.numItems; k++) {
        if (proj.item(k).name === "airport_white.png") { asset = proj.item(k); break; }
    }
    if (!asset) {
        for (var k2 = 1; k2 <= proj.numItems; k2++) {
            var n = proj.item(k2).name.toLowerCase();
            if (n.indexOf("airport") === 0 && n.indexOf(".png") !== -1) {
                asset = proj.item(k2);
                break;
            }
        }
    }
    if (!asset) {
        alert("Nie znaleziono assetu airport_*.png w panelu Project.\n" +
              "Zaimportuj plik (File → Import) i uruchom ponownie.");
        return;
    }

    // Znajdź MAP_Background
    var mapLayer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === "MAP_Background") { mapLayer = comp.layer(l); break; }
    }

    // Dodaj warstwę na środku kompozycji
    var airport = comp.layers.add(asset);
    airport.name  = "AIRPORT";
    airport.label = 10; // pomarańczowy
    airport.property("Position").setValue([comp.width / 2, comp.height / 2]);

    if (mapLayer) {
        // Tuż nad mapą (render: nad mapą, pod chmurami/wybuchami/samolotem)
        airport.moveBefore(mapLayer);
        // Parent → skalowanie i pan mapy ciągną też lotnisko
        airport.parent = mapLayer;
    }

    app.endUndoGroup();

    alert(
        "AIRPORT dodany.\n\n" +
        "Source: " + asset.name + "\n" +
        "Pozycja: środek kompozycji\n" +
        "Parent: MAP_Background — przesuwa/skaluje się razem z mapą\n\n" +
        "Ustaw pozycję i skalę ręcznie:\n" +
        "• P (Position) — przesuń do właściwego miasta\n" +
        "• S (Scale) — dopasuj rozmiar"
    );
})();
