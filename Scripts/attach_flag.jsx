/**
 * UNIWERSALNY SKRYPT — Przypina flagę do dowolnego obiektu
 *
 * KROKI UŻYCIA:
 * 1. Ustaw flagę RĘCZNIE w timeline tam gdzie ma być względem obiektu
 *    (przesuń, przeskaluj, ustaw rozmiar — jak chcesz)
 * 2. Edytuj sekcję KONFIGURACJA poniżej (tylko 2 nazwy warstw)
 * 3. Uruchom skrypt
 *
 * Skrypt:
 * - Zachowuje OBECNĄ pozycję, skalę i rozmiar flagi
 * - Ustawia ten sam parent co obiekt
 * - Dodaje expression żeby flaga podążała za obiektem
 * - Wymusza rotację = 0 (zawsze pozioma)
 */

(function attachFlag() {
    app.beginUndoGroup('Attach Flag');

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║                     KONFIGURACJA                                 ║
    // ╚══════════════════════════════════════════════════════════════════╝

    var FLAG_NAME   = '1_flag_GR';
    var TARGET_NAME = '1_PLANE_df_przechwyc_B';

    // ╚══════════════════════════════════════════════════════════════════╝

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).name === 'Main_Comp') { comp = app.project.item(i); break; }
    }
    if (!comp) { alert('Nie znaleziono Main_Comp'); app.endUndoGroup(); return; }

    var target = null, flag = null;
    for (var p = 1; p <= comp.numLayers; p++) {
        if (comp.layer(p).name.indexOf(TARGET_NAME) !== -1) target = comp.layer(p);
        if (comp.layer(p).name.indexOf(FLAG_NAME)   !== -1) flag   = comp.layer(p);
    }
    if (!target) { alert('Nie znaleziono obiektu: ' + TARGET_NAME); app.endUndoGroup(); return; }
    if (!flag)   { alert('Nie znaleziono flagi: '   + FLAG_NAME);   app.endUndoGroup(); return; }

    // Wyczysc stare expressions
    try { flag.property('Position').expression = ''; } catch(e) {}
    try { flag.property('Rotation').expression = ''; } catch(e) {}

    var t = comp.time;

    // Zapamietaj OBECNA pozycje flagi (recznie ustawiona przez uzytkownika)
    var flagPosBefore = flag.property('Position').valueAtTime(t, false);

    // Ustaw flage z tym samym parentem co obiekt (ta sama przestrzen wspolrzednych)
    flag.parent = target.parent;

    // Wymus zachowanie pozycji po zmianie parenta
    flag.property('Position').setValue(flagPosBefore);

    // Oblicz offset miedzy flaga a obiektem w tej samej przestrzeni
    var targetPos = target.property('Position').valueAtTime(t, false);
    var flagPos   = flag.property('Position').valueAtTime(t, false);
    var offsetX = flagPos[0] - targetPos[0];
    var offsetY = flagPos[1] - targetPos[1];

    // Rotacja = 0 — flaga zawsze pozioma
    var rotProp = flag.property('Rotation');
    while (rotProp.numKeys > 0) { rotProp.removeKey(1); }
    rotProp.setValue(0);

    // Position expression — flaga podaza za obiektem zachowujac offset
    var posProp = flag.property('Position');
    while (posProp.numKeys > 0) { posProp.removeKey(1); }
    posProp.expression =
        'var t = thisComp.layer("' + TARGET_NAME + '");\n' +
        'var p = t.transform.position;\n' +
        '[p[0] + (' + offsetX.toFixed(2) + '), p[1] + (' + offsetY.toFixed(2) + ')];';

    app.endUndoGroup();
    alert(
        'Gotowe!\n\n' +
        'Flaga: '   + FLAG_NAME + '\n' +
        'Obiekt: '  + TARGET_NAME + '\n' +
        'Offset zachowany: ' + offsetX.toFixed(0) + ', ' + offsetY.toFixed(0) + '\n\n' +
        'Aby zmienic pozycje recznie:\n' +
        '1. Wylacz expression na Position (kliknij ikone zegara obok Position)\n' +
        '2. Przesun flage w nowe miejsce\n' +
        '3. Uruchom ten skrypt ponownie — offset sie zaktualizuje'
    );
})();
