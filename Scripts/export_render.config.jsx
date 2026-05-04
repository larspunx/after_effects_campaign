/**
 * Konfiguracja eksportu animacji.
 * Edytuj wartości poniżej. Ten plik jest wczytywany przez export_render.jsx.
 *
 * UWAGA: To jest plik .jsx (a nie .json), bo ExtendScript w AE
 * nie ma natywnego JSON.parse. Wystarczy edytować wartości — składnia JS.
 */

var EXPORT_CONFIG = {

    // ── KOMPOZYCJA ─────────────────────────────────────────────────────────
    // Nazwa kompozycji do renderu. null = aktywna kompozycja (otwarta w viewer).
    // Można też podać tablicę nazw: ["Main_Comp", "Intro", "Outro"]
    compName: "Main_Comp",

    // ── ŚCIEŻKA WYJŚCIOWA ──────────────────────────────────────────────────
    // Folder docelowy. ~ = home użytkownika. Folder zostanie utworzony jeśli nie istnieje.
    outputDir: "~/Desktop/AE_Renders",

    // Wzorzec nazwy pliku (BEZ rozszerzenia). Dostępne tagi:
    //   [compName]  → nazwa kompozycji
    //   [date]      → YYYY-MM-DD
    //   [time]      → HH-MM-SS
    //   [project]   → nazwa pliku .aep (bez rozszerzenia)
    fileNamePattern: "[project]_[compName]_[date]_[time]",

    // ── FORMAT ─────────────────────────────────────────────────────────────
    // Dostępne wartości:
    //   "h264"     → MP4 / H.264 (wymaga useAME = true; nowe AE nie ma H.264 lokalnie)
    //   "prores"   → QuickTime ProRes 422 HQ (.mov) — master file, duża jakość
    //   "lossless" → AE Lossless (.mov, Animation codec)
    //   "png_seq"  → sekwencja PNG (16-bit z alfą)
    format: "h264",

    // Wyślij do Adobe Media Encoder zamiast lokalnego Render Queue.
    // ZALECANE = true dla "h264" (lokalny RQ nie obsługuje już H.264).
    // Dla "prores"/"lossless"/"png_seq" można zostawić false (renderuje AE).
    useAME: true,

    // Po wysłaniu do AME — od razu startuj kolejkę (true) czy tylko dodaj (false).
    ameStartRender: true,

    // ── USTAWIENIA RENDERU ────────────────────────────────────────────────
    renderSettings: {
        // "Best Settings" / "Draft Settings" / "DV Settings" / "Multi-Machine Settings"
        template: "Best Settings",

        // null = pełny zakres komp; true = renderuj tylko Work Area
        useWorkArea: false
    },

    // ── ZACHOWANIE ────────────────────────────────────────────────────────
    // Wyczyść istniejące wpisy w Render Queue przed dodaniem nowych
    // (tylko te, które nie są w trakcie renderu / nie są zakończone)
    cleanQueueBefore: false,

    // Pokaż alert z podsumowaniem po zakończeniu konfiguracji
    showSummary: true
};
