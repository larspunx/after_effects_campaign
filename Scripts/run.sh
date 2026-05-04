#!/usr/bin/env bash
# Uruchamia JSX w działającej instancji Adobe After Effects (macOS).
#
# Wymagania:
#   1) AE musi być otwarty (najlepiej z campaing1.aep)
#   2) AE: Preferences → Scripting & Expressions →
#      "Allow Scripts to Write Files and Access Network"
#
# Użycie:
#   bash Scripts/run.sh add_plane_path.jsx           # alerty wyłączone (cichy)
#   bash Scripts/run.sh add_plane_path.jsx --alerts  # alerty włączone (debug)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <script.jsx> [--alerts]" >&2
  exit 1
fi

INPUT="$1"
ALERTS="${2:-}"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ "$INPUT" = /* ]]; then
  SCRIPT_PATH="$INPUT"
else
  SCRIPT_PATH="$SCRIPTS_DIR/$INPUT"
fi

[[ -f "$SCRIPT_PATH" ]] || { echo "Nie znaleziono pliku: $SCRIPT_PATH" >&2; exit 1; }

APP_NAME=""
for v in 2026 2025 2024; do
  if [[ -d "/Applications/Adobe After Effects $v" ]]; then
    APP_NAME="Adobe After Effects $v"
    break
  fi
done
[[ -n "$APP_NAME" ]] || { echo "Nie znaleziono Adobe After Effects." >&2; exit 1; }

# Tryb cichy/alerty: tworzymy mały loader, który evalFile()-uje
# oryginalny skrypt. Dzięki temu wewnątrz docelowego skryptu
# $.fileName wskazuje na ORYGINALNĄ ścieżkę (a nie na temp).
TMP="$(mktemp -t aescript).jsx"
trap 'rm -f "$TMP"' EXIT

if [[ "$ALERTS" == "--alerts" ]]; then
  ALERT_LINE=""
else
  ALERT_LINE="alert = function(){};"
fi

# Escape backslashes and double quotes in path for safe embedding in JSX string.
ESCAPED_PATH="${SCRIPT_PATH//\\/\\\\}"
ESCAPED_PATH="${ESCAPED_PATH//\"/\\\"}"

cat > "$TMP" <<EOF_LOADER
${ALERT_LINE}
try {
    \$.evalFile(new File("${ESCAPED_PATH}"));
} catch (e) {
    \$.writeln("[run.sh] Skrypt rzucił wyjątek: " + e.toString());
    try { alert("Błąd skryptu:\n" + e.toString()); } catch (_) {}
}
try { if (app.project.file) app.project.save(); } catch(e) {}
EOF_LOADER

RUN_PATH="$TMP"

echo "Uruchamiam: $(basename "$SCRIPT_PATH") w $APP_NAME"

osascript <<EOF
with timeout of 600 seconds
    tell application "$APP_NAME"
        activate
        DoScriptFile "$RUN_PATH"
    end tell
end timeout
EOF

echo "Gotowe."
