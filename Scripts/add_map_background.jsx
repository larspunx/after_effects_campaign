/**
 * Dodaje maps1.png jako animowane tło w Main_Comp
 * Animacja: powolne przesunięcie mapy (pan) przez 30 sekund
 *
 * Jak używać:
 *   File > Scripts > Run Script File... → wybierz ten plik
 */

(function addMapBackground() {
    app.beginUndoGroup("Add Map Background");

    var proj = app.project;

    // Znajdź kompozycję Main_Comp
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") {
            comp = proj.item(i);
            break;
        }
    }
    if (!comp) {
        alert("Nie znaleziono kompozycji 'Main_Comp'. Upewnij się, że uruchomiłeś setup_project.jsx.");
        return;
    }

    // Znajdź maps1.png w projekcie
    var mapFile = null;
    for (var j = 1; j <= proj.numItems; j++) {
        if (proj.item(j).name === "maps1.png") {
            mapFile = proj.item(j);
            break;
        }
    }

    // Jeśli nie zaimportowany — zaimportuj automatycznie
    if (!mapFile) {
        var filePath = "/Users/mac/tsg/AfterEffects/Assets/Images/maps1.png";
        var f = new File(filePath);
        if (!f.exists) {
            alert("Nie znaleziono pliku:\n" + filePath + "\n\nUpewnij się że plik jest w Assets/Images/");
            return;
        }
        var importOpts = new ImportOptions(f);
        mapFile = proj.importFile(importOpts);
        mapFile.name = "maps1.png";
    }

    // Dodaj mapę do kompozycji jako najniższą warstwę (tło)
    var mapLayer = comp.layers.add(mapFile, comp.duration);
    mapLayer.name = "MAP_Background";
    mapLayer.label = 6; // niebieski

    // Przesuń na sam dół stosu warstw
    mapLayer.moveToEnd();

    // ── Skalowanie — mapa musi być większa niż ekran żeby był efekt ruchu ──
    // Zakładamy że mapa jest szersza niż 1920px, jeśli nie — skalujemy do 130%
    var scaleVal = mapLayer.property("Scale");
    scaleVal.setValue([130, 130]);

    // ── Animacja pozycji (pan) — powolny ruch przez 30 sekund ──────────────
    // Start: mapa z lewej strony, koniec: mapa z prawej strony
    var positionProp = mapLayer.property("Position");
    positionProp.setValueAtTime(0,            [800,  540]);   // start — lekko z lewej
    positionProp.setValueAtTime(comp.duration, [1120, 540]);  // koniec — lekko z prawej

    // Easy Ease na obu keyframe'ach — płynny ruch
    positionProp.setInterpolationTypeAtKey(1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    positionProp.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    positionProp.setTemporalEaseAtKey(1, [new KeyframeEase(0, 66)], [new KeyframeEase(0, 66)]);
    positionProp.setTemporalEaseAtKey(2, [new KeyframeEase(0, 66)], [new KeyframeEase(0, 66)]);

    // ── Anchor Point wyśrodkuj ─────────────────────────────────────────────
    var source = mapLayer.source;
    mapLayer.property("Anchor Point").setValue([source.width / 2, source.height / 2]);

    app.endUndoGroup();

    alert(
        "Gotowe!\n\n" +
        "Warstwa 'MAP_Background' dodana na dole kompozycji.\n" +
        "Animacja: powolny pan od lewej do prawej przez 30s.\n\n" +
        "Możesz edytować keyframe'y pozycji w timeline\n" +
        "zaznaczając warstwę i naciskając P."
    );
})();
