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

## Текущие версии (обновление 2026-08-08)

| Компонент | Версия | Образ / ветка |
|---|---|---|
| **Remnawave Panel** | 3.2.1 | `remnawave/backend:3` |
| **Bedolaga Bot** | 4.0.0 | `main` branch (git) |
| **Cabinet Frontend** | 1.65.0 | `custom-ui` branch |
| **Remnawave Node** | 2.8.0 (pinned) | `remnawave/node:2.8.0` |
| **Subscription Page** | latest | `remnawave/subscription-page:latest` |
| **Panel DB** | PostgreSQL 17.6 | `postgres:17.6` |
| **Panel Cache** | Valkey 9 | `valkey/valkey:9-alpine` (Unix socket) |

**⚠️ Нода pinned на 2.8.0** — Node v3.0.0 содержит Xray v26.7.28 с багом REALITY (зависание TCP-сокетов под нагрузкой) и ломает совместимость с mihomo/sing-box. Обновлять ноду до v3 только после фикса Xray upstream.

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

### Синхронизация документации и патчей

При каждом изменении, затрагивающем кастомизации ProxyKeys (новая фича,
правка бизнес-логики, изменение UI/бота), **обязательно** поддерживай в
актуальном состоянии три артефакта:

1. **`custom.patch` на сервере** (`/opt/remnawave/bedolaga/`):
   ```bash
   cd /opt/remnawave/bedolaga/bot-src && git diff > ../custom.patch
   cp ../custom.patch ../custom-before-<feature>.patch  # обязательный backup
   ```
   Нужно, если изменён Python-код бота / локали / `.env`. Не нужно при
   правках только фронтенда кабинета.

2. **Документ ProxyBook** (`/Volumes/MACSSD/DATA/CODE/PROXYKEYS/ProxyBook/`):
   - Создай/обнови `Bedolaga<FeatureName>.md` с описанием: что изменено,
     какие файлы, почему, как деплоить, как проверить.
   - Добавь ссылку в `ProxyBook/README.md` → индекс «Подробный Setup Runbook».

3. **`AGENTS.md`** (этот файл):
   - Обнови таблицу «ProxyKeys Custom Features» (коммит + краткое описание).
   - При изменении сервера/DB/тарифа — обнови «Server & DB» и «Backend (Bot) Integration».
   - При изменении бизнес-модели — обнови «Бизнес-модель ProxyKeys».

**Цель:** чистая установка или обновление Bedolaga (upstream) не должна
привести к потере знаний. Любой новый диалог (сессия) должен иметь полную
картину из `AGENTS.md` + ProxyBook, без необходимости читать git log.

## ProxyKeys Custom Features

Все фичи задеплоены в продакшн. Каждая — отдельный коммит на `custom-ui`.

| Фича | Коммит | Описание |
|---|---|---|
| Device count selector | `49c8daf7` + `44e46528` | Выбор кол-ва устройств при покупке тарифа (device_price_kopeks × extra × months); восстановлен после rebase-регрессии e47838b6 |
| No-manual-renewal | `b40095ec` | Активные подписки не продлеваются вручную — только автопродление с баланса |
| Autopay info block | `7a68f6f3` | Стоимость автопродления на странице подписки |
| Unlimited model | `cedd1d33` | Удаление traffic/servers/unlimited UI (все тарифы `traffic_limit_gb=0`) |
| Trial device selector | `2905e92d` | Trial не помечает тариф как `is_current` → селектор устройств работает |
| Merge home=subscription | `73826366` | Главная страница = страница подписки (`/` = `<Subscription/>`) |
| Bot device stepper | bot custom.patch | Меню «Изменить устройства» в боте = степпер `[−] +N [+]` как в вебе (`chgdev:*`), отдельный экран уменьшения лимита |

Подробная документация: см. ProxyBook (секция ниже).

## Бизнес-модель ProxyKeys

- **Single-tariff**: один активный тариф (id=3, «ProxyKeys Subscription»). `MULTI_TARIFF_ENABLED` не установлен.
- **Unlimited traffic**: все тарифы `traffic_limit_gb=0`, включая trial (`TRIAL_TRAFFIC_LIMIT_GB=0`).
- **Device pricing**: `device_price_kopeks=4800` (48₽ за доп. устройство, обновлено 2026-08-22). Базовое `device_limit=1`, `max_device_limit=15` (единый потолок для веба и бота).
- **No-manual-renewal**: активная (non-trial, non-expired) подписка не продлевается вручную. Продление — только автопродление с баланса (`autopay`). Истёкшая — повторная покупка через каталог.
- **Trial → fresh purchase**: trial-подписка не помечает тариф `is_current=True` → покупка открывается как fresh purchase с селектором устройств.

