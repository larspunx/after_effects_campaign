/**
 * Wydłuża Main_Comp o ADD_SECONDS sekund.
 *
 * File > Scripts > Run Script File...
 */

(function extendCompDuration() {
    app.beginUndoGroup("Extend Comp Duration");

    var ADD_SECONDS = 20;

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var oldDur = comp.duration;
    comp.duration = oldDur + ADD_SECONDS;

    app.endUndoGroup();

    alert(
        "Czas trwania zmieniony.\n\n" +
        "Było: " + oldDur.toFixed(2) + "s\n" +
        "Jest: " + comp.duration.toFixed(2) + "s"
    );
})();
