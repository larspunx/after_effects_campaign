(function() {
    app.beginUndoGroup('Flag Offset');
    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }

    var planeName = '1_PLANE_df_przechwyc_A';
    var flagName  = '1_flag_UK';

    var plane = null, flag = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        if (comp.layer(p).name.indexOf(planeName) !== -1) plane = comp.layer(p);
        if (comp.layer(p).name.indexOf(flagName)  !== -1) flag  = comp.layer(p);
    }
    if (!plane || !flag) { alert('Nie znaleziono'); app.endUndoGroup(); return; }

    // ── KONFIGURACJA — zmien wartosci wedlug potrzeb ──────────────────────
    var offsetX = -60;   // ujemne = w lewo, dodatnie = w prawo
    var offsetY = -50;   // ujemne = w gore, dodatnie = w dol
    var scale   = 50;    // % wielkosci flagi (100 = oryginal)
    // ──────────────────────────────────────────────────────────────────────

    flag.parent = null;

    // Rotacja na sztywno = 0
    var rotProp = flag.property('Rotation');
    while (rotProp.numKeys > 0) { rotProp.removeKey(1); }
    try { rotProp.expression = ''; } catch(e) {}
    rotProp.setValue(0);

    // Position expression z offsetem
    var posProp = flag.property('Position');
    while (posProp.numKeys > 0) { posProp.removeKey(1); }
    posProp.expression =
        'var pl = thisComp.layer("' + planeName + '");\n' +
        'var p = pl.toWorld(pl.anchorPoint);\n' +
        '[p[0] + (' + offsetX + '), p[1] + (' + offsetY + ')];';

    // Skala
    var scProp = flag.property('Scale');
    while (scProp.numKeys > 0) { scProp.removeKey(1); }
    try { scProp.expression = ''; } catch(e) {}
    scProp.setValue([scale, scale]);

    app.endUndoGroup();
    alert('Flaga przesunieta!\n\nOffset: ' + offsetX + ', ' + offsetY + '\nSkala: ' + scale + '%\n\nAby zmienic wartosci - edytuj _flag_offset.jsx');
})();
