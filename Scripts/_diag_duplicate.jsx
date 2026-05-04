(function () {
    app.beginUndoGroup("Diag duplicate");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { app.endUndoGroup(); return; }

    var selected = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).selected) selected.push(comp.layer(i));
    }

    var nameMap = {};
    var pairs   = [];

    for (var s = 0; s < selected.length; s++) {
        var orig = selected[s];
        var dup  = orig.duplicate();
        nameMap[orig.name] = dup.name;
        pairs.push({ orig: orig, dup: dup });
        orig.selected = false;
        dup.selected  = true;
    }

    // Zbuduj mapę jako string do debugowania
    var mapStr = "";
    for (var k in nameMap) {
        if (nameMap.hasOwnProperty(k)) mapStr += '"' + k + '" → "' + nameMap[k] + '" | ';
    }

    var props = ["Position", "Scale", "Rotation", "Anchor Point", "Opacity"];

    for (var p2 = 0; p2 < pairs.length; p2++) {
        var orig2 = pairs[p2].orig;
        var dup2  = pairs[p2].dup;

        var diagLines = ["MAP: " + mapStr];

        // Przywróć parent
        if (orig2.parent) {
            var parentName    = orig2.parent.name;
            var newParentName = nameMap[parentName] || parentName;
            diagLines.push("parent: " + parentName + " → " + newParentName);
            try {
                for (var li = 1; li <= comp.numLayers; li++) {
                    if (comp.layer(li).name === newParentName && comp.layer(li) !== dup2) {
                        dup2.parent = comp.layer(li);
                        break;
                    }
                }
            } catch (e) { diagLines.push("parent ERR: " + e); }
        } else {
            diagLines.push("parent: none");
        }

        // Podmień referencje w expressionach
        for (var pi = 0; pi < props.length; pi++) {
            var origProp = orig2.property(props[pi]);
            var dupProp  = dup2.property(props[pi]);
            if (!origProp || !dupProp) continue;
            if (!origProp.expressionEnabled || !origProp.expression) continue;

            var expr = origProp.expression;
            diagLines.push("EXPR_BEFORE [" + props[pi] + "]: " + expr.substring(0, 80));

            for (var oldName in nameMap) {
                if (!nameMap.hasOwnProperty(oldName)) continue;
                expr = expr.split('"' + oldName + '"').join('"' + nameMap[oldName] + '"');
                expr = expr.split("'" + oldName + "'").join("'" + nameMap[oldName] + "'");
            }

            diagLines.push("EXPR_AFTER [" + props[pi] + "]: " + expr.substring(0, 80));

            try {
                dupProp.expression = expr;
                diagLines.push("SET OK");
            } catch (e) {
                diagLines.push("SET ERR: " + e);
            }
        }

        dup2.comment = diagLines.join(" ## ");
    }

    app.endUndoGroup();
})();
