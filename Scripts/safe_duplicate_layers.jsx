(function () {
    app.beginUndoGroup("Safe duplicate layers");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) { app.endUndoGroup(); return; }

    // Zbierz zaznaczone warstwy
    var selected = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).selected) selected.push(comp.layer(i));
    }
    if (selected.length === 0) { app.endUndoGroup(); return; }

    // Duplikuj wszystkie, zbierz mapę: stara nazwa → nowa nazwa
    var nameMap = {};
    var pairs = [];

    for (var s = 0; s < selected.length; s++) {
        var orig = selected[s];
        var dup  = orig.duplicate();
        nameMap[orig.name] = dup.name;
        pairs.push({ orig: orig, dup: dup });
        orig.selected = false;
        dup.selected  = true;
    }

    // Dla każdego duplikatu: podmień referencje w expressionach
    // i przywróć parent
    var props = ["Position", "Scale", "Rotation", "Anchor Point", "Opacity"];

    for (var p2 = 0; p2 < pairs.length; p2++) {
        var orig2 = pairs[p2].orig;
        var dup2  = pairs[p2].dup;

        // Przywróć parent — jeśli parent był w zestawie kopiowanych, wskaż na nowy
        if (orig2.parent) {
            var parentName = orig2.parent.name;
            var newParentName = nameMap[parentName] || parentName;
            try {
                for (var li = 1; li <= comp.numLayers; li++) {
                    if (comp.layer(li).name === newParentName && comp.layer(li) !== dup2) {
                        dup2.parent = comp.layer(li);
                        break;
                    }
                }
            } catch (e) {}
        }

        // Podmień nazwy warstw w expressionach na nowe duplikaty
        for (var pi = 0; pi < props.length; pi++) {
            var origProp = orig2.property(props[pi]);
            var dupProp  = dup2.property(props[pi]);
            if (!origProp || !dupProp) continue;
            if (!origProp.expressionEnabled || !origProp.expression) continue;

            var expr = origProp.expression;

            // Podmień każdą referencję do starych nazw na nowe
            for (var oldName in nameMap) {
                if (!nameMap.hasOwnProperty(oldName)) continue;
                var newName = nameMap[oldName];
                // Zamień thisComp.layer("stara_nazwa") → thisComp.layer("nowa_nazwa")
                expr = expr.split('"' + oldName + '"').join('"' + newName + '"');
                expr = expr.split("'" + oldName + "'").join("'" + newName + "'");
            }

            try {
                dupProp.expression = expr;
            } catch (e) {}
        }
    }

    app.endUndoGroup();
})();
