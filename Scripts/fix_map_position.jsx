(function fixMap() {
    app.beginUndoGroup("Fix Map Position");

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") {
            comp = app.project.item(i);
            break;
        }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var mapLayer = null;
    for (var j = 1; j <= comp.numLayers; j++) {
        if (comp.layer(j).name === "MAP_Background") {
            mapLayer = comp.layer(j);
            break;
        }
    }
    if (!mapLayer) { alert("Nie znaleziono warstwy MAP_Background"); return; }

    // Usuń wszystkie keyframe'y z Position, Scale i Anchor Point
    var posProp    = mapLayer.property("Position");
    var scaleProp  = mapLayer.property("Scale");
    var anchorProp = mapLayer.property("Anchor Point");

    while (posProp.numKeys > 0)    { posProp.removeKey(1); }
    while (scaleProp.numKeys > 0)  { scaleProp.removeKey(1); }
    while (anchorProp.numKeys > 0) { anchorProp.removeKey(1); }

    // Reset anchor point na 0,0
    anchorProp.setValue([0, 0]);

    // Skaluj żeby wypełnić kompozycję
    var src = mapLayer.source;
    var scaleX = (comp.width / src.width) * 100 * 1.3;
    var scaleY = (comp.height / src.height) * 100 * 1.3;
    var scale = Math.max(scaleX, scaleY);
    scaleProp.setValue([scale, scale]);

    // Dodaj animację pan — od lewej do prawej
    posProp.setValueAtTime(0,              [860, 540]);
    posProp.setValueAtTime(comp.duration,  [1060, 540]);

    app.endUndoGroup();
    alert("Naprawiono! Mapa powinna być teraz widoczna w kompozycji.");
})();
