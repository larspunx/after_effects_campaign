// Tylko keyframe'y skali na 1_info_slot.
// Anchor i Position pozostawiamy nietknięte — ustaw anchor ręcznie w AE
// (narzędzie Pan Behind, klawisz Y) na lewy-dolny róg obrazka.
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
    if (!layer) { alert("Nie znaleziono " + TARGET_NAME); return; }

    app.beginUndoGroup("Scale keyframes " + TARGET_NAME);

    var scaleProp = layer.property("ADBE Transform Group").property("ADBE Scale");
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
    for (var k = 1; k <= scaleProp.numKeys; k++) {
        scaleProp.setTemporalEaseAtKey(k, easeIn, easeOut);
    }

    app.endUndoGroup();
})();
