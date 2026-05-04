(function () {
    app.beginUndoGroup("Add flag shimmer");

    var TARGET = "flags";
    var found = null;

    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var li = 1; li <= it.numLayers; li++) {
            if (it.layer(li).name === TARGET) {
                found = it.layer(li);
                break;
            }
        }
        if (found) break;
    }
    if (!found) { app.endUndoGroup(); return; }

    // Duplikuj warstwę — shimmer idzie na kopię w trybie Add
    var shimmer = found.duplicate();
    shimmer.name  = TARGET + "_shimmer";
    shimmer.blendingMode = BlendingMode.ADD;
    shimmer.moveAfter(found);

    // Zachowaj parenta z oryginału (duplicate() nie zawsze go kopiuje)
    if (found.parent && !shimmer.parent) {
        shimmer.parent = found.parent;
    }

    // Zachowaj expression na Position jeśli oryginał go ma
    var origPos = found.property("Position");
    var shimPos = shimmer.property("Position");
    if (origPos && origPos.expressionEnabled && origPos.expression) {
        shimPos.expression = origPos.expression;
    }

    // Usuń ewentualne istniejące efekty na kopii
    var fx = shimmer.property("Effects");

    // 1) CC Light Sweep — biała linia sweepuje przez flagę
    var ls = fx.addProperty("CC Light Sweep");
    ls.property("Center").setValue([found.width / 2, found.height / 2]);
    ls.property("Direction").setValue(45);        // kąt diagonalny
    ls.property("Shape").setValue(2);             // Smooth
    ls.property("Width").setValue(40);
    ls.property("Sweep Intensity").setValue(80);
    ls.property("Edge Intensity").setValue(0);
    ls.property("Light Color").setValue([1, 1, 1]);

    // Animacja sweepingu — linia przebiega od lewej do prawej
    var centerProp = ls.property("Center");
    var t0    = found.startTime;
    var cycle = 2.0; // czas jednego przejścia (s)

    centerProp.setValueAtTime(t0,          [-found.width * 0.3,  found.height / 2]);
    centerProp.setValueAtTime(t0 + cycle,  [ found.width * 1.3,  found.height / 2]);

    // Loop expression — shimmer się powtarza
    centerProp.expression =
        "var cycle = " + cycle + ";\n" +
        "var t = (time - " + t0 + ") % cycle;\n" +
        "var ratio = t / cycle;\n" +
        "var w = thisComp.layer(\"" + TARGET + "\").width;\n" +
        "var h = thisComp.layer(\"" + TARGET + "\").height;\n" +
        "[w * (-0.3 + 1.6 * ratio), h / 2]";

    // 2) Glow na shimmerze żeby był bardziej świecący
    var glow = fx.addProperty("Glow");
    if (glow) {
        glow.property("Glow Threshold").setValue(30);
        glow.property("Glow Radius").setValue(15);
        glow.property("Glow Intensity").setValue(1.5);
    }

    app.endUndoGroup();
})();
