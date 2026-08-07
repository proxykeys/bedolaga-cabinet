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

## ProxyKeys Custom Features

Все фичи задеплоены в продакшн. Каждая — отдельный коммит на `custom-ui`.

| Фича | Коммит | Описание |
|---|---|---|
| Device count selector | `49c8daf7` | Выбор кол-ва устройств при покупке тарифа (device_price_kopeks × extra × months) |
| No-manual-renewal | `b40095ec` | Активные подписки не продлеваются вручную — только автопродление с баланса |
| Autopay info block | `7a68f6f3` | Стоимость автопродления на странице подписки |
| Unlimited model | `cedd1d33` | Удаление traffic/servers/unlimited UI (все тарифы `traffic_limit_gb=0`) |
| Trial device selector | `2905e92d` | Trial не помечает тариф как `is_current` → селектор устройств работает |
| Merge home=subscription | `73826366` | Главная страница = страница подписки (`/` = `<Subscription/>`) |

Подробная документация: см. ProxyBook (секция ниже).

## Бизнес-модель ProxyKeys

- **Single-tariff**: один активный тариф (id=3, «ProxyKeys Subscription»). `MULTI_TARIFF_ENABLED` не установлен.
- **Unlimited traffic**: все тарифы `traffic_limit_gb=0`, включая trial (`TRIAL_TRAFFIC_LIMIT_GB=0`).
- **Device pricing**: `device_price_kopeks=4000` (40₽ за доп. устройство × месяцы). Базовое `device_limit=1`, `max_device_limit=NULL` (без ceiling).
- **No-manual-renewal**: активная (non-trial, non-expired) подписка не продлевается вручную. Продление — только автопродление с баланса (`autopay`). Истёкшая — повторная покупка через каталог.
- **Trial → fresh purchase**: trial-подписка не помечает тариф `is_current=True` → покупка открывается как fresh purchase с селектором устройств.

## Backend (Bot) Integration

Бот (Bedolaga Telegram Bot) работает на сервере `193.23.197.134`. Все ProxyKeys-патчи бота собраны в `custom.patch` на сервере.

### Патчи бота

- **Расположение**: `/opt/remnawave/bedolaga/custom.patch` (22 файла, ~1560 строк)
- **Backup'ы**: `/opt/remnawave/bedolaga/custom-before-*.patch` (снапшоты перед каждым этапом)
- **Применение**: `cd /opt/remnawave/bedolaga/bot-src && git diff > ../custom.patch` (регенерация)

### Ключевые патчи бота

| Файл | Что изменено |
|---|---|
| `.env` | `TRIAL_TRAFFIC_LIMIT_GB=0`, `DEFAULT_AUTOPAY_DAYS_BEFORE=1`, `DEFAULT_AUTOPAY_ENABLED=false` |
| `app/cabinet/routes/subscription_modules/purchase.py` | Trial → `is_current=False`; device_count в API |
| `app/handlers/subscription/purchase.py` | No-manual-renewal guard; traffic/servers убраны из шаблонов |
| `app/handlers/subscription/my_subscriptions.py` | Traffic display + кнопка убраны |
| `app/handlers/subscription/autopay.py` | «Автоплатеж» → «Автопродление», согласование «включено/выключено» |
| `app/keyboards/inline.py` | Скрыт [Продлить], `pack_buttons_in_rows()` (фикс обрезки кнопок) |
| `app/localization/locales/{ru,en,fa,zh,ua}.json` | SUBSCRIPTION_*_TEMPLATE без traffic/servers |

### Деплой бота

```bash
# Пересборка при изменении кода
cd /opt/remnawave/bedolaga/bot-src
docker compose up -d --build bot

# Только локали (без пересборки) — КРИТИЧЕСКИ ВАЖНО:
rm -f locales/*.json && docker restart remnawave_bot
```

### КРИТИЧНО: stale `locales/` volume override

`docker-compose.yml` монтирует `./locales:/app/locales:rw`. После `git pull` или правки локалей **обязательно**:
```bash
rm -f locales/*.json && docker restart remnawave_bot
```
Иначе бот использует устаревшие локали из volume.

## Server & DB

- **Сервер**: `193.23.197.134` (Debian 12)
- **SSH**: `ssh root@193.23.197.134`
- **Bot DB**: `docker exec remnawave_bot_db psql -U remnawave_user -d remnawave_bot`
- **Bot container**: `remnawave_bot` (healthcheck: `docker ps --filter name=remnawave_bot`)
- **Test user**: id=14 (telegram_id=185929880)
- **Test trial user**: id=16 (trial, sub id=25, tariff_id=3)
- **Active tariff**: id=3 «ProxyKeys Subscription» (device_limit=1, device_price_kopeks=4000, traffic_limit_gb=0, is_active=t)
- **Inactive tariff**: id=1 «Стандартный» (is_active=f)
- **Bot env**: `SALES_MODE=tariffs`, `MULTI_TARIFF_ENABLED` не установлен

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