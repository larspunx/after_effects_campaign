(function () {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) return;
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).name !== "2_flag_UK 2") continue;
        var pos = comp.layer(i).property("Position");
        comp.layer(i).comment = "VAL=" + pos.value.toString() + " | EN=" + pos.expressionEnabled + " | ERR=" + pos.expressionError + " | " + pos.expression.replace(/\n/g,"##");
    }
})();
