(function () {
    app.beginUndoGroup("Test scale link");

    var flag = null, mapL = null, plane = null, comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            var L = it.layer(li);
            if (L.name === "1_flag_UK") { flag = L; comp = it; }
            if (L.name === "MAP_Background") mapL = L;
            if (L.name === "1_PLANE_df_przechwyc_A") plane = L;
        }
    }
    if (!flag || !mapL) return;

    var sc = flag.property("Scale");
    var ms = mapL.property("Scale");
    var ps = plane ? plane.property("Scale") : null;

    var origMapScale = ms.value;
    var report = "ORIG map=" + origMapScale.toString() +
                 " flag.evalScale=" + sc.value.toString() +
                 " flag.expr.enabled=" + sc.expressionEnabled +
                 " plane.localScale=" + (ps ? ps.value.toString() : "n/a") +
                 " plane.parent=" + (plane && plane.parent ? plane.parent.name : "none");

    // Set map to 200% temporarily
    ms.setValue([200, 200, 100]);

    // Force AE to evaluate at current time
    var t = comp.time;
    comp.time = t;

    var newReport = " | AT_200 flag.evalScale=" + sc.valueAtTime(t, false).toString();

    // Restore
    ms.setValue(origMapScale);

    flag.comment = report + newReport;

    app.endUndoGroup();
})();
