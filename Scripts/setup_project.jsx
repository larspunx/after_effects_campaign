/**
 * After Effects Project Setup Script
 * Kompozycja: 1920x1080, 60fps, 30 sekund — Animacja / Motion Graphics
 *
 * Jak używać:
 *   File > Scripts > Run Script File... → wybierz ten plik
 */

(function setupProject() {
    app.beginUndoGroup("Setup Project");

    // ── Ustawienia kompozycji ──────────────────────────────────────────────
    var COMP_NAME     = "Main_Comp";
    var WIDTH         = 1920;
    var HEIGHT        = 1080;
    var PIXEL_ASPECT  = 1.0;       // kwadratowe piksele
    var DURATION      = 30;        // sekundy
    var FPS           = 60;

    // ── Kolory tła (ciemny granat — dobry start dla motion graphics) ───────
    var BG_COLOR      = [0.05, 0.05, 0.12]; // RGB 0-1

    // ── Foldery w panelu Project ───────────────────────────────────────────
    var folders = ["_Comps", "Audio", "Footage", "Images", "Precomps", "Solids"];

    // Utwórz foldery w projekcie AE
    var proj = app.project;
    var folderRefs = {};
    for (var i = 0; i < folders.length; i++) {
        folderRefs[folders[i]] = proj.items.addFolder(folders[i]);
    }

    // ── Utwórz główną kompozycję ───────────────────────────────────────────
    var comp = proj.items.addComp(
        COMP_NAME,
        WIDTH,
        HEIGHT,
        PIXEL_ASPECT,
        DURATION,
        FPS
    );
    comp.bgColor         = BG_COLOR;
    comp.workAreaStart   = 0;
    comp.workAreaDuration = DURATION;
    comp.parentFolder    = folderRefs["_Comps"];

    // ── Solid tła ─────────────────────────────────────────────────────────
    var bgSolid = comp.layers.addSolid(
        BG_COLOR,
        "BG",
        WIDTH,
        HEIGHT,
        PIXEL_ASPECT,
        DURATION
    );
    bgSolid.label = 9; // fioletowy label — łatwy do odróżnienia

    // ── Null obiekt (kontroler globalne) ──────────────────────────────────
    var controller = comp.layers.addNull(DURATION);
    controller.name  = "CONTROLLER";
    controller.label = 2; // żółty
    controller.shy   = false;

    // Przesuń controller na samą górę stosu warstw
    controller.moveBefore(bgSolid);

    // ── Ustaw punkt startowy odtwarzania ──────────────────────────────────
    comp.time = 0;

    // ── Otwórz kompozycję w panelu Comp Viewer ────────────────────────────
    comp.openInViewer();

    app.endUndoGroup();

    alert(
        "Projekt gotowy!\n\n" +
        "Kompozycja: " + COMP_NAME + "\n" +
        "Rozdzielczość: " + WIDTH + "x" + HEIGHT + "\n" +
        "FPS: " + FPS + "\n" +
        "Czas trwania: " + DURATION + "s\n\n" +
        "Możesz zapisać projekt: File > Save As"
    );
})();
