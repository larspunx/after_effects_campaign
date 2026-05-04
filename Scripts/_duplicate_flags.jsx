(function() {
    app.beginUndoGroup('Duplicate Flags To Battle Planes');

    var SOURCE_FLAG = '1_flag_UK';
    var SOURCE_PLANE = '1_PLANE_df_przechwyc_A';
    var TARGETS = [
        { plane: '3_PLANE_df_przechwyc_bitwa_RIGHT', flagName: '3_flag_RIGHT' },
        { plane: '3_PLANE_df_przechwyc_bitwa',       flagName: '3_flag_LEFT'  }
    ];

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }
    if (!comp) { alert('Brak Main_Comp'); app.endUndoGroup(); return; }

    // Znajdz oryginalna flage UK i samolot A — z nich zczytamy parametry
    var srcFlag = null, srcPlane = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        if (comp.layer(p).name === SOURCE_FLAG)  srcFlag  = comp.layer(p);
        if (comp.layer(p).name === SOURCE_PLANE) srcPlane = comp.layer(p);
    }
    if (!srcFlag || !srcPlane) {
        alert('Nie znaleziono ' + SOURCE_FLAG + ' lub ' + SOURCE_PLANE);
        app.endUndoGroup(); return;
    }

    // Pobierz offset oryginalnej flagi UK wzgledem samolotu A
    // (oba sa w tej samej przestrzeni — maja ten sam parent)
    var t = comp.time;
    var srcFlagPos  = srcFlag.property('Position').valueAtTime(t, false);
    var srcPlanePos = srcPlane.property('Position').valueAtTime(t, false);
    var offsetX = srcFlagPos[0] - srcPlanePos[0];
    var offsetY = srcFlagPos[1] - srcPlanePos[1];

    // Pobierz skale i rotation expression (dla referencji)
    var srcScale = srcFlag.property('Scale').valueAtTime(t, false);

    var added = [];

    for (var i2 = 0; i2 < TARGETS.length; i2++) {
        var cfg = TARGETS[i2];

        // Znajdz docelowy samolot
        var targetPlane = null;
        for (var p2 = 1; p2 <= comp.numLayers; p2++) {
            if (comp.layer(p2).name === cfg.plane) { targetPlane = comp.layer(p2); break; }
        }
        if (!targetPlane) {
            added.push('BRAK SAMOLOTU: ' + cfg.plane);
            continue;
        }

        // Sprawdz czy flaga juz istnieje — usun
        for (var d = comp.numLayers; d >= 1; d--) {
            if (comp.layer(d).name === cfg.flagName) { comp.layer(d).remove(); }
        }

        // Zduplikuj oryginalna flage
        srcFlag.selected = true;
        // Reset selekcji innych warstw
        for (var s = 1; s <= comp.numLayers; s++) {
            if (comp.layer(s).name !== SOURCE_FLAG) comp.layer(s).selected = false;
        }
        app.executeCommand(2080); // Duplicate
        var newFlag = comp.layer(1); // duplikat trafia na top

        newFlag.name = cfg.flagName;

        // Wyczysc expressions z duplikatu
        try { newFlag.property('Position').expression = ''; } catch(e) {}
        try { newFlag.property('Rotation').expression = ''; } catch(e) {}
        try { newFlag.property('Scale').expression = ''; } catch(e) {}

        // Wyczysc keyframy
        var nfPos = newFlag.property('Position');
        while (nfPos.numKeys > 0) { nfPos.removeKey(1); }
        var nfRot = newFlag.property('Rotation');
        while (nfRot.numKeys > 0) { nfRot.removeKey(1); }
        var nfSc = newFlag.property('Scale');
        while (nfSc.numKeys > 0) { nfSc.removeKey(1); }

        // Ustaw skale taka sama jak oryginal
        nfSc.setValue(srcScale);

        // Parent = parent samolotu (ta sama przestrzen)
        newFlag.parent = targetPlane.parent;

        // Pozycja — wyliczona przez expression bedzie ustawiona automatycznie
        // ale ustawmy jakies wartosci poczatkowe
        var tPos = targetPlane.property('Position').valueAtTime(t, false);
        nfPos.setValue([tPos[0] + offsetX, tPos[1] + offsetY]);

        // Position expression — sledzi swoj samolot z offsetem
        nfPos.expression =
            'var t = thisComp.layer("' + cfg.plane + '");\n' +
            'var p = t.transform.position;\n' +
            '[p[0] + (' + offsetX.toFixed(2) + '), p[1] + (' + offsetY.toFixed(2) + ')];';

        // Rotation expression — kompensuje rotacje samolotu
        nfRot.setValue(0);
        nfRot.expression =
            'var pl = thisComp.layer("' + cfg.plane + '");\n' +
            'var rotSum = 0;\n' +
            'if (pl) {\n' +
            '  rotSum += pl.transform.rotation;\n' +
            '  try {\n' +
            '    var v = pl.transform.position.velocityAtTime(time);\n' +
            '    if (length(v) > 0.001) {\n' +
            '      rotSum += Math.atan2(v[1], v[0]) * 180 / Math.PI;\n' +
            '    }\n' +
            '  } catch(e) {}\n' +
            '}\n' +
            '-rotSum;';

        added.push(cfg.flagName + ' -> ' + cfg.plane);
    }

    app.endUndoGroup();
    alert('Dodano flagi:\n\n' + added.join('\n') + '\n\nOffset zachowany: ' + offsetX.toFixed(0) + ', ' + offsetY.toFixed(0) + '\nMechanika identyczna jak flaga UK.');
})();
