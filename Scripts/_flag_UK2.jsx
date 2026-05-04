/**
 * Flaga UK2 — śledzi RUCH samolotu RELATYWNIE.
 * Nie zmienia parenta flagi, nie zmienia jej pozycji.
 * Zapamiętuje pozycję samolotu w pierwszej klatce widocznej i dodaje
 * tylko delta ruchu do pozycji flagi.
 */
(function() {
    app.beginUndoGroup('Flag UK2 Relative Track');

    var FLAG_NAME   = '1_flag_UK2';
    var TARGET_NAME = '2_PLANE_bomber';

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

    var t = comp.time;

    // Wyczysc stare expressions
    try { flag.property('Position').expression = ''; } catch(e) {}
    try { flag.property('Rotation').expression = ''; } catch(e) {}

    // ZACHOWAJ ABSOLUTNIE WSZYSTKO — nie ruszamy parenta, pozycji ani skali
    // Tylko dodajemy expression które:
    // - oblicza world pos samolotu w czasie REFERENCYJNYM (teraz)
    // - oblicza world pos samolotu w czasie KAŻDEJ klatki
    // - dodaje DELTĘ do pozycji bazowej flagi

    var basePos = flag.property('Position').valueAtTime(t, false);
    var refTime = t;

    var posExpr =
        'var t = thisComp.layer("' + TARGET_NAME + '");\n' +
        'var refT = ' + refTime + ';\n' +
        'var basePos = [' + basePos[0] + ', ' + basePos[1] + '];\n' +
        'var refWorld = t.toWorld(t.anchorPoint, refT);\n' +
        'var nowWorld = t.toWorld(t.anchorPoint, time);\n' +
        '[basePos[0] + (nowWorld[0] - refWorld[0]),\n' +
        ' basePos[1] + (nowWorld[1] - refWorld[1])];';

    flag.property('Position').expression = posExpr;

    // Rotacja — kompensuje obroty samolotu wzgledem czasu refT
    flag.property('Rotation').setValue(0);
    var rotExpr =
        'var t = thisComp.layer("' + TARGET_NAME + '");\n' +
        'var refT = ' + refTime + ';\n' +
        '\n' +
        'function getAngle(time) {\n' +
        '  var v = t.transform.position.velocityAtTime(time);\n' +
        '  var rot = t.transform.rotation.valueAtTime(time);\n' +
        '  if (length(v) > 0.001) {\n' +
        '    rot += Math.atan2(v[1], v[0]) * 180 / Math.PI;\n' +
        '  }\n' +
        '  return rot;\n' +
        '}\n' +
        '\n' +
        'var refRot = getAngle(refT);\n' +
        'var nowRot = getAngle(time);\n' +
        '-(nowRot - refRot);';

    flag.property('Rotation').expression = rotExpr;

    app.endUndoGroup();
    alert('Flaga UK2 sledzi samolot relatywnie.\nPozycja bazowa zachowana.\nFlaga zawsze pozioma.');
})();
