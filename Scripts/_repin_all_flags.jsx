// Dla każdej pary flaga+samolot w Main_Comp stosuje wzorzec follow-no-rotation
// (jak flag_UK_follow_no_rotation.jsx). Flaga = warstwa "*_flag_*",
// samolot = pierwsza warstwa "*_PLANE_*" bezpośrednio pod flagą w stack-u.
(function () {
    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === "Main_Comp") { comp = app.project.item(i); break; }
    }
    if (!comp) return;

    function isFlag(L)  { return L.name.toLowerCase().indexOf("_flag_")  >= 0; }
    function isPlane(L) { return L.name.toLowerCase().indexOf("_plane_") >= 0; }

    function parseOffset(expr) {
        if (!expr) return null;
        var m = expr.match(/\+\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
        if (m) return [parseFloat(m[1]), parseFloat(m[2])];
        var mx = expr.match(/\w+\[0\]\s*\+\s*\(?\s*(-?[\d\.]+)/);
        var my = expr.match(/\w+\[1\]\s*\+\s*\(?\s*(-?[\d\.]+)/);
        if (mx && my) return [parseFloat(mx[1]), parseFloat(my[1])];
        return null;
    }

    function probeDelta(flag, plane) {
        var nl = comp.layers.addNull();
        nl.name = "_tmp_offset_probe";
        var nlPos = nl.property("ADBE Transform Group").property("ADBE Position");
        nlPos.expression =
            'var f = thisComp.layer("' + flag.name + '");\n' +
            'var b = thisComp.layer("' + plane.name + '");\n' +
            'var fc = f.toComp(f.transform.anchorPoint);\n' +
            'var bc = b.toComp(b.transform.anchorPoint);\n' +
            'var d = fc - bc;\n' +
            '[d[0] + thisComp.width/2, d[1] + thisComp.height/2]';
        var probed = nlPos.valueAtTime(comp.time, false);
        nl.remove();
        return [probed[0] - comp.width / 2, probed[1] - comp.height / 2];
    }

    app.beginUndoGroup("Repin all flags");

    // Cleanup po poprzednich runach
    for (var k = comp.numLayers; k >= 1; k--) {
        if (comp.layer(k).name.indexOf("_REPIN_SUMMARY") === 0) comp.layer(k).remove();
    }

    for (var l = 1; l <= comp.numLayers; l++) {
        var flag = comp.layer(l);
        if (!isFlag(flag)) continue;

        if (flag.comment && flag.comment.indexOf("REPIN:") === 0) flag.comment = "";

        var plane = null;
        for (var j = l + 1; j <= comp.numLayers; j++) {
            var cand = comp.layer(j);
            if (isPlane(cand)) { plane = cand; break; }
            if (isFlag(cand)) break;
        }
        if (!plane) continue;

        var posProp = flag.property("ADBE Transform Group").property("ADBE Position");
        var rotProp = flag.property("ADBE Transform Group").property("ADBE Rotate Z");
        var curExpr = posProp.expression || "";
        var nameMatch = curExpr.match(/thisComp\.layer\(\s*["']([^"']+)["']\s*\)/);
        if (nameMatch && nameMatch[1] === plane.name) continue;

        var off = parseOffset(curExpr);
        if (!off) {
            try { off = probeDelta(flag, plane); } catch (e) { continue; }
        }

        flag.parent = null;
        while (posProp.numKeys > 0) posProp.removeKey(1);
        while (rotProp.numKeys > 0) rotProp.removeKey(1);

        posProp.expression =
            'var b = thisComp.layer("' + plane.name + '");\n' +
            'var bAnchorComp = b.toComp(b.transform.anchorPoint);\n' +
            'bAnchorComp + [' + off[0].toFixed(2) + ', ' + off[1].toFixed(2) + ']';
        rotProp.expression = "0";
    }

    app.endUndoGroup();
})();
