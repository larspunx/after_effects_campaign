/**
 * Keylight + Spill Suppressor na zielony green screen.
 *
 * Logika:
 *   1) Jeśli zaznaczono warstwy w timeline — działa na nich
 *   2) W przeciwnym razie — wyszukuje wszystkie warstwy footage'u (wideo/obraz
 *      z importu), pomijając znane warstwy projektu (mapa, samolot, etc.)
 *      i aplikuje Keylight do każdej takiej warstwy.
 *
 * Raport jakie warstwy zostały zoperowane — w alerie.
 *
 * File > Scripts > Run Script File...
 */

(function keyGreenScreen() {
    app.beginUndoGroup("Key Green Screen");

    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i).name === "Main_Comp" &&
                app.project.item(i) instanceof CompItem) {
                comp = app.project.item(i);
                break;
            }
        }
    }
    if (!comp) { alert("Nie znaleziono aktywnej kompozycji"); return; }

    var GREEN_COLOR = [0, 1, 0];

    // Znane nazwy warstw projektu — NIE keyujemy ich
    var SKIP_NAMES = {
        "MAP_Background": 1,
        "EXPLOSION_ON_MAP": 1,
        "AIRPORT": 1,
        "PLANE": 1,
        "CLOUDS": 1,
        "CLOUDS_BASE": 1,
        "CLOUDS_WISPY": 1,
        "CONTROLLER": 1,
        "BG": 1
    };

    function setIf(group, propName, value) {
        if (!group) return false;
        try { var p = group.property(propName); if (p) { p.setValue(value); return true; } } catch (e) {}
        return false;
    }
    function safeAdd(effGroup, name) {
        try { return effGroup.addProperty(name); } catch (e) {
            $.writeln("[key] addProperty failed: " + name + " — " + e);
            return null;
        }
    }

    function applyKeylight(layer) {
        // Pomiń jeśli już ma Keylight
        try {
            for (var ei = 1; ei <= layer.Effects.numProperties; ei++) {
                if (layer.Effects.property(ei).matchName.indexOf("Keylight") !== -1) {
                    return "skipped (already keyed)";
                }
            }
        } catch (e) {}

        var keylight = safeAdd(layer.Effects, "Keylight (1.2)");
        if (!keylight) return "FAILED (Keylight unavailable)";

        setIf(keylight, "Screen Colour", GREEN_COLOR);
        setIf(keylight, "Screen Gain", 110);
        setIf(keylight, "Screen Balance", 50);
        setIf(keylight, "View", 9); // Final Result

        var screenMatte = null;
        try { screenMatte = keylight.property("Screen Matte"); } catch (e) {}
        if (screenMatte) {
            setIf(screenMatte, "Clip Black", 8);
            setIf(screenMatte, "Clip White", 92);
            setIf(screenMatte, "Screen Shrink/Grow", -0.5);
            setIf(screenMatte, "Screen Softness", 0.5);
        }

        var spill = safeAdd(layer.Effects, "Advanced Spill Suppressor");
        if (spill) {
            setIf(spill, "Method", 2);
            setIf(spill, "Suppression", 100);
        }

        return "OK";
    }

    // ── Tryb 1: zaznaczone warstwy ────────────────────────────────────────
    var targets = [];
    var sel = comp.selectedLayers;
    if (sel && sel.length > 0) {
        for (var s = 0; s < sel.length; s++) targets.push(sel[s]);
    } else {
        // ── Tryb 2: wszystkie warstwy footage'u (AVLayer z FootageItem source) ──
        for (var l = 1; l <= comp.numLayers; l++) {
            var layer = comp.layer(l);
            if (SKIP_NAMES[layer.name]) continue;
            if (!(layer instanceof AVLayer)) continue;
            var src = layer.source;
            if (!src) continue;
            // Solidy też są FootageItem, ale mainSource jest SolidSource. Pomiń je.
            try { if (src.mainSource instanceof SolidSource) continue; } catch (e) {}
            targets.push(layer);
        }
    }

    if (targets.length === 0) {
        alert("Nie znaleziono kandydatów do keyowania.\n\n" +
              "• Zaznacz warstwę z zielonym tłem w timeline, ALBO\n" +
              "• Zaimportuj plik wideo z green screenem (dodaj go do Main_Comp)");
        return;
    }

    // Aplikuj Keylight do wszystkich celów
    var report = [];
    for (var t = 0; t < targets.length; t++) {
        var status = applyKeylight(targets[t]);
        report.push("• " + targets[t].name + " — " + status);
    }

    app.endUndoGroup();

    alert(
        "Keylight + Spill Suppressor zaaplikowany.\n\n" +
        report.join("\n") + "\n\n" +
        "View=Final Result, Screen Gain=110, Spill=Ultra.\n" +
        "Edycja: zaznacz warstwę → E → rozwiń Keylight w Effect Controls."
    );
})();
