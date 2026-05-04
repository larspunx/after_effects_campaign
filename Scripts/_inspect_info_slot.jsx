// Diagnostyka: czym jest warstwa 1_info_slot i co zawiera
(function () {
    var TARGET_NAME = "1_info_slot";
    var LOG_PATH = "/Users/mac/tsg/AfterEffects/Scripts/_inspect_info_slot.log";

    var lines = ["[start]"];
    function log(s) { lines.push(String(s)); }
    var f = new File(LOG_PATH);
    f.encoding = "UTF-8";
    var openOk = f.open("w");
    f.writeln("[probe] open=" + openOk);
    f.close();

    try {
        var comp = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
        }
        if (!comp) { log("Brak Main_Comp"); }
        else {
            var layer = null;
            for (var l = 1; l <= comp.numLayers; l++) {
                if (comp.layer(l).name === TARGET_NAME) { layer = comp.layer(l); break; }
            }
            if (!layer) { log("Brak warstwy " + TARGET_NAME); }
            else {
                log("=== " + TARGET_NAME + " ===");
                log("typeName: " + layer.typeName);
                log("matchName: " + (layer.matchName || "n/a"));
                var src = layer.source;
                log("source: " + (src ? (src.name + " (" + (src instanceof CompItem ? "CompItem" : src.typeName) + ")") : "null"));

                var rect = layer.sourceRectAtTime(comp.time, false);
                log("sourceRect: left=" + rect.left + " top=" + rect.top + " width=" + rect.width + " height=" + rect.height);
                log("anchor: " + layer.property("ADBE Transform Group").property("ADBE Anchor Point").value.toString());
                log("position: " + layer.property("ADBE Transform Group").property("ADBE Position").value.toString());
                log("scale: " + layer.property("ADBE Transform Group").property("ADBE Scale").value.toString());

                if (src && src instanceof CompItem) {
                    log("--- subkomp '" + src.name + "' (" + src.width + "x" + src.height + ") layers: " + src.numLayers + " ---");
                    for (var k = 1; k <= src.numLayers; k++) {
                        var sl = src.layer(k);
                        var sr = null;
                        try { sr = sl.sourceRectAtTime(0, false); } catch (e) { sr = null; }
                        var pos = "";
                        try { pos = " pos=" + sl.property("ADBE Transform Group").property("ADBE Position").value.toString(); } catch (e2) {}
                        log("  " + k + ": " + sl.name +
                            (sr ? "  rect[L=" + sr.left + " T=" + sr.top + " W=" + sr.width + " H=" + sr.height + "]" : "") +
                            pos);
                    }
                }
            }
        }
    } catch (err) {
        log("ERROR: " + err.toString());
    }

    var f = new File(LOG_PATH);
    f.encoding = "UTF-8";
    f.open("w");
    f.write(lines.join("\n"));
    f.close();
})();
