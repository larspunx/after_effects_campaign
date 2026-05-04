/**
 * Przypina 2_flag_UK do 2_PLANE_bomber w stylu 1_flag_UK.
 */
(function() {
    app.beginUndoGroup('Attach 2_flag_UK to bomber (world)');

    var FLAG_NAME   = '2_flag_UK';
    var TARGET_NAME = '2_PLANE_bomber';

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }
    if (!comp) { alert('Brak Main_Comp'); app.endUndoGroup(); return; }

    var target = null, flag = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        var n = comp.layer(p).name;
        if (n === TARGET_NAME) target = comp.layer(p);
        if (n === FLAG_NAME)   flag   = comp.layer(p);
    }
    if (!target) { alert('Nie znaleziono: ' + TARGET_NAME); app.endUndoGroup(); return; }
    if (!flag)   { alert('Nie znaleziono: ' + FLAG_NAME);   app.endUndoGroup(); return; }

    var t = comp.time;

    function getProp(L, names) {
        for (var i = 0; i < names.length; i++) {
            try {
                var p = L.property(names[i]);
                if (p) return p;
            } catch(e) {}
        }
        return null;
    }

    function getVal(L, names, dflt) {
        var p = getProp(L, names);
        if (!p) return dflt;
        try { return p.valueAtTime(t, false); } catch(e) { return dflt; }
    }

    function getWorldPos(layer, debug) {
        var pt = getVal(layer, ['Position', 'ADBE Position'], [0,0]);
        var L = null;
        try { L = layer.parent; } catch(e) { L = null; }
        var depth = 0;
        while (L && depth < 10) {
            depth++;
            var lAnchor = getVal(L, ['Anchor Point', 'ADBE Anchor Point'], [0,0]);
            var lPos    = getVal(L, ['Position', 'ADBE Position'], [0,0]);
            var lScale  = getVal(L, ['Scale', 'ADBE Scale'], [100,100]);
            var lRot    = getVal(L, ['Rotation', 'ADBE Rotate Z'], 0);
            // pt jest w L.local space; przeksztalcic do parent space (lub world)
            var dx = pt[0] - lAnchor[0];
            var dy = pt[1] - lAnchor[1];
            var sx = lScale[0] / 100;
            var sy = lScale[1] / 100;
            dx *= sx; dy *= sy;
            var rad = (lRot || 0) * Math.PI / 180;
            var c = Math.cos(rad), s = Math.sin(rad);
            var rx = dx * c - dy * s;
            var ry = dx * s + dy * c;
            pt = [rx + lPos[0], ry + lPos[1]];
            if (debug) debug.push('  depth=' + depth + ' L=' + L.name + ' anchor=' + lAnchor + ' pos=' + lPos + ' scale=' + lScale + ' rot=' + lRot + ' -> pt=' + pt);
            try { L = L.parent; } catch(e) { L = null; }
        }
        return pt;
    }

    var dbg = [];
    dbg.push('FLAG ' + flag.name + ' parent: ' + (flag.parent ? flag.parent.name : 'NONE'));
    var flagWorld = getWorldPos(flag, dbg);
    dbg.push('-> flagWorld = ' + flagWorld);
    dbg.push('');
    dbg.push('TARGET ' + target.name + ' parent: ' + (target.parent ? target.parent.name : 'NONE'));
    var planeWorld = getWorldPos(target, dbg);
    dbg.push('-> planeWorld = ' + planeWorld);

    var offsetX = flagWorld[0] - planeWorld[0];
    var offsetY = flagWorld[1] - planeWorld[1];

    // Wyczysc expressiony i keyframy flagi
    var posProp = flag.property('Position');
    var rotProp = flag.property('Rotation');
    try { posProp.expression = ''; } catch(e) {}
    try { rotProp.expression = ''; } catch(e) {}
    while (posProp.numKeys > 0) { posProp.removeKey(1); }
    while (rotProp.numKeys > 0) { rotProp.removeKey(1); }

    flag.parent = null;
    posProp.setValue(flagWorld);
    rotProp.setValue(0);

    posProp.expression =
        'var pl = thisComp.layer("' + TARGET_NAME + '");\n' +
        'var p = pl.toWorld(pl.anchorPoint);\n' +
        '[p[0] + (' + offsetX.toFixed(2) + '), p[1] + (' + offsetY.toFixed(2) + ')];';

    app.endUndoGroup();
    alert(
        'Flaga ustawiona w stylu 1_flag_UK\n\n' +
        'Offset (world): ' + offsetX.toFixed(0) + ', ' + offsetY.toFixed(0) + '\n' +
        'Flag world: ' + flagWorld[0].toFixed(0) + ', ' + flagWorld[1].toFixed(0) + '\n' +
        'Plane world: ' + planeWorld[0].toFixed(0) + ', ' + planeWorld[1].toFixed(0) + '\n\n' +
        '--- DEBUG ---\n' + dbg.join('\n')
    );
})();
