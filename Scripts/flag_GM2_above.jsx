// Przesuń 4_flag_GM 2 z prawej-dół na pozycję nad samolotem.
// Dystans zachowany, kierunek = prosto w górę.
(function () {
    var FLAG_NAME = "4_flag_GM 2";

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Brak Main_Comp"); return; }

    var flag = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === FLAG_NAME) { flag = comp.layer(l); break; }
    }
    if (!flag) { alert("Brak " + FLAG_NAME); return; }

    var posProp = flag.property("ADBE Transform Group").property("ADBE Position");
    var expr = posProp.expression || "";
    var m = expr.match(/\+\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
    if (!m) { alert("Nie udało się odczytać offsetu z expressiona"); return; }
    var dx = parseFloat(m[1]);
    var dy = parseFloat(m[2]);

    // Nowy offset: dx=0, dy = -sqrt(dx^2+dy^2) (ten sam dystans, prosto w górę)
    var dist = Math.sqrt(dx * dx + dy * dy);
    var newDx = 0;
    var newDy = -dist;

    app.beginUndoGroup("Move " + FLAG_NAME + " above plane");
    var newExpr = expr.replace(
        /\+\s*\[\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\]/,
        "+ [" + newDx + ", " + newDy + "]"
    );
    posProp.expression = newExpr;
    app.endUndoGroup();
})();
