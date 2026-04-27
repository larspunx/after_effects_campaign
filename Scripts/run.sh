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

# Tryb cichy: prepend "alert = function(){}" przed właściwym JSX,
# i append "app.project.save()" — zabezpieczenie przed crashem AE.
if [[ "$ALERTS" == "--alerts" ]]; then
  TMP="$(mktemp -t aescript).jsx"
  trap 'rm -f "$TMP"' EXIT
  {
    cat "$SCRIPT_PATH"
    printf '\ntry { if (app.project.file) app.project.save(); } catch(e) {}\n'
  } > "$TMP"
  RUN_PATH="$TMP"
else
  TMP="$(mktemp -t aescript).jsx"
  trap 'rm -f "$TMP"' EXIT
  {
    printf 'alert = function(){};\n'
    cat "$SCRIPT_PATH"
    printf '\ntry { if (app.project.file) app.project.save(); } catch(e) {}\n'
  } > "$TMP"
  RUN_PATH="$TMP"
fi

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