## Backend (Bot) Integration

Бот (Bedolaga Telegram Bot v4.0.0) работает на сервере `193.23.197.134`. Все ProxyKeys-патчи бота собраны в `custom.patch` на сервере.

**⚠️ Bot v4.0.0 breaking change**: переходит на Remnawave Panel v3 API (numeric user IDs вместо UUID). При запуске выполняет автоматический бэкфил UUID→numeric. Старые JWT-токены (UUID-based) невалидны — нужны новые, подписанные `APP_SECRET` панели v3.

### Патчи бота

- **Расположение**: `/opt/remnawave/bedolaga/custom.patch` (~1400 строк, 22 файлов исходного кода; `locales/` volume-mount файлы исключены)
- **Backup'ы**: `/opt/remnawave/bedolaga/custom-before-*.patch` (снапшоты перед каждым этапом)
- **Применение**: `cd /opt/remnawave/bedolaga/bot-src && git diff HEAD > ../custom.patch` (регенерация)

### Ключевые патчи бота

| Файл | Что изменено |
|---|---|
| `.env` | `TRIAL_TRAFFIC_LIMIT_GB=0`, `DEFAULT_AUTOPAY_DAYS_BEFORE=1`, `DEFAULT_AUTOPAY_ENABLED=false`, `REMNAWAVE_API_KEY` (v3 JWT), `TRAFFIC_EXCLUDED_USER_IDS` (вместо `_UUIDS`), `AVAILABLE_LANGUAGES=ru` (один язык кабинета/бота — переключатель в хедере кабинета скрывается сам при ≤1 языке; backup `.env.backup-before-single-lang-*`) |
| `app/cabinet/routes/subscription_modules/purchase.py` | Trial → `is_current=False`; no-manual-renewal guard (409); device_count validation + pricing |
| `app/cabinet/routes/subscription_modules/renewal.py` | No-manual-renewal guard (409 для активных) |
| `app/handlers/subscription/purchase.py` | No-manual-renewal guard; traffic/servers убраны из шаблонов |
| `app/handlers/subscription/tariff_purchase.py` | Device selector (`get_tariff_device_keyboard`, `format_device_purchase_preview`, `tariff_dev:` handler); single-tariff auto-select; «❌ Отмена» back buttons |
| `app/handlers/subscription/my_subscriptions.py` | Traffic display + кнопка [📊 Трафик] убраны; «Автоплатеж»→«Автопродление» |
| `app/handlers/subscription/devices.py` | Device stepper в боте как в вебе (`chgdev:`/`chgdevred`/`chgdevr:`): докупка [−] +N [+] с живой ценой + отдельный экран уменьшения; исполнение через существующие `confirm/execute_change_devices` |
| `app/utils/device_price.py` | Новый файл: `calculate_device_topup_price()` — цена докупки, зеркалит `/devices/price` кабинета (пророт по days_left, бесплатные в пределах тарифа, скидка PricingEngine) |
| `app/handlers/subscription/purchase.py` | No-manual-renewal guard; traffic/servers убраны из шаблонов; регистрация степпер-хендлеров `chgdev*` |
| `app/handlers/subscription/autopay.py` | «Автоплатеж» → «Автопродление», согласование «включено/выключено»; фикс-текст (дни/период не настраиваются) |
| `app/keyboards/inline.py` | Скрыт [Продлить] для активных; скрыт [Тариф]; скрыты [Настроить дни] + [Период продления]; `pack_buttons_in_rows()` (фикс обрезки кнопок) |
| `app/localization/locales/{ru,en,fa,zh,ua}.json` | SUBSCRIPTION_*_TEMPLATE без traffic/servers; ключи `CHGDEV_*` (степпер устройств, ru/en) |

### Деплой бота

```bash
# Пересборка при изменении кода
cd /opt/remnawave/bedolaga/bot-src
docker compose up -d --build bot

# Только локали (без пересборки) — КРИТИЧЕСКИ ВАЖНО:
rm -f locales/*.json && docker restart remnawave_bot
```

### Процедура обновления upstream (обязательная)

