(function() {
    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }

    var target = null, flag = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        if (comp.layer(p).name.indexOf('1_PLANE_df_przechwyc_B') !== -1) target = comp.layer(p);
        if (comp.layer(p).name.indexOf('1_flag_GR') !== -1) flag = comp.layer(p);
    }

    var t = comp.time;
    var info = '== DIAGNOSTYKA ==\n\n';
    info += 'Czas: ' + t + '\n\n';

    info += 'FLAGA: ' + (flag ? flag.name : 'BRAK') + '\n';
    if (flag) {
        info += '  Position: ' + flag.property('Position').valueAtTime(t, false) + '\n';
        info += '  Position expr: ' + flag.property('Position').expression + '\n';
        info += '  Position expr enabled: ' + flag.property('Position').expressionEnabled + '\n';
        info += '  Parent: ' + (flag.parent ? flag.parent.name : 'NONE') + '\n';
        info += '  Visible: ' + flag.enabled + '\n';
        info += '  inPoint: ' + flag.inPoint + '\n';
        info += '  outPoint: ' + flag.outPoint + '\n';
    }

    info += '\nSAMOLOT: ' + (target ? target.name : 'BRAK') + '\n';
    if (target) {
        info += '  Position: ' + target.property('Position').valueAtTime(t, false) + '\n';
        info += '  Parent: ' + (target.parent ? target.parent.name : 'NONE') + '\n';
        info += '  inPoint: ' + target.inPoint + '\n';
        info += '  outPoint: ' + target.outPoint + '\n';
    }

    alert(info);
})();
