(function() {
    app.beginUndoGroup('Flag Fix');
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
    if (!plane || !flag) { alert('Nie znaleziono warstw'); app.endUndoGroup(); return; }

    flag.parent = null;

    var rotProp = flag.property('Rotation');
    while (rotProp.numKeys > 0) { rotProp.removeKey(1); }
    try { rotProp.expression = ''; } catch(e) {}
    rotProp.setValue(0);

    var posProp = flag.property('Position');
    while (posProp.numKeys > 0) { posProp.removeKey(1); }

    var posExpr = 'var pl = thisComp.layer("1_PLANE_df_przechwyc_A");\n' +
                  'pl.toWorld(pl.anchorPoint);';
    posProp.expression = posExpr;

    var info = 'Flaga: ' + flag.name + '\n' +
               'Parent: ' + (flag.parent ? flag.parent.name : 'NONE') + '\n' +
               'Rotation: ' + rotProp.value + '\n' +
               'Position expr enabled: ' + posProp.expressionEnabled;

    app.endUndoGroup();
    alert(info);
})();
