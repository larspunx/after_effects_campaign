/**
 * Usuwa wszystkie efekty Keylight i Advanced Spill Suppressor z warstw
 * w aktywnej kompozycji (lub Main_Comp). Przywraca stan przed key_green_screen.
 *
 * File > Scripts > Run Script File...
 */

(function removeKeylight() {
    app.beginUndoGroup("Remove Keylight Effects");

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
    if (!comp) { alert("Nie znaleziono kompozycji"); return; }

    var REMOVE_NAMES = ["Keylight", "Advanced Spill Suppressor", "ADBE Spill Suppressor"];

    function shouldRemove(matchName, displayName) {
        var m = (matchName || "").toLowerCase();
        var d = (displayName || "").toLowerCase();
        for (var i = 0; i < REMOVE_NAMES.length; i++) {
            var n = REMOVE_NAMES[i].toLowerCase();
            if (m.indexOf(n) !== -1 || d.indexOf(n) !== -1) return true;
        }
        return false;
    }

    var report = [];
    var totalRemoved = 0;

    for (var l = 1; l <= comp.numLayers; l++) {
        var layer = comp.layer(l);
        if (!layer.Effects) continue;

        // Iteruj od końca, bo usunięcie zmienia indeksy
        var removed = 0;
        for (var ei = layer.Effects.numProperties; ei >= 1; ei--) {
            try {
                var eff = layer.Effects.property(ei);
                if (shouldRemove(eff.matchName, eff.name)) {
                    eff.remove();
                    removed++;
                }
            } catch (e) {}
        }
        if (removed > 0) {
            report.push("• " + layer.name + " — usunięto " + removed + " efekt(y)");
            totalRemoved += removed;
        }
    }

    app.endUndoGroup();

    if (totalRemoved === 0) {
        alert("Nie znaleziono żadnych efektów Keylight do usunięcia.");
    } else {
        alert("Cofnięto Keylight.\n\n" + report.join("\n") +
              "\n\nŁącznie usunięto: " + totalRemoved + " efekt(ów)");
    }
})();
