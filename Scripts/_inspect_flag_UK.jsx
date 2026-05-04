// Inspekcja dzialajacej flagi 1_flag_UK — wynik do clipboardu i alertu
(function() {
    var FLAG_NAME = '1_flag_UK';

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }
    if (!comp) { alert('Brak Main_Comp'); return; }

    var flag = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        if (comp.layer(p).name === FLAG_NAME) { flag = comp.layer(p); break; }
    }
    if (!flag) { alert('Brak ' + FLAG_NAME); return; }

    var lines = [];
    lines.push('=== ' + FLAG_NAME + ' ===');
    lines.push('parent: ' + (flag.parent ? flag.parent.name : 'NONE'));
    lines.push('inPoint=' + flag.inPoint + ' outPoint=' + flag.outPoint);
    lines.push('');
    var posProp = flag.property('Position');
    var rotProp = flag.property('Rotation');
    var scProp  = flag.property('Scale');
    lines.push('--- POSITION ---');
    lines.push('numKeys: ' + posProp.numKeys);
    lines.push('value: ' + posProp.valueAtTime(comp.time, false).toString());
    lines.push('expression:');
    lines.push(posProp.expression || '(brak)');
    lines.push('');
    lines.push('--- ROTATION ---');
    lines.push('numKeys: ' + rotProp.numKeys);
    lines.push('value: ' + rotProp.valueAtTime(comp.time, false));
    lines.push('expression:');
    lines.push(rotProp.expression || '(brak)');
    lines.push('');
    lines.push('--- SCALE ---');
    lines.push('numKeys: ' + scProp.numKeys);
    lines.push('value: ' + scProp.valueAtTime(comp.time, false).toString());
    lines.push('expression:');
    lines.push(scProp.expression || '(brak)');

    alert(lines.join('\n'));
})();
