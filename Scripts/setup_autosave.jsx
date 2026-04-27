/**
 * Włącza wbudowany Auto-Save w AE: co 6 minut, max 5 wersji.
 * Trzymane w "Adobe After Effects Auto-Save/" obok projektu.
 *
 * File > Scripts > Run Script File...
 */

(function setupAutosave() {
    var SECTION = "Auto Save";
    var T = PREFType.PREF_Type_MACHINE_INDEPENDENT;

    var INTERVAL_MIN  = 6;
    var MAX_VERSIONS  = 5;

    try {
        app.preferences.savePrefAsLong(SECTION, "Auto Save Enabled", 1, T);
        app.preferences.savePrefAsLong(SECTION, "Auto Save Time (minutes)", INTERVAL_MIN, T);
        app.preferences.savePrefAsLong(SECTION, "Auto Save Max Project Versions", MAX_VERSIONS, T);
        app.preferences.savePrefAsLong(SECTION, "Auto Save On Render Queue Start", 1, T);

        app.preferences.reload();

        alert(
            "Auto-Save zaktualizowany.\n\n" +
            "Co: " + INTERVAL_MIN + " min  |  Max wersji: " + MAX_VERSIONS + "\n" +
            "Lokalizacja: Adobe After Effects Auto-Save/"
        );
    } catch (e) {
        alert("Błąd przy ustawianiu Auto-Save:\n" + e.toString() +
              "\n\nUstaw ręcznie w: Preferences → Auto-Save");
    }
})();