При обновлении **любого** из двух слоёв (бот ИЛИ кабинет) кастомизации могут потеряться: bot — через `git stash pop` (теряются целые файлы), кабинет — через `git rebase` (теряются отдельные коммиты). Для защиты используются скрипты верификации.

Подробный runbook: [ProxyBook/BedolagaPatchVerification.md](../ProxyBook/BedolagaPatchVerification.md)

#### Бот (backend)

Скрипт: `/opt/remnawave/bedolaga/verify-patches.sh` (на сервере)

```bash
cd /opt/remnawave/bedolaga/bot-src

# 1. snapshot ДО pull — MANDATORY
../verify-patches.sh snapshot

# 2. update
git stash
git pull origin main
git stash pop

# 3. check ПОСЛЕ stash pop — MANDATORY (exit 1 = стоп, восстанавливать из snapshot)
../verify-patches.sh check

# 4. пересборка
docker compose up -d --build bot

# 5. регенерация custom.patch
git diff HEAD > ../custom.patch

# 6. offsite backup
scp root@193.23.197.134:/opt/remnawave/bedolaga/custom.patch \
    /Volumes/MACSSD/DATA/CODE/PROXYKEYS/ProxyBook/patches/custom.patch

# 7. cleanup (retain last 5 pre-update snapshots)
../verify-patches.sh cleanup
```

#### Кабинет (frontend)

Скрипт: `ProxyBook/scripts/verify-rebase.sh` (локально, macOS)

```bash
cd /Volumes/MACSSD/DATA/CODE/PROXYKEYS/bedolaga-cabinet

# 1. snapshot ДО rebase — MANDATORY (создаёт backup ветку + manifest)
/Volumes/MACSSD/DATA/CODE/PROXYKEYS/ProxyBook/scripts/verify-rebase.sh snapshot

# 2. rebase
git fetch upstream
git rebase -i upstream/main

# 3. check ПОСЛЕ rebase — MANDATORY (exit 1 = стоп, восстанавливать из backup ветки)
/Volumes/MACSSD/DATA/CODE/PROXYKEYS/ProxyBook/scripts/verify-rebase.sh check

# 4. применить локальные патчи (TelegramLoginButton.tsx) — MANDATORY
bash apply-local-patches.sh

# 5. проверить
npm run type-check && npm run lint && npm run dev
# → открыть /dev/ui-preview и проверить

# 6. cleanup (после успешной проверки)
/Volumes/MACSSD/DATA/CODE/PROXYKEYS/ProxyBook/scripts/verify-rebase.sh cleanup
```

**Золотое правило:** ни одно обновление upstream не выполняется без шагов `snapshot` + `check`. Если `check` сообщает потери — обновление не считается завершённым, потерянные патчи восстанавливаются из snapshot/backup.

### КРИТИЧНО: stale `locales/` volume override

`docker-compose.yml` монтирует `./locales:/app/locales:rw`. После `git pull` или правки локалей **обязательно**:
```bash
rm -f locales/*.json && docker restart remnawave_bot
```
Иначе бот использует устаревшие локали из volume.

### Регенерация API-токенов (Panel v3)

Токены — JWT, подписанные `APP_SECRET` панели (не старым `JWT_API_TOKENS_SECRET`). Генерация:

```bash
docker exec remnawave node -e "
const jwt = require('jsonwebtoken');
const secret = process.env.APP_SECRET;
const token = jwt.sign(
  { uuid: '<token-uuid>', username: null, role: 'API' },
  secret,
  { expiresIn: '36500d', issuer: 'remnawave' }
);
console.log(token);
"
```

UUID токена берётся из таблицы `api_tokens` (поле `uuid`). Получить список:
```bash
docker exec remnawave-db psql -U postgres -d postgres -c "SELECT uuid, name FROM api_tokens;"
```

Новый токен нужно прописать в `.env` бота (`REMNAWAVE_API_KEY`) и в `.env` панели (`REMNAWAVE_API_TOKEN` для subscription page), затем пересоздать контейнеры.

## Server & DB

