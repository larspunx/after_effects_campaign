/**
 * Dodaje płynny fade-out na końcu warstwy EXPLOSION_ON_MAP.
 *
 * File > Scripts > Run Script File...
 */

(function fadeOutExplosion() {
    app.beginUndoGroup("Fade Out Explosion");

    var FADE_DUR = 1.2;     // długość fade-outu (sekundy)
    var HOLD     = 100;     // pełne krycie do tego momentu

    var proj = app.project;
    var comp = null;
    for (var i = 1; i <= proj.numItems; i++) {
        if (proj.item(i).name === "Main_Comp") { comp = proj.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var layer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === "EXPLOSION_ON_MAP") { layer = comp.layer(l); break; }
    }
    if (!layer) { alert("Nie znaleziono warstwy EXPLOSION_ON_MAP"); return; }

    var op = layer.property("Opacity");

    // Wyczyść istniejące keyframe'y Opacity
    while (op.numKeys > 0) op.removeKey(1);

    var endT   = layer.outPoint;
    var startT = endT - FADE_DUR;
    if (startT < layer.inPoint) startT = layer.inPoint;

    op.setValueAtTime(startT, HOLD);
    op.setValueAtTime(endT,   0);

    // Easy Ease — płynne wyciszenie
    op.setInterpolationTypeAtKey(1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    op.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    op.setTemporalEaseAtKey(1, [new KeyframeEase(0, 33)],  [new KeyframeEase(0, 75)]);
    op.setTemporalEaseAtKey(2, [new KeyframeEase(0, 75)],  [new KeyframeEase(0, 33)]);

    app.endUndoGroup();

    alert("Fade-out dodany na ostatnich " + FADE_DUR + "s warstwy EXPLOSION_ON_MAP.");
})();
