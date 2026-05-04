(function () {
    app.beginUndoGroup("Optimize render settings");

    // RAM: zostaw 4 GB systemowi, reszta dla AE
    app.preferences.savePrefAsLong(
        "Main Pref Section v2", "Maximum RAM Cache Size (1000s of bytes)",
        PREFType.PREF_Type_MACHINE_INDEPENDENT, 10000);

    // Disk Cache: włącz i ustaw 80 GB
    app.preferences.savePrefAsBool(
        "Disk Cache Preferences", "Disk Cache Enabled",
        PREFType.PREF_Type_MACHINE_SPECIFIC, true);

    app.preferences.savePrefAsLong(
        "Disk Cache Preferences", "Disk Cache Max Size (1000s of bytes)",
        PREFType.PREF_Type_MACHINE_SPECIFIC, 80000000);

    // Render Multiple Frames Simultaneously
    app.preferences.savePrefAsBool(
        "Main Pref Section v2", "Render Multiple Frames Simultaneously",
        PREFType.PREF_Type_MACHINE_INDEPENDENT, true);

    // Wyłącz Motion Blur i Frame Blending globalnie podczas RAM preview
    app.preferences.savePrefAsBool(
        "Main Pref Section", "Enable Adaptive Resolution",
        PREFType.PREF_Type_MACHINE_INDEPENDENT, true);

    app.preferences.savePrefs();
    app.endUndoGroup();
})();
