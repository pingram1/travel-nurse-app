#!/usr/bin/env bash
# Mitigate iCloud Desktop "Optimize Mac Storage" eviction without relocating the repo.
#
# What this does:
# 1. Pins the project (same xattr as Finder → Keep Downloaded)
# 2. Asks iCloud to materialize tracked source/config files
# 3. Restores any zero-byte tracked files from the last git commit
#
# One-time Finder tip (most reliable):
#   Right-click this folder in Finder → Keep Downloaded
#
# Usage: npm run pin:local

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PIN_XATTR='com.apple.fileprovider.pinned#PX'
# Finder "Keep Downloaded" stores the ASCII byte "1" (0x31).
PIN_VALUE='1'

pin_path() {
  local path="$1"
  if [[ ! -e "$path" ]]; then
    return 0
  fi
  # -w writes a string; matches File Provider pin semantics used by Finder.
  xattr -w "$PIN_XATTR" "$PIN_VALUE" "$path" 2>/dev/null || true
}

echo "==> Pinning repo against iCloud eviction (Keep Downloaded xattr)"
pin_path "$ROOT"
# Pin high-churn trees so eviction prefers other Desktop clutter first.
for path in app src scripts __tests__ package.json package-lock.json tsconfig.json \
  babel.config.js jest.config.js metro.config.js tailwind.config.js .eslintrc.js; do
  pin_path "$ROOT/$path"
done

echo "==> Requesting local materialization"
if command -v brctl >/dev/null 2>&1 && brctl 2>&1 | grep -q download; then
  # Prefer file-level download; folder-level is flaky on some macOS versions.
  git ls-files -z -- 'app' 'src' 'scripts' '__tests__' '*.json' '*.js' '*.ts' '*.tsx' '*.md' \
    | while IFS= read -r -d '' file; do
        [[ -e "$file" ]] || continue
        brctl download "$ROOT/$file" 2>/dev/null || true
      done
else
  # Touch + open for reading forces File Provider to hydrate placeholders.
  git ls-files -z -- 'app' 'src' 'scripts' '__tests__' \
    | while IFS= read -r -d '' file; do
        [[ -f "$file" ]] || continue
        # Reading one byte is enough to trigger download of dataless files.
        dd if="$file" of=/dev/null bs=1 count=1 status=none 2>/dev/null || true
      done
fi

echo "==> Scanning tracked files for empty/evicted content"
empty_files=()
while IFS= read -r -d '' file; do
  [[ -f "$file" ]] || continue
  # Skip intentionally empty keep files if any appear later.
  case "$file" in
    *.gitkeep | */.gitkeep) continue ;;
  esac
  size="$(wc -c <"$file" | tr -d '[:space:]')"
  if [[ "$size" -eq 0 ]]; then
    empty_files+=("$file")
  fi
done < <(git ls-files -z)

if [[ ${#empty_files[@]} -eq 0 ]]; then
  echo "OK: no empty tracked files."
  echo
  echo "If files go empty again: run npm run pin:local, or Finder → Keep Downloaded on this folder."
  echo "Longer-term: turn off Optimize Mac Storage, or move the repo off Desktop/iCloud."
  exit 0
fi

echo "Found ${#empty_files[@]} empty tracked file(s); restoring from git HEAD..."
printf '  - %s\n' "${empty_files[@]}"
git checkout -- "${empty_files[@]}"

still_empty=()
for file in "${empty_files[@]}"; do
  size="$(wc -c <"$file" | tr -d '[:space:]')"
  if [[ "$size" -eq 0 ]]; then
    still_empty+=("$file")
  else
    pin_path "$ROOT/$file"
  fi
done

if [[ ${#still_empty[@]} -gt 0 ]]; then
  echo "ERROR: still empty after restore (not in git or both sides empty):"
  printf '  - %s\n' "${still_empty[@]}"
  echo "Recover with: git checkout HEAD -- <file>  or restore from remote."
  exit 1
fi

echo "Restored and re-pinned ${#empty_files[@]} file(s)."
