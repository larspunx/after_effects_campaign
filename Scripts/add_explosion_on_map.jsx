/**
 * Dodaje wideo wybuchu jako warstwę nad MAP_Background w Main_Comp
 * i parentuje ją do mapy, żeby wybuch przesuwał się razem z panem mapy.
 *
 * Plik: Realistic_Explosion_With_Fire_And_Smoke_Plume_On_Vertical_Alpha_source_3469729.mov
 *
 * File > Scripts > Run Script File...
 */

(function addExplosionOnMap() {
    app.beginUndoGroup("Add Explosion On Map");

    var proj = app.project;

    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp. Uruchom najpierw setup_project.jsx."); return; }

    var mapLayer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === "MAP_Background") { mapLayer = comp.layer(l); break; }
    }
    if (!mapLayer) { alert("Nie znaleziono warstwy MAP_Background. Uruchom najpierw add_map_background.jsx."); return; }

    // ── Konfiguracja ───────────────────────────────────────────────────────
    var EX        = 960;   // pozycja X wybuchu (w przestrzeni kompozycji)
    var EY        = 540;   // pozycja Y wybuchu
    var T         = 2.0;   // czas startu wybuchu (sekundy)
    var SCALE     = 60;    // rozmiar w %
    var FILE_PATH = "/Users/mac/tsg/AfterEffects/Assets/Footage/Realistic_Explosion_With_Fire_And_Smoke_Plume_On_Vertical_Alpha_source_3469729.mov";
    // ──────────────────────────────────────────────────────────────────────

    var f = new File(FILE_PATH);
    if (!f.exists) { alert("Nie znaleziono pliku:\n" + FILE_PATH); return; }

    // Reuse jeśli już zaimportowany
    var footageItem = null;
    for (var j = 1; j <= proj.numItems; j++) {
        if (proj.item(j).name.indexOf("Realistic_Explosion") !== -1) {
            footageItem = proj.item(j);
            break;
        }
    }
    if (!footageItem) {
        footageItem = proj.importFile(new ImportOptions(f));
    }

    // Wrzuć do folderu Footage jeśli istnieje
    for (var k = 1; k <= proj.numItems; k++) {
        if (proj.item(k) instanceof FolderItem && proj.item(k).name === "Footage") {
            footageItem.parentFolder = proj.item(k);
            break;
        }
    }

    // Dodaj warstwę
    var expLayer = comp.layers.add(footageItem);
    expLayer.name      = "EXPLOSION_ON_MAP";
    expLayer.label     = 8; // czerwony
    expLayer.startTime = T;

    // Plik ma w nazwie "Alpha" → zostaw NORMAL. Jeśli widać czarne tło, przełącz na SCREEN.
    expLayer.blendingMode = BlendingMode.NORMAL;

    // Pozycja w przestrzeni kompozycji — i parent do mapy, żeby jechała razem
    expLayer.property("Position").setValue([EX, EY]);
    expLayer.property("Scale").setValue([SCALE, SCALE]);

    // Umieść warstwę bezpośrednio nad mapą (moveBefore = wyżej w stosie = nad mapą w renderze)
    expLayer.moveBefore(mapLayer);
    expLayer.parent = mapLayer;     // dziedziczy pan/skalę mapy

    comp.time = T;

    app.endUndoGroup();

    alert(
        "Wybuch dodany na mapie!\n\n" +
        "Warstwa: EXPLOSION_ON_MAP (parent: MAP_Background)\n" +
        "Start: " + T + "s  |  Pozycja: " + EX + ", " + EY + "  |  Skala: " + SCALE + "%\n\n" +
        "Wybuch przesuwa się razem z panem mapy.\n" +
        "Jeśli widać czarne tło → zmień Blending Mode na 'Screen'."
    );
})();
