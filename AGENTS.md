У меня есть сервер с Debian 12, на который установлена панель Remnawave и сервера с установленными на них нодами и подключенными к этой панели
вот ссылка на Overview документации Remnawave
https://docs.rw/docs/overview/introduction/

также у меня установлена 
https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot
https://docs.bedolagam.ru/

```markdown
# ProxyKeys Cabinet — Frontend Development Guide

## Что это

Личный кабинет VPN-сервиса ProxyKeys. Форк [bedolaga-cabinet](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet) (React + Vite + TypeScript + TailwindCSS), кастомизированный под бренд ProxyKeys.

Backend — Bedolaga Telegram Bot (Python/FastAPI), работает на сервере панели `193.23.197.134`, API доступен локально через SSH-туннель.

## Git-структура

- **origin** → `github.com/proxykeys/bedolaga-cabinet` (наш форк)
- **upstream** → `github.com/BEDOLAGA-DEV/bedolaga-cabinet` (оригинал)
- **Рабочая ветка** → `custom-ui`
- **Стратегия обновлений** → `git rebase upstream/main` (пересадка наших коммититов поверх свежего upstream)

## Dev-стенд

```bash
# Терминал A — SSH-туннель к backend API
ssh -N -L 8080:127.0.0.1:18080 root@193.23.197.134

# Терминал B — Vite dev server
nvm use
npm run dev
```

- Frontend: `http://localhost:5173`
- API proxied: `localhost:5173/api/*` → `localhost:8080` → SSH → `193.23.197.134:18080`
- Login page: `http://localhost:5173/login`

## Переменные окружения

`.env.local` (не коммитится):
```env
VITE_API_URL=/api
VITE_TELEGRAM_BOT_USERNAME=proxykeysbot
VITE_APP_NAME=ProxyKeys
VITE_APP_LOGO=PK
VITE_FORCE_TELEGRAM_DEEPLINK_AUTH=true
```

## Архитектура авторизации

В кабинете работает два режима входа через Telegram:

1. **Telegram OIDC** (primary) — через `oauth.telegram.org/js/telegram-login.js`
2. **Deep-link fallback** — если OIDC-скрипт заблокирован РКН/ТСПУ (частый сценарий в РФ)

Патч `VITE_FORCE_TELEGRAM_DEEPLINK_AUTH=true` форсирует deep-link fallback, когда OIDC недоступен. Применяется через `apply-local-patches.sh` к `src/components/TelegramLoginButton.tsx`.

Также доступна авторизация по Email + Password (через SMTP2GO, домен `proxykeys.net`).

## Домены Production

| Домен | Назначение |
|---|---|
| `my.proxykeys.net` | Cabinet (этот frontend) |
| `hooks.proxykeys.net` | Telegram webhook + платежные webhook'и |
| `sub.proxykeys.net` | Страница подписок Remnawave |
| `rw.proxykeys.com` | Панель Remnawave |
| `grafana.proxykeys.com` | Grafana мониторинг |

Все домены за Cloudflare Proxy (orange cloud) + Authenticated Origin Pulls (mTLS).

## Правила разработки

### Что МОЖНО трогать свободно

- Любые файлы в `public/` (логотипы, иконки, favicon)
- `src/styles/` — CSS/Tailwind overrides
- `.env.local` и `.env.proxykeys.example`
- `apply-local-patches.sh`
- Новые файлы (новые компоненты, утилиты, страницы)

### Что трогать АККУРАТНО (минимум правок)

- Существующие upstream-компоненты — только если без этого никак (логика, не визуал)
- `src/components/TelegramLoginButton.tsx` — патч применяется скриптом, ручные правки допустимы

### Что НЕЛЬЗЯ трогать

- `package.json` / `package-lock.json` (кроме добавления новых зависимостей)
- `Dockerfile` / `docker-compose.yml` (меняется только при deployment)
- `nginx.conf`
- `.github/workflows/` (CI/CD пайплайны upstream)

### Принцип минимизации конфликтов

Каждая кастомизация должна быть отдельным git-коммитом. При обновлении upstream применяется `git rebase upstream/main`. Чем меньше upstream-файлов изменено — тем меньше конфликтов.

Предпочтительный подход:
1. **CSS/Tailwind overrides** в отдельных файлах, не редактировать upstream-компоненты для смены цветов
2. **Брендинг** через env-переменные и файлы в `public/`
3. **Логика** — точечные минимальные патчи upstream-кодов

### Коммит-конвенция для selective rebase

Чтобы при обновлении upstream можно было выборочно сохранять одни свои коммиты и отбрасывать другие, соблюдай правила:

**Префиксы коммитов:**
- `feat(ui-preview):` — изменения в `/dev/ui-preview` (можно всегда сохранить)
- `chore(branding):` — CSS/брендинг ProxyKeys
- `chore(patch):` — патчи upstream-файлов (TelegramLoginButton и т.д.)
- `feat(custom):` — новые кастомные страницы/компоненты

**Золотые правила:**
1. **Один коммит = одна логическая задача.** Не смешивать ui-preview и брендинг в одном коммите.
2. **Новые файлы (`src/dev/`, `src/styles/`) НИКОГДА не конфликтуют** при rebase — git просто создаёт их заново.
3. **`src/App.tsx` — единственный upstream-файл, который правит ui-preview** (22 строки, 3 аддитивные точки). Конфликты здесь локальные и легко разрешаются: оставить оба варианта (upstream + свой).
4. **Перед rebase делай backup:** `git branch backup-before-rebase`
5. **Selective rebase через `git rebase -i upstream/main`:** замени `pick` на `drop` для коммитов, которые не нужны.

**Процедура обновления upstream:**
```bash
git fetch upstream
git rebase -i upstream/main
# В редакторе: pick нужные, drop ненужные
# Разрешить конфликты в App.tsx (если есть) — оставить оба
npm run type-check && npm run lint && npm run dev
# Проверить /dev/ui-preview
git push origin custom-ui --force-with-lease
git branch -D backup-before-rebase  # если всё ок
```

## Стек

- React 19 + TypeScript
- Vite 6
- TailwindCSS + PostCSS
- i18next (RU/EN)
- Zustand (state)
- React Query / TanStack Query
- React Router
- axios
- Recharts (графики)
- qrcode.react

## Команды

```bash
npm run dev       # dev-сервер (localhost:5173)
npm run build     # production-сборка в dist/
npm run lint      # ESLint
npm run preview   # предпросмотр production-сборки
```

## Production Deployment

Frontend собирается в Docker, статики копируются в `/srv/cabinet` на сервере панели. Раздаётся через Caddy:

```caddyfile
https://my.proxykeys.net {
    import cf-origin-auth
    encode gzip zstd

    handle /api/* {
        uri strip_prefix /api
        reverse_proxy * http://bot:8080
    }

    handle {
        root * /srv/cabinet
        try_files {path} /index.html
        file_server
    }
}
```