- **Сервер**: `193.23.197.134` (Debian 12)
- **SSH**: `ssh root@193.23.197.134`
- **Panel**: `remnawave` (`remnawave/backend:3`, healthcheck: `docker ps --filter name=remnawave`)
- **Panel DB**: PostgreSQL 17.6 — `docker exec remnawave-db psql -U postgres -d postgres`
- **Panel Redis**: Valkey 9 (Unix socket) — `docker exec remnawave-redis valkey-cli -s /var/run/valkey/valkey.sock ping`
- **Bot DB**: PostgreSQL 15 — `docker exec remnawave_bot_db psql -U remnawave_user -d remnawave_bot`
- **Bot container**: `remnawave_bot` (healthcheck: `docker ps --filter name=remnawave_bot`)
- **Node**: `3-DE-001` — `remnawave/node:2.8.0` (pinned, `ssh 3-DE-001`)
- **Test user**: panel id=36 (telegram_id=185929880, bot user id=14)
- **Test trial user**: panel id=37 (bot user id=16, trial, tariff_id=3)
- **Active tariff**: id=3 «ProxyKeys Subscription» (device_limit=1, device_price_kopeks=4800, max_device_limit=15, traffic_limit_gb=0, is_active=t, period_prices={"30":4800})
- **Inactive tariff**: id=1 «Стандартный» (is_active=f)
- **Bot env**: `SALES_MODE=tariffs`, `MULTI_TARIFF_ENABLED` не установлен
- **Backups**: `/opt/backups/` (panel-db-pre-v3.sql, bot-db-pre-v4.sql, configs)

## ProxyBook (документация)

Подробная документация всех кастомизаций — в `/Volumes/MACSSD/DATA/CODE/PROXYKEYS/ProxyBook/`:

| Документ | Тема |
|---|---|
| `BedolagaNoManualRenewal.md` | No-manual-renewal + autopay + button-packing |
| `BedolagaUnlimitedCleanup.md` | Удаление traffic/servers/unlimited UI |
| `BedolagaTrialDeviceSelector.md` | Trial device selector fix (`is_current`) |
| `BedolagaTariffWeb.md` | Single-tariff auto-select, device selector |
| `BedolagaTariff.md` | Кастомизация тарифа (бот) |
| `BedolagaMergeHomeSubscription.md` | Объединение главной = подписка |
| `BedolagaV3Upgrade.md` | Обновление Remnawave 2→3 + Bot 3.62→4.0 + Cabinet 1.63→1.65 |
| `BedolagaCabinetDeploy.md` | Деплой кабинета custom-ui на прод + инцидент 2026-08-22 (пропавший device selector) |
| `BedolagaDeviceStepperBot.md` | Степпер устройств в боте как в вебе (`chgdev:*`) |
| `BedolagaBotUpdate410.md` | Runbook обновления Bot 4.0.0 → 4.1.0 (ПЛАН, выполнение после ~2026-09-03) |
| `BedolagaDev.md` | Кастомизация кабинета (общее) |
| `BedolagaSetup.md` | Установка Bedolaga |

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
npm run lint      # Biome lint
npm run check     # Biome check (lint + format)
npm run test      # vitest (unit tests)
npm run preview   # предпросмотр production-сборки
```

## Production Deployment

**Прод = custom-ui** (с 2026-08-22; до этого — vanilla 1.65.0 с V3-апгрейда 2026-08-08, что и вызвало потерю device selector — см. ProxyBook/BedolagaCabinetDeploy.md).

Сервер: `/opt/remnawave/bedolaga/cabinet-src` — ветка `custom-ui` из remote `fork` (github.com/proxykeys/bedolaga-cabinet); `origin` = upstream BEDOLAGA-DEV. Infra-моды (`VITE_FORCE_TELEGRAM_DEEPLINK_AUTH` в Dockerfile/docker-compose.yml) живут как незакоммиченные правки поверх ветки; патч TelegramLoginButton в ветке закоммичен.

```bash
# На сервере (полный runbook + rollback: ProxyBook/BedolagaCabinetDeploy.md)
cd /opt/remnawave/bedolaga/cabinet-src
git stash push -m "infra mods" && git pull fork custom-ui && git stash pop
docker compose build && docker compose up -d
tar czf /opt/backups/cabinet-statics-$(date +%Y%m%d-%H%M).tar.gz -C /srv/cabinet .
rm -rf /srv/cabinet/* && docker cp cabinet_frontend:/usr/share/nginx/html/. /srv/cabinet/ && chmod -R a+rX /srv/cabinet
# Верификация: grep -l pricePerDevice /srv/cabinet/assets/*.js; hash index-чанка == локальной сборке
```

НИКОГДА не деплоить локальную macOS npm-сборку tar'ом (устаревшая процедура из BedolagaV3Upgrade.md Phase 6 — источник рассинхрона).

Раздаётся через Caddy:

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