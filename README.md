# After Effects — Projekt Animacji

**Rozdzielczość:** 1920 × 1080 (Full HD)  
**FPS:** 60  
**Czas trwania:** 30 sekund  
**Typ:** Animacja / Motion Graphics

---

## Struktura folderów

```
AfterEffects/
├── Assets/
│   ├── Audio/       ← pliki dźwiękowe (.wav, .mp3, .aiff)
│   ├── Footage/     ← klipy wideo do importu
│   ├── Images/      ← grafiki, PNG, PSD, AI
│   └── Fonts/       ← czcionki używane w projekcie
├── Exports/         ← gotowe renderingi
├── Project/         ← plik .aep After Effects
└── Scripts/
    └── setup_project.jsx  ← skrypt konfiguracyjny
```

---

## Jak uruchomić skrypt

1. Otwórz **After Effects**
2. Z menu: **File → Scripts → Run Script File...**
3. Wybierz plik `Scripts/setup_project.jsx`
4. Skrypt automatycznie:
   - Tworzy kompozycję `Main_Comp` (1920×1080, 60fps, 30s)
   - Dodaje foldery w panelu Project
   - Dodaje solid tła i null obiekt CONTROLLER
   - Otwiera kompozycję gotową do pracy

---

## Zalecany workflow

1. Uruchom skrypt → zapisz projekt w `Project/` jako `.aep`
2. Importuj zasoby do odpowiednich folderów w Assets/
3. Przeciągaj materiały do `Main_Comp` lub twórz precompy w `_Comps/Precomps`
4. Renderuj przez **File → Export → Add to Adobe Media Encoder Queue** do `Exports/`

---

## Skróty klawiszowe (AE)

| Akcja | Skrót |
|---|---|
| Odtwórz / Stop | `Space` |
| RAM Preview | `0` (num) |
| Nowa kompozycja | `Ctrl/Cmd + N` |
| Importuj pliki | `Ctrl/Cmd + I` |
| Keyframe pozycji | `P` → `Shift+P`+kliknij zegarek |
| Wyrenderuj | `Ctrl/Cmd + M` |
