(function () {
    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Brak Main_Comp"); return; }

    var out = [];
    for (var l = 1; l <= comp.numLayers; l++) {
        var nm = comp.layer(l).name;
        var lo = nm.toLowerCase();
        if (lo.indexOf("_flag_") >= 0 || lo.indexOf("_plane_") >= 0) {
            out.push(l + ": " + nm);
        }
    }
    alert(out.join("\n"));
})();
