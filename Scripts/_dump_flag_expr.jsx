(function () {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) return;
    for (var i = 1; i <= comp.numLayers; i++) {
        var L = comp.layer(i);
        if (!L.selected) continue;
        if (L.name.toLowerCase().indexOf("flag") < 0) continue;
        var pos = L.property("Position");
        var expr = pos ? pos.expression : "NO EXPR";
        var enabled = pos ? pos.expressionEnabled : false;
        L.comment = "enabled=" + enabled + " | " + expr.replace(/\n/g, " | ");
    }
})();
