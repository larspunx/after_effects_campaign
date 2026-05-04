(function () {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { alert("Brak aktywnego compa"); return; }
    var sel = comp.selectedLayers;
    if (sel.length === 0) { alert("Zaznacz warstwę flagi (i opcjonalnie samolotu)"); return; }

    var out = [];
    for (var i = 0; i < sel.length; i++) {
        var L = sel[i];
        var pos = L.property("ADBE Transform Group").property("ADBE Position");
        var rot = L.property("ADBE Transform Group").property("ADBE Rotate Z");
        out.push("=== " + L.name + " (idx " + L.index + ") ===");
        out.push("parent: " + (L.parent ? L.parent.name : "None"));
        out.push("pos.expression: " + (pos.expression || "<empty>"));
        out.push("pos.expressionEnabled: " + pos.expressionEnabled);
        out.push("pos.numKeys: " + pos.numKeys);
        out.push("rot.expression: " + (rot.expression || "<empty>"));
        out.push("");
    }
    alert(out.join("\n"));
})();
