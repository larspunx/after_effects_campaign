/**
 * Wyrównuje średnią prędkość WSZYSTKICH samolotów w Main_Comp.
 * Działa na istniejących warstwach — niczego nie kasuje, nie tworzy.
 *
 * Co robi dla każdej warstwy zaczynającej się na "PLANE":
 *   1) sampluje istniejącą trasę (Position) i liczy jej długość w pikselach
 *   2) ustawia czas lotu = długość / SPEED (taki sam dla wszystkich)
 *   3) środkowe keyframe'y → roving (AE rozkłada je równo wzdłuż krzywej)
 *   4) skrajne keyframe'y → linear ease + linear interp (bez przyspieszeń)
 *   5) skaluje keyframe'y Opacity proporcjonalnie do nowego czasu
 *   6) dopasowuje outPoint warstwy do nowego końca lotu
 *
 * File > Scripts > Run Script File...
 */

(function setUniformPlaneSpeed() {
    var SPEED = 220; // px/s w przestrzeni kompozycji — zmień i odpal ponownie jeśli chcesz inną

    app.beginUndoGroup("Uniform Plane Speed");

    var proj = app.project;

    function logEarly(msg) {
        try {
            var lf = new File("/Users/mac/tsg/AfterEffects/Scripts/_set_uniform_plane_speed.log");
            lf.open("w"); lf.writeln(msg); lf.close();
        } catch (e) {}
    }

    // Znajdź każdą kompozycję która ma warstwę zaczynającą się od "PLANE"
    var compsWithPlanes = [];
    for (var i = 1; i <= proj.numItems; i++) {
        var it = proj.item(i);
        if (!(it instanceof CompItem)) continue;
        for (var lj = 1; lj <= it.numLayers; lj++) {
            if (it.layer(lj).name.indexOf("PLANE") === 0) {
                compsWithPlanes.push(it);
                break;
            }
        }
    }
    if (!compsWithPlanes.length) {
        var allComps = [];
        for (var ci = 1; ci <= proj.numItems; ci++) {
            if (proj.item(ci) instanceof CompItem) allComps.push(proj.item(ci).name);
        }
        logEarly("Nie znaleziono żadnej kompozycji z warstwą PLANE*. Dostepne kompy: " + allComps.join(", "));
        app.endUndoGroup();
        return;
    }

    function sampleLength(prop, t0, t1, samples) {
        var prev = prop.valueAtTime(t0, false);
        var total = 0;
        for (var s = 1; s <= samples; s++) {
            var t = t0 + (t1 - t0) * (s / samples);
            var cur = prop.valueAtTime(t, false);
            var dx = cur[0] - prev[0];
            var dy = cur[1] - prev[1];
            total += Math.sqrt(dx * dx + dy * dy);
            prev = cur;
        }
        return total;
    }

    function rescaleKeys(prop, oldStart, oldEnd, newStart, newEnd) {
        // Czytamy wszystkie keyframe'y, usuwamy, dodajemy w przeskalowanych czasach.
        var oldDur = oldEnd - oldStart;
        var newDur = newEnd - newStart;
        if (oldDur <= 0) return;

        var keys = [];
        for (var k = 1; k <= prop.numKeys; k++) {
            keys.push({ t: prop.keyTime(k), v: prop.keyValue(k) });
        }
        for (var rk = prop.numKeys; rk >= 1; rk--) prop.removeKey(rk);
        for (var nk = 0; nk < keys.length; nk++) {
            var ratio = (keys[nk].t - oldStart) / oldDur;
            prop.setValueAtTime(newStart + ratio * newDur, keys[nk].v);
        }
    }

    var processed = [];
    var skipped = [];

    for (var ci2 = 0; ci2 < compsWithPlanes.length; ci2++) {
        var comp = compsWithPlanes[ci2];

        for (var li = 1; li <= comp.numLayers; li++) {
            var layer = comp.layer(li);
            if (layer.name.indexOf("PLANE") !== 0) continue;

            var pos = layer.property("Position");
            if (!pos || pos.numKeys < 2) { skipped.push(comp.name + "/" + layer.name + " (brak keyframe'ów)"); continue; }

            var tStart = pos.keyTime(1);
            var tEnd   = pos.keyTime(pos.numKeys);
            var lenPx  = sampleLength(pos, tStart, tEnd, 100);
            if (lenPx <= 0) { skipped.push(comp.name + "/" + layer.name + " (zerowa trasa)"); continue; }

            var newDur = lenPx / SPEED;
            var newEnd = tStart + newDur;

            rescaleKeys(pos, tStart, tEnd, tStart, newEnd);

            for (var ki = 1; ki <= pos.numKeys; ki++) pos.setSpatialAutoBezierAtKey(ki, true);
            for (var rkk = 2; rkk <= pos.numKeys - 1; rkk++) pos.setRovingAtKey(rkk, true);

            var linEase = [new KeyframeEase(0, 33.33)];
            pos.setTemporalEaseAtKey(1, linEase, linEase);
            pos.setTemporalEaseAtKey(pos.numKeys, linEase, linEase);
            pos.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
            pos.setInterpolationTypeAtKey(pos.numKeys, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);

            var op = layer.property("Opacity");
            if (op && op.numKeys >= 2) rescaleKeys(op, tStart, tEnd, tStart, newEnd);

            if (layer.outPoint !== newEnd + 0.1) layer.outPoint = newEnd + 0.1;

            processed.push(
                comp.name + "/" + layer.name + ": " +
                lenPx.toFixed(0) + "px → " +
                newDur.toFixed(2) + "s (" +
                tStart.toFixed(2) + "→" + newEnd.toFixed(2) + ")"
            );
        }
    }

    app.endUndoGroup();

    // Loguj do pliku zamiast alert() — alert blokuje UI gdy skrypt odpalony przez AppleScript
    try {
        var log = new File("/Users/mac/tsg/AfterEffects/Scripts/_set_uniform_plane_speed.log");
        log.open("w");
        log.writeln("SPEED: " + SPEED + " px/s");
        log.writeln("Processed (" + processed.length + "):");
        for (var pi = 0; pi < processed.length; pi++) log.writeln("  " + processed[pi]);
        log.writeln("Skipped (" + skipped.length + "):");
        for (var si = 0; si < skipped.length; si++) log.writeln("  " + skipped[si]);
        log.close();
    } catch (e) {}
})();
