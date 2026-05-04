(function () {
    var TARGET   = "2_flag_UK";
    var NUDGE_X  = -130;
    var NUDGE_Y  = -130;

    app.beginUndoGroup("Nudge flag offset");
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { app.endUndoGroup(); return; }

    var flag = null;
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).name === TARGET) { flag = comp.layer(i); break; }
    }
    if (!flag) { flag.comment = "NOT FOUND"; app.endUndoGroup(); return; }

    var pos = flag.property("Position");
    var expr = pos.expression || "";

    // Obsłuż oba formaty: p[0] + (X) i bAnchorComp + [X, Y]
    var mx = expr.match(/\w+\[0\]\s*\+\s*\(?\s*(-?[\d\.]+)/);
    var my = expr.match(/\w+\[1\]\s*\+\s*\(?\s*(-?[\d\.]+)/);
    // Format: bAnchorComp + [X, Y]
    if (!mx || !my) {
        var lastBracket = null, bm2;
        var re2 = /\[([^\[\]]+)\]/g;
        while ((bm2 = re2.exec(expr)) !== null) lastBracket = bm2[1];
        if (lastBracket) {
            var nums = lastBracket.match(/-?[\d\.]+/g);
            if (nums && nums.length >= 2) {
                mx = [null, nums[0]];
                my = [null, nums[1]];
            }
        }
    }
    if (!mx || !my) { flag.comment = "NO MATCH: " + expr.substring(0,50); app.endUndoGroup(); return; }

    var dx = parseFloat(mx[1]) + NUDGE_X;
    var dy = parseFloat(my[1]) + NUDGE_Y;

    var nameMatch = expr.match(/thisComp\.layer\(\s*["']([^"']+)["']\s*\)/);
    if (!nameMatch) { flag.comment = "NO PLANE NAME"; app.endUndoGroup(); return; }

    var newExpr =
        'var t = thisComp.layer("' + nameMatch[1] + '");\n' +
        'var p = t.toWorld(t.anchorPoint);\n' +
        '[p[0] + (' + dx.toFixed(2) + '), p[1] + (' + dy.toFixed(2) + ')]';

    pos.expression = newExpr;
    flag.comment = "OK offset=[" + dx.toFixed(1) + "," + dy.toFixed(1) + "]";

    app.endUndoGroup();
})();
