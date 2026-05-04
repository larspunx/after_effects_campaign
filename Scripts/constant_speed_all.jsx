(function constantSpeedAll() {
    var TARGETS = [
        "1_PLANE_df_przechwyc_A",
        "1_PLANE_df_przechwyc_B",
        "2_PLANE_bomber",
        "3_PLANE_df_przechwyc_bitwa",
        "3_PLANE_df_przechwyc_bitwa_RIGHT",
        "4_PLANE_df_przechwyc_bitwa 2",
        "5_PLANE_bomber 2"
    ];

    app.beginUndoGroup("Constant Speed: all planes");

    function findLayer(name) {
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (!(it instanceof CompItem)) continue;
            for (var li = 1; li <= it.numLayers; li++) {
                if (it.layer(li).name === name) return it.layer(li);
            }
        }
        return null;
    }

    function makeConstantSpeed(layer) {
        var pos = layer.property("Position");
        if (!pos || pos.numKeys < 2) return false;

        for (var ka = 1; ka <= pos.numKeys; ka++) {
            try { pos.setSpatialAutoBezierAtKey(ka, true); } catch (e) {}
        }
        for (var kr = 2; kr <= pos.numKeys - 1; kr++) {
            try { pos.setRovingAtKey(kr, true); } catch (e) {}
        }
        var linEase = [new KeyframeEase(0, 33.33)];
        try {
            pos.setTemporalEaseAtKey(1, linEase, linEase);
            pos.setTemporalEaseAtKey(pos.numKeys, linEase, linEase);
            pos.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
            pos.setInterpolationTypeAtKey(pos.numKeys, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        } catch (e) {}
        return true;
    }

    for (var t = 0; t < TARGETS.length; t++) {
        var L = findLayer(TARGETS[t]);
        if (L) makeConstantSpeed(L);
    }

    app.endUndoGroup();
})();
