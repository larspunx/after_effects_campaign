/**
 * Ustawia preferencję Display → Motion Path na "All Keyframes",
 * żeby cała trasa lotu była widoczna podczas edycji.
 *
 * File > Scripts > Run Script File...
 */

(function showFullMotionPath() {
    var T = PREFType.PREF_Type_MACHINE_INDEPENDENT;

    // Klucze preferencji w AE:
    //   "Pref_MOTION_PATH_NUM_KEYFRAMES" — liczba klatek (gdy NumFrames mode)
    //   "Pref_MOTION_PATH_USE_NUM_KEYFRAMES" — 1=NumFrames, 0=All
    //   "Pref_MOTION_PATH_DRAW" — 0=No, 1=Yes (general toggle)
    var SECTION = "Main Pref Section";

    try {
        // 1 = wszystkie keyframe'y (pełna trasa)
        app.preferences.savePrefAsLong(SECTION, "Pref_MOTION_PATH_DRAW",                1, T);
        // 0 = NIE używaj limitu klatek (czyli rysuj all keyframes)
        app.preferences.savePrefAsLong(SECTION, "Pref_MOTION_PATH_USE_NUM_KEYFRAMES",   0, T);
        // 1 = "All Keyframes" mode (zamiennie z powyższym, w niektórych wersjach AE)
        app.preferences.savePrefAsLong(SECTION, "Pref_MOTION_PATH_ALL_KEYFRAMES",       1, T);

        app.preferences.reload();

        alert(
            "Motion Path ustawiony na 'All Keyframes'.\n\n" +
            "Zaznacz warstwę PLANE → P → cała trasa widoczna.\n\n" +
            "Jeśli nie zadziałało, zmień ręcznie:\n" +
            "Settings/Preferences → Display → Motion Path → All Keyframes"
        );
    } catch (e) {
        alert("Błąd: " + e + "\n\nUstaw ręcznie: Preferences → Display → Motion Path");
    }
})();
