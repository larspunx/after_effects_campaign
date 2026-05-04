(function () {
    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i) instanceof CompItem &&
            app.project.item(i).name === "Main_Comp") {
            comp = app.project.item(i); break;
        }
    }
    if (!comp) return;

    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    function toTC(t, fps) {
        var f  = Math.round(t * fps);
        var s  = Math.floor(f / fps); f = f % fps;
        var mn = Math.floor(s / 60); s = s % 60;
        return pad(mn) + ":" + pad(s) + ":" + pad(f);
    }

    var lines = [];
    var cm = comp.markerProperty;
    if (cm && cm.numKeys > 0) {
        for (var k = 1; k <= cm.numKeys; k++) {
            var t = cm.keyTime(k);
            var label = cm.keyValue(k).comment || ("M" + k);
            lines.push(label + " = " + t.toFixed(2) + "s (" + toTC(t, comp.frameRate) + ")");
        }
    }

    // Wpisz wynik do Comment warstwy SCENE_CONTROLLER
    for (var li = 1; li <= comp.numLayers; li++) {
        if (comp.layer(li).name === "SCENE_CONTROLLER") {
            comp.layer(li).comment = lines.length > 0 ? lines.join(" | ") : "brak markerow";
            break;
        }
    }
})();
