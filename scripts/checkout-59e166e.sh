#!/usr/bin/env sh
set -euo pipefail

TARGET="59e166e"
BRANCH_NAME=${1:-"restore-59e166e"}

if git cat-file -e "$TARGET^{commit}" >/dev/null 2>&1; then
  echo "[info] Found commit $TARGET locally. Checking out branch $BRANCH_NAME..."
  git checkout -B "$BRANCH_NAME" "$TARGET"
  exit 0
fi

REMOTE_URL=${REMOTE_URL:-$(git config --get remote.origin.url || true)}
if [ -z "$REMOTE_URL" ]; then
  echo "[error] Commit $TARGET is not present locally and no remote URL is configured."
  echo "Configure a remote (git remote add origin <url>) or set REMOTE_URL to a repository that contains the commit."
  exit 1
fi

echo "[info] Fetching commit $TARGET from $REMOTE_URL ..."
git fetch "$REMOTE_URL" "$TARGET"
echo "[info] Checking out branch $BRANCH_NAME at $TARGET ..."
git checkout -B "$BRANCH_NAME" "$TARGET"
