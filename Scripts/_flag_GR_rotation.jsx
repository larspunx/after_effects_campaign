(function() {
    app.beginUndoGroup('Flag Always Horizontal');

    var FLAG_NAME   = '1_flag_GR';
    var TARGET_NAME = '1_PLANE_df_przechwyc_B';

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }

    var flag = null, target = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        if (comp.layer(p).name.indexOf(FLAG_NAME)   !== -1) flag   = comp.layer(p);
        if (comp.layer(p).name.indexOf(TARGET_NAME) !== -1) target = comp.layer(p);
    }
    if (!flag || !target) { alert('Nie znaleziono'); app.endUndoGroup(); return; }

    // Wyczysc rotation
    var rotProp = flag.property('Rotation');
    while (rotProp.numKeys > 0) { rotProp.removeKey(1); }
    try { rotProp.expression = ''; } catch(e) {}

    // Expression — flaga jest dzieckiem samolotu
    // Rotation flagi w world = rot_local + rot_parent (lub auto-orient)
    // Auto-orient daje kierunek z velocity
    // Aby flaga byla pozioma w world: rot_local = -world_rot_parent
    //
    // velocityAtTime zwraca wektor predkosci - to dokladnie auto-orient angle
    // jezeli samolot ma keyframy + auto-orient, velocity dziala.
    // jezeli tylko keyframy bez auto-orient, parent.rotation jest 0 i flaga juz nie powinna sie obracac
    //
    // Bezpieczne expression: kompensuj WSZYSTKO co rotuje samolot

    var expr =
        '// Kompensuj rotacje rodzica (samolot) zeby flaga byla zawsze pozioma w world space\n' +
        'var pl = thisLayer.parent;\n' +
        'var rotSum = 0;\n' +
        'if (pl) {\n' +
        '  rotSum += pl.transform.rotation;\n' +
        '  // Jezeli auto-orient along path - dodaj kat z velocity\n' +
        '  try {\n' +
        '    var v = pl.transform.position.velocityAtTime(time);\n' +
        '    if (length(v) > 0.001) {\n' +
        '      rotSum += Math.atan2(v[1], v[0]) * 180 / Math.PI;\n' +
        '    }\n' +
        '  } catch(e) {}\n' +
        '}\n' +
        '-rotSum;';

    rotProp.expression = expr;

    app.endUndoGroup();
    alert('Expression rotacji dodany. Flaga powinna byc zawsze pozioma.');
})();
