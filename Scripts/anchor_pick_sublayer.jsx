// Pokazuje listę sub-warstw prekompu 1_info_slot. Wybierasz tę z obrazkiem;
// skrypt ustawia anchor głównej warstwy na lewy-dolny róg wybranej sub-warstwy
// (w lokalnych współrzędnych prekompu) i kompensuje Position żeby slot
// nie zmienił widocznej pozycji.
(function () {
    var TARGET_NAME = "1_info_slot";

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) { alert("Brak Main_Comp"); return; }

    var layer = null;
    for (var l = 1; l <= comp.numLayers; l++) {
        if (comp.layer(l).name === TARGET_NAME) { layer = comp.layer(l); break; }
    }
    if (!layer) { alert("Brak " + TARGET_NAME); return; }
    if (!(layer.source instanceof CompItem)) { alert("Warstwa nie jest prekompem"); return; }

    var pre = layer.source;

    // Zbierz info o każdej widzialnej sub-warstwie + jej bottom-left w prekomp space
    var entries = [];
    for (var k = 1; k <= pre.numLayers; k++) {
        var sl = pre.layer(k);
        if (!sl.enabled) continue;
        var sr;
        try { sr = sl.sourceRectAtTime(0, false); } catch (e) { continue; }
        if (!sr || sr.width <= 0 || sr.height <= 0) continue;

        var sPos    = sl.property("ADBE Transform Group").property("ADBE Position").value;
        var sAnchor = sl.property("ADBE Transform Group").property("ADBE Anchor Point").value;
        var sScale  = sl.property("ADBE Transform Group").property("ADBE Scale").value;
        var ssx = sScale[0] / 100, ssy = sScale[1] / 100;
        var blX = sPos[0] + (sr.left - sAnchor[0]) * ssx;
        var blY = sPos[1] + (sr.top + sr.height - sAnchor[1]) * ssy;

        entries.push({
            idx: k,
            name: sl.name,
            w: Math.round(sr.width * Math.abs(ssx)),
            h: Math.round(sr.height * Math.abs(ssy)),
            bl: [blX, blY]
        });
    }
    if (entries.length === 0) { alert("Brak sub-warstw"); return; }

    // Dialog wyboru
    var w = new Window("dialog", "Wybierz sub-warstwę dla anchora");
    w.alignChildren = "fill";
    w.add("statictext", undefined, "Anchor warstwy '" + TARGET_NAME + "' zostanie ustawiony na lewy-dolny róg wybranej sub-warstwy:");
    var lb = w.add("listbox", undefined, [], { multiselect: false });
    lb.preferredSize = [500, 220];
    for (var e = 0; e < entries.length; e++) {
        var en = entries[e];
        lb.add("item", en.idx + ": " + en.name + "  (" + en.w + "x" + en.h + ")  BL=[" + Math.round(en.bl[0]) + "," + Math.round(en.bl[1]) + "]");
    }
    lb.selection = 0;
    var btns = w.add("group");
    btns.alignment = "right";
    var okBtn = btns.add("button", undefined, "OK");
    var cancelBtn = btns.add("button", undefined, "Anuluj");
    okBtn.onClick = function () { w.close(1); };
    cancelBtn.onClick = function () { w.close(0); };
    var result = w.show();
    if (result !== 1 || !lb.selection) return;

    var chosen = entries[lb.selection.index];
    var newAnchor = chosen.bl;

    app.beginUndoGroup("Set anchor on " + TARGET_NAME);

    var anchorProp = layer.property("ADBE Transform Group").property("ADBE Anchor Point");
    var posProp    = layer.property("ADBE Transform Group").property("ADBE Position");
    var scaleProp  = layer.property("ADBE Transform Group").property("ADBE Scale");

    var oldA = anchorProp.value;
    var oldP = posProp.value;
    var sx = scaleProp.value[0] / 100;
    var sy = scaleProp.value[1] / 100;

    var dx = (newAnchor[0] - oldA[0]) * sx;
    var dy = (newAnchor[1] - oldA[1]) * sy;

    if (oldA.length === 3) anchorProp.setValue([newAnchor[0], newAnchor[1], oldA[2]]);
    else                   anchorProp.setValue([newAnchor[0], newAnchor[1]]);

    if (oldP.length === 3) posProp.setValue([oldP[0] + dx, oldP[1] + dy, oldP[2]]);
    else                   posProp.setValue([oldP[0] + dx, oldP[1] + dy]);

    app.endUndoGroup();
})();
