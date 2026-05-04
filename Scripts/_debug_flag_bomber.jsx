(function() {
    var FLAG_NAME   = '2_flag_UK';
    var TARGET_NAME = '2_PLANE_bomber';

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }
    if (!comp) { alert('Brak Main_Comp'); return; }

    var target = null, flag = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        var n = comp.layer(p).name;
        if (n === TARGET_NAME) target = comp.layer(p);
        if (n === FLAG_NAME)   flag   = comp.layer(p);
    }

    if (!target) { alert('NIE ZNALEZIONO: ' + TARGET_NAME); return; }
    if (!flag)   { alert('NIE ZNALEZIONO: ' + FLAG_NAME); return; }

    var lines = [];
    lines.push('TARGET ' + target.name);
    lines.push('  parent: ' + (target.parent ? target.parent.name : 'NONE'));
    lines.push('  anchor: ' + target.anchorPoint.toString());
    lines.push('  posKeys: ' + target.property('Position').numKeys);
    lines.push('  posExpr: ' + ((target.property('Position').expression || '').substring(0, 60)));
    lines.push('');
    lines.push('FLAG ' + flag.name);
    lines.push('  parent: ' + (flag.parent ? flag.parent.name : 'NONE'));
    lines.push('  posKeys: ' + flag.property('Position').numKeys);
    lines.push('  posExpr: ' + ((flag.property('Position').expression || '').substring(0, 100)));
    lines.push('  exprErr: ' + (flag.property('Position').expressionError || '(brak)'));
    lines.push('');

    // Probki w 5 punktach
    var startT = Math.max(target.inPoint, 0);
    var endT   = Math.min(target.outPoint, comp.duration);
    lines.push('inPoint=' + startT.toFixed(2) + ' outPoint=' + endT.toFixed(2));
    lines.push('');
    lines.push('t | plane.toWorld | flag.pos eval');
    for (var k = 0; k <= 5; k++) {
        var st = startT + (endT - startT) * k / 5;
        var pw = target.toWorld(target.anchorPoint, st);
        var pl = target.property('Position').valueAtTime(st, false);
        var fp = flag.property('Position').valueAtTime(st, false);
        lines.push('t=' + st.toFixed(1) +
                   ' planeLocal=[' + pl[0].toFixed(0) + ',' + pl[1].toFixed(0) + ']' +
                   ' planeWorld=[' + pw[0].toFixed(0) + ',' + pw[1].toFixed(0) + ']' +
                   ' flag=[' + fp[0].toFixed(0) + ',' + fp[1].toFixed(0) + ']');
    }

    alert(lines.join('\n'));
})();
