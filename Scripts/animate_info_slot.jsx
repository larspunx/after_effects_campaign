// Animacja pokazania/ukrycia warstwy "1_info_slot" ze skali z anchorem
// w lewym-dolnym rogu samego asseta (największej sub-warstwy w prekompie).
// Pojawienie 10.0..10.3s, zniknięcie 14.7..15.0s, ease in/out.
(function () {
    var TARGET_NAME = "1_info_slot";
    var SHOW_IN  = 10.0;
    var SHOW_OUT = 10.3;
    var HIDE_IN  = 14.7;
    var HIDE_OUT = 15.0;

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Nie znaleziono Main_Comp"); return; }

    var layer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === TARGET_NAME) { layer = comp.layer(l); break; }
    }
    if (!layer) { alert("Nie znaleziono warstwy " + TARGET_NAME); return; }

    app.beginUndoGroup("Animate " + TARGET_NAME);

    // 1) Wyznacz anchor: lewy-dolny róg największej sub-warstwy (w lokalnych
    //    współrzędnych prekompu = lokalnych współrzędnych warstwy 1_info_slot).
    var anchorProp = layer.property("ADBE Transform Group").property("ADBE Anchor Point");
    var posProp    = layer.property("ADBE Transform Group").property("ADBE Position");
    var scaleProp  = layer.property("ADBE Transform Group").property("ADBE Scale");
    var oldAnchor  = anchorProp.value;
    var oldPos     = posProp.value;

    var newAnchor = null;

    if (layer.source && layer.source instanceof CompItem) {
        var pre = layer.source;
        var bestArea = -1, bestBL = null;
        for (var k = 1; k <= pre.numLayers; k++) {
            var sl = pre.layer(k);
            if (!sl.enabled) continue;
            var sr;
            try { sr = sl.sourceRectAtTime(0, false); } catch (e) { continue; }
            if (!sr || sr.width <= 0 || sr.height <= 0) continue;

            // Sub-warstwa też ma własny transform — przelicz bottom-left
            // do układu prekompu używając jej Position/Anchor/Scale (bez rotacji).
            var sPos    = sl.property("ADBE Transform Group").property("ADBE Position").value;
            var sAnchor = sl.property("ADBE Transform Group").property("ADBE Anchor Point").value;
            var sScale  = sl.property("ADBE Transform Group").property("ADBE Scale").value;
            var ssx = sScale[0] / 100, ssy = sScale[1] / 100;

            // bottom-left w lokalnych współrzędnych źródła sub-warstwy:
            var blLocalX = sr.left;
            var blLocalY = sr.top + sr.height;
            // przeniesienie do współrzędnych prekompu:
            var blCompX = sPos[0] + (blLocalX - sAnchor[0]) * ssx;
            var blCompY = sPos[1] + (blLocalY - sAnchor[1]) * ssy;

            var area = sr.width * sr.height * Math.abs(ssx * ssy);
            if (area > bestArea) {
                bestArea = area;
                bestBL = [blCompX, blCompY];
            }
        }
        if (bestBL) newAnchor = bestBL;
    }

    if (!newAnchor) {
        // Fallback: użyj sourceRect samej warstwy
        var rect = layer.sourceRectAtTime(comp.time, false);
        newAnchor = [rect.left, rect.top + rect.height];
    }

    // Kompensacja Position (zakładamy brak rotacji warstwy)
    var sx = scaleProp.value[0] / 100;
    var sy = scaleProp.value[1] / 100;
    var dx = (newAnchor[0] - oldAnchor[0]) * sx;
    var dy = (newAnchor[1] - oldAnchor[1]) * sy;
    var newPos = (oldPos.length === 3)
        ? [oldPos[0] + dx, oldPos[1] + dy, oldPos[2]]
        : [oldPos[0] + dx, oldPos[1] + dy];

    if (oldAnchor.length === 3) {
        anchorProp.setValue([newAnchor[0], newAnchor[1], oldAnchor[2]]);
    } else {
        anchorProp.setValue([newAnchor[0], newAnchor[1]]);
    }
    posProp.setValue(newPos);

    // 2) Keyframe'y skali (czyść stare i ustaw nowe)
    while (scaleProp.numKeys > 0) scaleProp.removeKey(1);

    var fullScale = scaleProp.value;
    var zeroScale = (fullScale.length === 3) ? [0, 0, 0] : [0, 0];

    scaleProp.setValueAtTime(SHOW_IN,  zeroScale);
    scaleProp.setValueAtTime(SHOW_OUT, fullScale);
    scaleProp.setValueAtTime(HIDE_IN,  fullScale);
    scaleProp.setValueAtTime(HIDE_OUT, zeroScale);

    var dim = fullScale.length;
    var easeIn = []; for (var a = 0; a < dim; a++) easeIn.push(new KeyframeEase(0, 75));
    var easeOut = []; for (var b = 0; b < dim; b++) easeOut.push(new KeyframeEase(0, 75));
    for (var key = 1; key <= scaleProp.numKeys; key++) {
        scaleProp.setTemporalEaseAtKey(key, easeIn, easeOut);
    }

    app.endUndoGroup();
})();
