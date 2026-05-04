(function () {
    var msgs = [];
    msgs.push("ts=" + new Date().toString());
    msgs.push("fileName=" + $.fileName);
    msgs.push("app=" + (typeof app !== "undefined" ? "OK" : "MISSING"));
    msgs.push("project=" + (app.project ? "OK ("+app.project.numItems+" items)" : "MISSING"));
    if (app.project) {
        msgs.push("file=" + (app.project.file ? app.project.file.fsName : "(unsaved)"));
        msgs.push("activeItem=" + (app.project.activeItem ? app.project.activeItem.name : "(none)"));
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            msgs.push("item["+i+"]="+it.name+" ("+it.typeName+")");
        }
    }

    // Sprawdź preferencję bezpieczeństwa skryptów
    try {
        var pref = app.preferences.getPrefAsLong(
            "Main Pref Section",
            "Pref_SCRIPTING_FILE_NETWORK_SECURITY",
            PREFType.PREF_Type_MACHINE_INDEPENDENT);
        msgs.push("scripting_file_security_pref=" + pref + " (1=enabled)");
    } catch (e) {
        msgs.push("scripting_pref_error=" + e.toString());
    }

    var content = msgs.join("\n");

    // Zapis przez system.callSystem - omija ewentualne sandbox AE
    var safe = content.replace(/'/g, "'\\''");
    var cmd = "/bin/sh -c 'cat > /tmp/_ae_diag.txt' <<< '" + safe + "'";
    // bez heredoc - prościej:
    var cmd2 = "echo " + JSON.stringify(content).replace(/`/g, "\\`") + " > /tmp/_ae_diag.txt";
    var out;
    try {
        out = system.callSystem(cmd2);
    } catch (e) {
        out = "callSystem ERR: " + e.toString();
    }

    // Spróbuj też File.write() z odpowiednim encoding
    try {
        var f = new File("/tmp/_ae_diag2.txt");
        f.encoding = "UTF-8";
        f.lineFeed = "Unix";
        if (f.open("w")) {
            f.write(content);
            f.close();
        }
    } catch (e) {
        out += "\nFile.write ERR: " + e.toString();
    }

    alert("DIAG:\n\n" + content + "\n\n--- callSystem out ---\n" + (out || "(empty)"));
})();
