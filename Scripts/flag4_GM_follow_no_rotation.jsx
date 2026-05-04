// follow-without-rotation: 4_flag_GM -> 4_PLANE_df_przechwyc_bitwa 2
// Offset z 2_flag_UK (standard, prawy-dół).
(function () {
    var FLAG_NAME  = "4_flag_GM";
    var PLANE_NAME = "4_PLANE_df_przechwyc_bitwa 2";
    var SRC_FLAG   = "2_flag_UK";

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Brak Main_Comp"); return; }

    var flag = null, plane = null, src = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        var nm = comp.layer(l).name;
        if (nm === FLAG_NAME)  flag  = comp.layer(l);
        if (nm === PLANE_NAME) plane = comp.layer(l);
        if (nm === SRC_FLAG)   src   = comp.layer(l);
    }
    if (!flag)  { alert("Brak " + FLAG_NAME); return; }
    if (!plane) { alert("Brak " + PLANE_NAME); return; }
    if (!src)   { alert("Brak " + SRC_FLAG); return; }

    var srcExpr = src.property("ADBE Transform Group").property("ADBE Position").expression || "";
    var m = srcExpr.match(/\+\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
    if (!m) { alert("Nie udało się odczytać dx,dy z " + SRC_FLAG); return; }
    var dx = parseFloat(m[1]);
    var dy = parseFloat(m[2]);

    app.beginUndoGroup("Pin " + FLAG_NAME + " to " + PLANE_NAME);

    flag.parent = null;

    var posProp = flag.property("ADBE Transform Group").property("ADBE Position");
    var rotProp = flag.property("ADBE Transform Group").property("ADBE Rotate Z");
    while (posProp.numKeys > 0) posProp.removeKey(1);
    while (rotProp.numKeys > 0) rotProp.removeKey(1);

    posProp.expression =
        'var b = thisComp.layer("' + PLANE_NAME + '");\n' +
        'var bAnchorComp = b.toComp(b.transform.anchorPoint);\n' +
        'bAnchorComp + [' + dx + ', ' + dy + ']';
    rotProp.expression = "0";

    app.endUndoGroup();
})();
