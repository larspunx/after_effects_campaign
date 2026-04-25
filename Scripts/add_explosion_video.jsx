/**
 * Importuje i dodaje wideo wybuchu do Main_Comp
 * Plik: Realistic_Explosion_With_Fire_And_Smoke_Plume_On_Vertical_Alpha_source_3469729.mov
 *
 * File > Scripts > Run Script File...
 */

(function addExplosionVideo() {
    app.beginUndoGroup("Add Explosion Video");

    var proj = app.project;

    // Znajdź Main_Comp
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    // ── Konfiguracja ───────────────────────────────────────────────────────
    var EX        = 960;   // pozycja X wybuchu
    var EY        = 540;   // pozycja Y wybuchu
    var T         = 2.0;   // czas startu wybuchu (sekundy)
    var SCALE     = 60;    // rozmiar w % (zmniejsz jeśli za duży)
    var FILE_PATH = "/Users/mac/tsg/AfterEffects/Assets/Footage/Realistic_Explosion_With_Fire_And_Smoke_Plume_On_Vertical_Alpha_source_3469729.mov";
    // ──────────────────────────────────────────────────────────────────────

    // Sprawdź czy plik istnieje
    var f = new File(FILE_PATH);
    if (!f.exists) {
        alert("Nie znaleziono pliku:\n" + FILE_PATH);
        return;
    }

    // Zaimportuj plik (lub znajdź już zaimportowany)
    var footageItem = null;
    for (var j = 1; j <= proj.numItems; j++) {
        if (proj.item(j).name.indexOf("Realistic_Explosion") !== -1) {
            footageItem = proj.item(j);
            break;
        }
    }
    if (!footageItem) {
        var opts = new ImportOptions(f);
        footageItem = proj.importFile(opts);
    }

    // Znajdź lub utwórz folder Footage w projekcie
    var footageFolder = null;
    for (var k = 1; k <= proj.numItems; k++) {
        if (proj.item(k) instanceof FolderItem && proj.item(k).name === "Footage") {
            footageFolder = proj.item(k);
            break;
        }
    }
    if (footageFolder) { footageItem.parentFolder = footageFolder; }

    // Dodaj do kompozycji
    var expLayer = comp.layers.add(footageItem);
    expLayer.name      = "EXPLOSION_VIDEO";
    expLayer.label     = 8;
    expLayer.startTime = T;

    // Blending mode — Screen usuwa czarne tło, zostaje tylko ogień/dym
    // Jeśli plik ma kanał alpha (przezroczyste tło) zostaw NORMAL
    expLayer.blendingMode = BlendingMode.SCREEN;

    // Pozycja i skala
    expLayer.property("Position").setValue([EX, EY]);
    expLayer.property("Scale").setValue([SCALE, SCALE]);

    // Ustaw głowicę na moment wybuchu
    comp.time = T;

    app.endUndoGroup();

    alert(
        "Wybuch dodany!\n\n" +
        "Warstwa: EXPLOSION_VIDEO\n" +
        "Start: " + T + "s  |  Pozycja: " + EX + ", " + EY + "  |  Skala: " + SCALE + "%\n\n" +
        "Jeśli tło jest czarne → zmień Blending Mode na 'Screen' lub 'Add'\n" +
        "Jeśli plik ma alpha → ustaw Blending Mode na 'Normal'\n\n" +
        "Naciśnij 0 (numpad) → RAM Preview"
    );
})();
