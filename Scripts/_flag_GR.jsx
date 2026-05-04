(function() {
    app.beginUndoGroup('Attach Flag GR v2');

    var FLAG_NAME   = '1_flag_GR';
    var TARGET_NAME = '1_PLANE_df_przechwyc_B';

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }
    if (!comp) { alert('Brak Main_Comp'); app.endUndoGroup(); return; }

    var target = null, flag = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        if (comp.layer(p).name.indexOf(TARGET_NAME) !== -1) target = comp.layer(p);
        if (comp.layer(p).name.indexOf(FLAG_NAME)   !== -1) flag   = comp.layer(p);
    }
    if (!target || !flag) { alert('Nie znaleziono'); app.endUndoGroup(); return; }

    // Najpierw wyczysc istniejace expressions
    try { flag.property('Position').expression = ''; } catch(e) {}
    try { flag.property('Rotation').expression = ''; } catch(e) {}

    var t = comp.time;

    // Pobierz LOKALNE pozycje (przed zmiana parenta)
    var flagPosBefore = flag.property('Position').valueAtTime(t, false);

    // Ustaw flage z TYM SAMYM parentem co samolot — beda w tej samej przestrzeni
    flag.parent = target.parent;

    // Po zmianie parenta — pozycja flagi jest interpretowana w nowej przestrzeni
    // Wymuszamy jej zachowanie
    flag.property('Position').setValue(flagPosBefore);

    // Pobierz pozycje samolotu w tej samej przestrzeni (lokalnej parenta)
    var targetPos = target.property('Position').valueAtTime(t, false);
    var flagPos   = flag.property('Position').valueAtTime(t, false);

    var offsetX = flagPos[0] - targetPos[0];
    var offsetY = flagPos[1] - targetPos[1];

    // Rotacja = 0
    var rotProp = flag.property('Rotation');
    while (rotProp.numKeys > 0) { rotProp.removeKey(1); }
    rotProp.setValue(0);

    // Position expression — w lokalnej przestrzeni parenta
    var posProp = flag.property('Position');
    while (posProp.numKeys > 0) { posProp.removeKey(1); }
    posProp.expression =
        'var t = thisComp.layer("' + TARGET_NAME + '");\n' +
        'var p = t.transform.position;\n' +
        '[p[0] + (' + offsetX.toFixed(2) + '), p[1] + (' + offsetY.toFixed(2) + ')];';

    app.endUndoGroup();
    alert('Flaga GR przypieta!\nParent: ' + (flag.parent ? flag.parent.name : 'NONE') + '\nOffset: ' + offsetX.toFixed(0) + ', ' + offsetY.toFixed(0));
})();
