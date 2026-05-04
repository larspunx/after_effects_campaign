(function () {
    var msg = "ts=" + new Date().toString() +
              " items=" + app.project.numItems +
              " active=" + (app.project.activeItem ? app.project.activeItem.name : "none");
    var cmd = "echo " + JSON.stringify(msg) + " > /tmp/_ae_diag.txt 2>&1";
    var out = "";
    try { out = system.callSystem(cmd); } catch (e) { out = "ERR: " + e; }
    // Also try writing via system.callSystem the layer list
    var layers = "";
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (!(it instanceof CompItem)) continue;
        layers += "\n[" + it.name + "] ";
        for (var li = 1; li <= it.numLayers; li++) {
            layers += it.layer(li).name + " | ";
        }
    }
    var cmd2 = "cat > /tmp/_ae_layers.txt <<'EEE'\n" + layers + "\nEEE\n";
    try { system.callSystem(cmd2); } catch (e) {}
})();
