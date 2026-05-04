// 1) Usuwa nadmiarowe kopie 5_flag_GM i 5_PLANE_bomber (numery > 2)
// 2) Duplikuje 5_flag_GM 2 + 5_PLANE_bomber 2 → 3, zachowując parent i expression
(function () {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { alert("Brak aktywnego compa"); return; }

    var FLAG_BASE  = "5_flag_GM";
    var PLANE_BASE = "5_PLANE_bomber";
    var FLAG_SRC   = FLAG_BASE  + " 2";
    var PLANE_SRC  = PLANE_BASE + " 2";
    var FLAG_DST   = FLAG_BASE  + " 3";
    var PLANE_DST  = PLANE_BASE + " 3";

    app.beginUndoGroup("Cleanup + dup flag+plane");

    // Usuń wszystkie kopie z numerem > 2.
    for (var k = comp.numLayers; k >= 1; k--) {
        var nm = comp.layer(k).name;
        if (nm === FLAG_SRC || nm === PLANE_SRC) continue;
        var mf = nm.match(/^5_flag_GM\s+(\d+)$/);
        var mp = nm.match(/^5_PLANE_bomber\s+(\d+)$/);
        if ((mf && parseInt(mf[1]) > 2) || (mp && parseInt(mp[1]) > 2)) {
            comp.layer(k).remove();
        }
    }

    // Znajdź źródłowe warstwy.
    var flag = null, plane = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === FLAG_SRC)  flag  = comp.layer(l);
        if (comp.layer(l).name === PLANE_SRC) plane = comp.layer(l);
    }
    if (!flag || !plane) { app.endUndoGroup(); alert("Brak " + FLAG_SRC + " lub " + PLANE_SRC); return; }

    var oldPlaneName = plane.name;

    // Duplikuj i od razu ustaw parent (duplicate() NIE kopiuje parenta).
    var newPlane = plane.duplicate();
    newPlane.name = PLANE_DST;
    if (plane.parent) newPlane.parent = plane.parent;

    var newFlag = flag.duplicate();
    newFlag.name = FLAG_DST;
    if (flag.parent) newFlag.parent = flag.parent;
    newFlag.moveBefore(newPlane);

    // Podmień referencję samolotu w expression nowej flagi.
    var posProp = newFlag.property("ADBE Transform Group").property("ADBE Position");
    var expr = posProp.expression || "";
    if (expr) {
        var oldRef = 'thisComp.layer("' + oldPlaneName + '")';
        var newRef = 'thisComp.layer("' + PLANE_DST + '")';
        posProp.expression = expr.split(oldRef).join(newRef);
    }

    app.endUndoGroup();
    alert("OK\n" + FLAG_DST + " idx=" + newFlag.index + "\n" + PLANE_DST + " idx=" + newPlane.index
        + "\nplane parent: " + (newPlane.parent ? newPlane.parent.name : "None"));
})();
