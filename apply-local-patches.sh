#!/usr/bin/env bash
set -euo pipefail

cd /Volumes/MACSSD/DATA/CODE/PROXYKEYS/bedolaga-cabinet

if [ ! -f .env ]; then
  cat > .env <<'ENVEOF'
VITE_API_URL=/api
VITE_TELEGRAM_BOT_USERNAME=proxykeysbot
VITE_APP_NAME=ProxyKeys
VITE_APP_LOGO=PK
VITE_FORCE_TELEGRAM_DEEPLINK_AUTH=true
ENVEOF
else
  grep -q '^VITE_FORCE_TELEGRAM_DEEPLINK_AUTH=' .env \
    && sed -i '' 's/^VITE_FORCE_TELEGRAM_DEEPLINK_AUTH=.*/VITE_FORCE_TELEGRAM_DEEPLINK_AUTH=true/' .env \
    || echo 'VITE_FORCE_TELEGRAM_DEEPLINK_AUTH=true' >> .env
fi

python3 - <<'PY'
from pathlib import Path

p = Path("src/components/TelegramLoginButton.tsx")
s = p.read_text(encoding="utf-8")

env_block = """  const forceDeepLinkMode =
    String(import.meta.env.VITE_FORCE_TELEGRAM_DEEPLINK_AUTH ?? '').toLowerCase() === 'true' &&
    !isOIDC;
"""

hardcoded = "  const forceDeepLinkMode = !isOIDC;\n"

if hardcoded in s:
    s = s.replace(hardcoded, env_block, 1)
    p.write_text(s, encoding="utf-8")
    print("Replaced hardcoded forceDeepLinkMode with env-based variant")
    raise SystemExit(0)

if env_block in s:
    print("Env-based patch already applied")
    raise SystemExit(0)

replacements = [
(
"""  const botUsername =
    widgetConfig?.bot_username || import.meta.env.VITE_TELEGRAM_BOT_USERNAME || '';
  const isOIDC = Boolean(widgetConfig?.oidc_enabled && widgetConfig?.oidc_client_id);
""",
"""  const botUsername =
    widgetConfig?.bot_username || import.meta.env.VITE_TELEGRAM_BOT_USERNAME || '';
  const isOIDC = Boolean(widgetConfig?.oidc_enabled && widgetConfig?.oidc_client_id);

  const forceDeepLinkMode =
    String(import.meta.env.VITE_FORCE_TELEGRAM_DEEPLINK_AUTH ?? '').toLowerCase() === 'true' &&
    !isOIDC;
"""
),
(
"""  useEffect(() => {
    if (scriptFailed && !deepLinkToken && !deepLinkPolling) {
""",
"""  useEffect(() => {
    if ((forceDeepLinkMode || scriptFailed) && !deepLinkToken && !deepLinkPolling) {
"""
),
(
"""  }, [scriptFailed, deepLinkToken, deepLinkPolling, startDeepLinkAuth]);
""",
"""  }, [forceDeepLinkMode, scriptFailed, deepLinkToken, deepLinkPolling, startDeepLinkAuth]);
"""
),
(
"""  useEffect(() => {
    if (isOIDC || !containerRef.current || !botUsername || !widgetConfig) return;
""",
"""  useEffect(() => {
    if (isOIDC || forceDeepLinkMode || !containerRef.current || !botUsername || !widgetConfig) return;
"""
),
(
"""  }, [isOIDC, botUsername, widgetConfig, loginWithTelegramWidget, navigate, handleScriptFailed]);
""",
"""  }, [isOIDC, forceDeepLinkMode, botUsername, widgetConfig, loginWithTelegramWidget, navigate, handleScriptFailed]);
"""
),
(
"""  if (scriptFailed) {
""",
"""  if (forceDeepLinkMode || scriptFailed) {
"""
),
]

for old, new in replacements:
    if old not in s:
        raise SystemExit(f"Pattern not found:\\n{old}")
    s = s.replace(old, new, 1)

p.write_text(s, encoding="utf-8")
print("Applied fresh env-based patch")
PY
