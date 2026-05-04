// 2_flag_UK leci za 2_PLANE_bomber w stałym comp-space offset, bez rotacji.
// toComp() działa tylko w expressionach, więc używam tymczasowego nulla
// żeby zmierzyć comp-space pozycje obu warstw.
(function () {
    var FLAG_NAME = "2_flag_UK";
    var BOMBER_NAME = "2_PLANE_bomber";

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Brak Main_Comp"); return; }

    var flag = null, bomber = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        var n = comp.layer(l).name;
        if (n === FLAG_NAME) flag = comp.layer(l);
        else if (n === BOMBER_NAME) bomber = comp.layer(l);
    }
    if (!flag || !bomber) { alert("Brak " + FLAG_NAME + " lub " + BOMBER_NAME); return; }

    app.beginUndoGroup("Pin " + FLAG_NAME + " to " + BOMBER_NAME);

    // 1) Tymczasowy null z expressionem — zwraca flag_comp - bomber_comp + center
    var nl = comp.layers.addNull();
    nl.name = "_tmp_offset_probe";
    var nlPos = nl.property("ADBE Transform Group").property("ADBE Position");
    var probeExpr =
        'var f = thisComp.layer("' + FLAG_NAME + '");\n' +
        'var b = thisComp.layer("' + BOMBER_NAME + '");\n' +
        'var fc = f.toComp(f.transform.anchorPoint);\n' +
        'var bc = b.toComp(b.transform.anchorPoint);\n' +
        'var d = fc - bc;\n' +
        '[d[0] + thisComp.width/2, d[1] + thisComp.height/2]';
    nlPos.expression = probeExpr;

    var t = comp.time;
    var probed = nlPos.valueAtTime(t, false);
    var dx = probed[0] - comp.width / 2;
    var dy = probed[1] - comp.height / 2;

    nl.remove();

    // 2) Odepnij flagę
    flag.parent = null;

    // 3) Ustaw expressions
    var posProp = flag.property("ADBE Transform Group").property("ADBE Position");
    var rotProp = flag.property("ADBE Transform Group").property("ADBE Rotate Z");
    while (posProp.numKeys > 0) posProp.removeKey(1);
    while (rotProp.numKeys > 0) rotProp.removeKey(1);

    posProp.expression =
        'var b = thisComp.layer("' + BOMBER_NAME + '");\n' +
        'var bAnchorComp = b.toComp(b.transform.anchorPoint);\n' +
        'bAnchorComp + [' + dx + ', ' + dy + ']';
    rotProp.expression = "0";

    app.endUndoGroup();
})();
