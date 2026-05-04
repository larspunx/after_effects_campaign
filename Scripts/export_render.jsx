/**
 * Eksport animacji — dodaje kompozycję(e) do Render Queue lub wysyła do AME.
 * Konfigurację edytuj w pliku: export_render.config.jsx (obok tego pliku).
 *
 * Użycie:
 *   File > Scripts > Run Script File... → wybierz export_render.jsx
 *   lub: bash Scripts/run.sh export_render.jsx
 *
 * Wymagania:
 *   - Otwarty projekt AE
 *   - Preferences → Scripting & Expressions → "Allow Scripts to Write Files..."
 *   - Dla format="h264" + useAME=true → Adobe Media Encoder zainstalowany
 */

(function exportRender() {

    // ── 0. LOG (do pliku obok skryptu, na potrzeby diagnostyki) ───────────
    var scriptFile = new File($.fileName);
    var logFile = new File(scriptFile.parent.fsName + "/export_render.log");
    function log(msg) {
        try {
            logFile.open("a");
            logFile.writeln("[" + new Date().toString() + "] " + msg);
            logFile.close();
        } catch (e) {}
    }
    try { logFile.remove(); } catch (e) {}
    log("=== START ===");

    // ── 1. WCZYTAJ KONFIGURACJĘ ───────────────────────────────────────────
    var configFile = new File(scriptFile.parent.fsName + "/export_render.config.jsx");

    if (!configFile.exists) {
        log("ERROR: brak configa: " + configFile.fsName);
        alert("Brak pliku konfiguracji:\n" + configFile.fsName);
        return;
    }
    $.evalFile(configFile);

    if (typeof EXPORT_CONFIG === "undefined") {
        log("ERROR: EXPORT_CONFIG niezdefiniowane");
        alert("Plik konfiguracji nie zdefiniował zmiennej EXPORT_CONFIG.");
        return;
    }
    var cfg = EXPORT_CONFIG;
    log("Config wczytany. compName=" + cfg.compName + " format=" + cfg.format + " useAME=" + cfg.useAME);

    // ── 2. WALIDACJA PROJEKTU ─────────────────────────────────────────────
    if (!app.project) {
        log("ERROR: brak projektu");
        alert("Brak otwartego projektu.");
        return;
    }
    log("Projekt: " + (app.project.file ? app.project.file.fsName : "(unsaved)") + ", items=" + app.project.numItems);

    // ── 3. ZNAJDŹ KOMPOZYCJE DO RENDERU ───────────────────────────────────
    var comps = resolveComps(cfg.compName);
    log("Znaleziono kompozycji: " + comps.length);
    if (comps.length === 0) {
        var allComps = listAllComps();
        log("Dostępne kompozycje: " + allComps.join(", "));
        alert("Nie znaleziono kompozycji do renderu.\n\n" +
              "Szukano: " + cfg.compName + "\n\n" +
              "Dostępne kompozycje w projekcie:\n" + (allComps.length ? allComps.join("\n") : "(brak)"));
        return;
    }

    // ── 4. PRZYGOTUJ FOLDER WYJŚCIOWY ─────────────────────────────────────
    // Folder w ExtendScript natywnie obsługuje ~ jako home użytkownika.
    var outFolder = new Folder(cfg.outputDir);
    log("Output folder: " + outFolder.fsName + " (exists=" + outFolder.exists + ")");
    if (!outFolder.exists) {
        if (!outFolder.create()) {
            log("ERROR: nie udało się utworzyć folderu");
            alert("Nie udało się utworzyć folderu:\n" + outFolder.fsName);
            return;
        }
        log("Folder utworzony.");
    }

    // ── 5. CZYSZCZENIE KOLEJKI (opcjonalne) ───────────────────────────────
    if (cfg.cleanQueueBefore) {
        cleanRenderQueue();
    }

    // ── 6. DODAJ KAŻDĄ KOMP DO RENDER QUEUE ───────────────────────────────
    app.beginUndoGroup("Export Render");

    var added = [];
    var errors = [];

    for (var i = 0; i < comps.length; i++) {
        try {
            var info = addCompToQueue(comps[i], cfg, outFolder);
            added.push(info);
            log("Dodano do RQ: " + info.compName + " -> " + info.fileName);
        } catch (e) {
            errors.push(comps[i].name + ": " + e.toString());
            log("ERROR przy dodaniu " + comps[i].name + ": " + e.toString());
        }
    }

    app.endUndoGroup();

    // ── 7. WYŚLIJ DO AME (jeśli włączone) ─────────────────────────────────
    if (cfg.useAME && added.length > 0) {
        try {
            app.project.renderQueue.queueInAME(!!cfg.ameStartRender);
            log("Wysłano do AME (start=" + cfg.ameStartRender + ")");
        } catch (e) {
            errors.push("Wysyłka do AME: " + e.toString());
            log("ERROR AME: " + e.toString());
        }
    }
    log("=== END ===");

    // ── 8. PODSUMOWANIE ───────────────────────────────────────────────────
    if (cfg.showSummary) {
        var msg = "Eksport skonfigurowany.\n\n";
        msg += "Format: " + cfg.format + (cfg.useAME ? "  (przez AME)" : "  (lokalny RQ)") + "\n";
        msg += "Folder: " + outFolder.fsName + "\n\n";

        msg += "Dodane do kolejki (" + added.length + "):\n";
        for (var j = 0; j < added.length; j++) {
            msg += "  • " + added[j].compName + "  →  " + added[j].fileName + "\n";
        }
        if (errors.length > 0) {
            msg += "\nBŁĘDY:\n";
            for (var k = 0; k < errors.length; k++) msg += "  ! " + errors[k] + "\n";
        }
        if (!cfg.useAME) {
            msg += "\nKliknij 'Render' w panelu Render Queue, aby uruchomić.";
        }
        alert(msg);
    }


    // ═════════════════════════════════════════════════════════════════════
    // FUNKCJE POMOCNICZE
    // ═════════════════════════════════════════════════════════════════════

    function resolveComps(spec) {
        var result = [];

        if (spec === null || spec === undefined) {
            var active = app.project.activeItem;
            if (active && active instanceof CompItem) result.push(active);
            return result;
        }

        var names = (spec instanceof Array) ? spec : [spec];
        for (var i = 0; i < names.length; i++) {
            var c = findCompByName(names[i]);
            if (c) result.push(c);
        }
        return result;
    }

    function findCompByName(name) {
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (it instanceof CompItem && it.name === name) return it;
        }
        return null;
    }

    function listAllComps() {
        var out = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (it instanceof CompItem) out.push(it.name);
        }
        return out;
    }

    function pad2(n) { return n < 10 ? "0" + n : "" + n; }

    function buildFileName(pattern, comp) {
        var d = new Date();
        var date = d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
        var time = pad2(d.getHours()) + "-" + pad2(d.getMinutes()) + "-" + pad2(d.getSeconds());

        var projectName = "untitled";
        if (app.project.file) {
            projectName = app.project.file.name.replace(/\.aep$/i, "");
        }

        return pattern
            .replace(/\[compName\]/g, sanitize(comp.name))
            .replace(/\[date\]/g, date)
            .replace(/\[time\]/g, time)
            .replace(/\[project\]/g, sanitize(projectName));
    }

    function sanitize(s) {
        return String(s).replace(/[\\\/:*?"<>|]/g, "_");
    }

    function extensionFor(format) {
        switch (format) {
            case "h264":     return ".mp4";
            case "prores":   return ".mov";
            case "lossless": return ".mov";
            case "png_seq":  return "_[#####].png";
            default:         return ".mov";
        }
    }

    function omTemplateFor(format) {
        // Nazwy szablonów Output Module w AE.
        // UWAGA: dostępność zależy od wersji AE i lokalizacji.
        switch (format) {
            case "prores":   return "Apple ProRes 422 HQ";
            case "lossless": return "Lossless";
            case "png_seq":  return "PNG Sequence";
            case "h264":     return "Lossless"; // placeholder; AME i tak przekoduje na H.264
            default:         return "Lossless";
        }
    }

    function addCompToQueue(comp, cfg, outFolder) {
        var rqItem = app.project.renderQueue.items.add(comp);

        // Render Settings (template)
        try {
            rqItem.applyTemplate(cfg.renderSettings.template);
        } catch (e) {
            // Fallback: ustaw ręcznie podstawowe parametry
            try { rqItem.setSetting("Quality", "Best"); } catch (_) {}
        }

        // Work Area
        try {
            if (cfg.renderSettings.useWorkArea) {
                rqItem.timeSpanStart = comp.workAreaStart;
                rqItem.timeSpanDuration = comp.workAreaDuration;
            } else {
                rqItem.timeSpanStart = 0;
                rqItem.timeSpanDuration = comp.duration;
            }
        } catch (e) {}

        // Output Module
        var om = rqItem.outputModule(1);
        try {
            om.applyTemplate(omTemplateFor(cfg.format));
        } catch (e) {
            // jeśli template nie istnieje — użyj Lossless
            try { om.applyTemplate("Lossless"); } catch (_) {}
        }

        // Ścieżka pliku
        var baseName = buildFileName(cfg.fileNamePattern, comp);
        var ext = extensionFor(cfg.format);
        var fullPath = outFolder.fsName + "/" + baseName + ext;
        om.file = new File(fullPath);

        return { compName: comp.name, fileName: baseName + ext };
    }

    function cleanRenderQueue() {
        var q = app.project.renderQueue;
        for (var i = q.numItems; i >= 1; i--) {
            var it = q.item(i);
            // RQItemStatus: 3015=QUEUED, 3013=NEEDS_OUTPUT, 3014=UNQUEUED
            // 3018=DONE, 3016=RENDERING, 3017=USER_STOPPED, 3019=ERR_STOPPED
            try {
                if (it.status !== RQItemStatus.RENDERING) it.remove();
            } catch (e) {}
        }
    }

})();
