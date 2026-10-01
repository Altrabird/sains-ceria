#!/bin/sh
# Test a game, and only if every check passes: build its APK + the web dist and commit.
# Usage: sh tools/ship.sh <game-id> "<commit message>"
set -e
id=$1; msg=$2
out=$(cd "games/$id" && PYTHONIOENCODING=utf-8 python tools/test_game.py 2>&1) || true
echo "$out" | grep -E "FAIL|failed:|Error" | tail -5
echo "$out" | grep -q "failed: none" || { echo "NOT SHIPPED: tests failed"; exit 1; }
python tools/build.py apk "$id" | tail -1
python tools/build.py web
git add -A
git commit -q -m "$msg" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline -1
