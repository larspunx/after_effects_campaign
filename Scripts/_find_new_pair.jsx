(function () {
    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Brak Main_Comp"); return; }

    var out = [];
    for (var l = 1; l <= comp.numLayers; l++) {
        var nm = comp.layer(l).name;
        if (nm.indexOf("5_flag_GM") >= 0 || nm.indexOf("5_PLANE_bomber") >= 0) {
            out.push("idx " + l + ": " + nm);
        }
    }
    alert("5_flag_GM / 5_PLANE_bomber layers:\n\n" + out.join("\n"));
})();
