/**
 * Pokazuje w alercie strukturę parent/child wszystkich warstw w Main_Comp.
 */
(function checkParents() {
    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var lines = [];
    for (var l = 1; l <= comp.numLayers; l++) {
        var layer = comp.layer(l);
        var p = layer.parent ? layer.parent.name : "—";
        var pos = "—";
        try {
            var v = layer.property("Position").value;
            pos = "[" + Math.round(v[0]) + "," + Math.round(v[1]) + "]";
        } catch (e) {}
        var scale = "—";
        try {
            var s = layer.property("Scale").value;
            scale = s[0] + "%";
        } catch (e) {}
        lines.push(l + ". " + layer.name + "\n   parent: " + p + "\n   pos: " + pos + "  scale: " + scale);
    }
    alert("=== Main_Comp layers ===\n\n" + lines.join("\n\n"));
})();
