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

## Текущие версии (обновление 2026-08-30)

| Компонент | Версия | Образ / ветка |
|---|---|---|
| **Remnawave Panel** | 3.4.1 | `remnawave/backend:3` |
| **Bedolaga Bot** | 4.2.0 | `main` branch (git) |
| **Cabinet Frontend** | 1.67.0 | `custom-ui` branch |
| **Remnawave Node** | 2.8.0 (pinned) | `remnawave/node:2.8.0` |
| **Subscription Page** | v8.0.0 | `remnawave/subscription-page:latest` |
| **Panel DB** | PostgreSQL 17.6 | `postgres:17.6` |
| **Panel Cache** | Valkey 9 | `valkey/valkey:9-alpine` (Unix socket) |

Апгрейд 2026-08-30 (panel 3.2.1→3.4.1, bot 4.0.0→4.2.0, cabinet 1.65→1.67, sub page v8): runbook — ProxyBook/BedolagaV3Upgrade.md. Нюансы panel 3.4: list-endpoint `/api/subscription-page-configs` отдаёт `config: null` (конфиг только в by-uuid endpoint, в БД на месте); sub page v8 рендерит webpage только при `Accept: text/html` (SRR-правило Browser Subscription) — curl без Accept получает 502 by design. GeoCheck в админке кабинета не работает (нужна node 3.3.0+, нода pinned 2.8.0) — не блокер.

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
| Bot promocode to balance | bot custom.patch | Кнопка «🎫 Промокод» перенесена из главного меню бота на экран «Баланс» (как в веб-кабинете); хендлер `menu_promocode` не менялся |
| Device manager UX | `51bade44` | Карточка «Лимит количества устройств»: индикатор дельты (+N/−N) под счётчиком, количество в цене «+2 × 48 ₽/устройство (12 дней)», warning «Средства за удалённые устройства не возвращаются» при уменьшении |
| Reissue card hint | `96a2cbdd` | Третья строка-hint «Старая ссылка перестанет работать» в карточке «Перевыпустить подписку» — высота выровнена с «Лимит количества устройств» в свёрнутом состоянии |
| Countdown self-start | `6f7b9857` | Карточка «Осталось» (`self-start`) не растягивается при раскрытии consent-панели в соседней карточке «Автопродление» |
| Code bg darker | `5a02bbb8` | Фон строки ссылки подписки (`codeBg` gray-950) темнее фона родительской карточки — inset-эффект; токен используется только в Subscription.tsx |
| Recurrent payments doc | — (DB content) | Текст юр-страницы `/recurrent-payments` задеплоен в `recurrent_payments` (БД бота); исходник `ProxyBook/legal/recurrent-payments-ru.txt`; код не менялся; 2026-08-26 убраны VPN-формулировки (юридические тексты не должны содержать «VPN»/«ВПН»/«виртуальную частную сеть» — триггер модерации); 2026-08-27 support-email добавлен в раздел 9 «Поддержка»; 2026-08-27 раздел 6 «Возврат средств» заменён отсылкой на раздел 10 публичной оферты (единый порядок возвратов, без дублирования) |
| Info recurrent tab | `a7a79bd0` + `9c23b8d5` | Таб «Рекуррентные платежи» на `/info` между «Оферта» и «Статусы» (builtin-таб, видимость через `visibility.recurrent` / `RECURRENT_PAYMENTS_DISPLAY_MODE`); контент — тот же документ из БД; фикс: builtin-табы не обрезаются (truncate только для кастомных страниц) |
| Offer consent at payment | `f9395e9d` | Чек-бокс «Оплатой принимаю условия публичной оферты» (+ ссылка `/offer`) в точках оплаты: TopUpAmount (кнопка+Enter гейтятся) и TariffPurchaseForm (баланс+SBP+Lava). Компонент `ConsentCheckbox` |
| Autopay consent panel | `5b1c882c` + `fc48f050` + `ed4094a8` | Панель согласия при включении автопродления (Subscription): чек-бокс + ссылка `/recurrent-payments`, «Включить» disabled до отметки; отключение — один клик без подтверждений. `fc48f050`: панель раскрывается ВНУТРИ карточки «Автопродление» (единая карточка, разделитель border-t); `ed4094a8`: на форме покупки ОДИН комбинированный чек-бокс «…публичной оферты И рекуррентных платежей» при autopay ON (ConsentCheckbox secondHref; сброс отметки при переключении toggle) |
| Public offer doc | — (DB content) | Текст юр-страницы `/offer` задеплоен в `public_offers` (БД бота); исходник `ProxyBook/legal/public-offer-ru.txt`; код не менялся; 2026-08-26 убраны VPN-формулировки («услуги защищённого сетевого доступа» вместо «доступа к VPN»); 2026-08-27 добавлен раздел 14 «Реквизиты Исполнителя» (ProxyKeys, самозанятый НПД, ИНН 231217339638, legal@proxykeys.net, support@proxykeys.net) + support-email в разделе 12; 2026-08-27 раздел 10 переписан по ЗоЗПП (10.1–10.7: сбои 5/10 раб. дней, досрочный отказ пропорционально дням без удержаний, возврат тем же способом ст. 16.1, невозмещаемое включая отключённые устройства, простой >10 дней, обращение сначала в поддержку 3 раб. дня) + механика устройств в разделе 5 (увеличение=доплата за остаток периода, уменьшение=без перерасчёта, применение при следующем периоде/автопродлении); отсылки «раздел N оферты» вместо нумерации пунктов |
| Privacy policy doc | — (DB content) | Текст юр-страницы `/privacy` задеплоен в `privacy_policies` (БД бота); исходник `ProxyBook/legal/privacy-policy-ru.txt`; код не менялся; 2026-08-26 убраны VPN-формулировки; 2026-08-27 в раздел 1 добавлена строка «Оператор персональных данных — Исполнитель, определённый в реквизитах публичной оферты» (определимость оператора по 152-ФЗ, через ссылку на /offer, без дубля реквизитов); support-email в разделе 11 «Контакты»; 2026-08-27 раздел 5 — оговорка о трансграничной передаче («хостинг и сетевая инфраструктура (в том числе находящимся за пределами Российской Федерации)», 152-ФЗ) |
| Service rules doc | — (DB content) | Текст таба «Правила» (`/info` + меню бота) задеплоен в `service_rules` (БД бота); исходник `ProxyBook/legal/service-rules-ru.txt`; код не менялся. 2026-08-27 новая редакция (8 пунктов). **Формат — НЕ Markdown**: `<b>/<i>/<a>` (Telegram HTML), каждый пункт одной строкой, пустая строка между пунктами, заголовок `🔒 <b>…</b>` (не `##` — иначе «##» видны в боте). Рендер веба: `formatContent` (`src/utils/legalContent.ts`) — блок «N. …» → `<ol start="N">`; жёсткие переносы внутри пункта превращают строки-продолжения в отдельные li. **Versioning**: бот (`create_or_update_rules`) хранит историю — правка = деактивация старой записи + INSERT новой `is_active=true, language='ru', order=0`; без активной записи API/бот отдают захардкоженный дефолт. Прошлые правки через админку (RulesEditor) легли неактивными/в кривом формате — записи id=1,2 оставлены как история |
| Legal consent gate | `f9e5b3b9` + `8bb26687` | Экран «Ещё один шаг» (чекбоксы оферта+политика) при первом входе новичка: восстановлен consent-флоу из `0f21629b` (Login.tsx-часть потеряна при rebase) + 428-handling в OIDC (`TelegramLoginButton`: inline-скрин + retry `loginWithTelegramOIDC(id_token, accepted)`) и MiniApp (`TelegramRedirect`: status `'consent'`) + typeof-guard `detail` (лечил React #31 «object with keys {code, message}» — ErrorBoundary у новых юзеров). `8bb26687`: OIDC-consent retry переоткрывает Telegram Login и шлёт свежий id_token с accepted — старый токен «сгорает» в replay-кэше бэка до проверки consent (auth.py:960), ретрай тем же токеном невозможен. Гейт на бэке: `CABINET_REQUIRE_LEGAL_CONSENT=True` default, emergency-off = false в `.env` бота. См. ProxyBook/BedolagaLegalConsentGate.md |
| Page title ProxyKeys | `a2424857` + `adc03187` | Title всех страниц «ProxyKeys» вместо «VPN»: `index.html` `<title>%VITE_APP_NAME%</title>` (env-substitution при сборке) + фолбэки `VITE_APP_NAME \|\| 'ProxyKeys'` в Login/TelegramRedirect/DeepLinkRedirect. **`CABINET_BRANDING_NAME=''` в БД бота — НАМЕРЕННО** (пустое имя = без надписи возле лого в AppShell, favicon-буква `V`, пустые h1 на переходных страницах); поэтому в useBranding/Login/редиректах raw-семантика `branding ? branding.name : FALLBACK` — пустое имя НЕ подменяется фолбэком (иначе надпись возле лого появится снова). Title берёт `appName \|\| FALLBACK_NAME` → «ProxyKeys» |
| Оформить вместо Купить | `0ad10dfe` + bot custom.patch | «Купить подписку» → «Оформить подписку», кнопка оплаты «Купить» → «Оформить», «Докупить устройства» → «Добавить устройства» — покупка списывается с баланса, «купить» вводило в замешательство. Веб: `subscriptions.buy`/`getSubscription`/`browsePlans`/`purchase`/`additionalOptions.*`, StatsGrid fallback. Бот: `MENU_BUY_SUBSCRIPTION`/`BUY_TARIFF_BUTTON`, CHGDEV_TOPUP_PROMPT, хардкоды constants.py/my_subscriptions/promo/monitoring_service/tariff_purchase. НЕ тронуты: buyTraffic* (unlimited, мёртвые), подарки (tabBuy), админские тексты, en-значение типа транзакции "Purchase" |
| Switch = autopay style | `0733d0d9` + `efae677d` + `d638ca0e` | Примитив `Switch` (Radix) переведён на стиль toggle автопродления: трек `h-7 w-[52px]` (28×52), плоский белый бегунок 22px без тени (absolute left/top 3px + `translate-x-[23px]`), анимация 300ms. OFF = textGhost как у автопродления на главной (`bg-white/[0.08]` dark / `bg-black/[0.06]` light; эволюция gray-400 → gray-500 → ghost по просьбе). Цель — Профиль → Настройки уведомлений (4 тумблера); примитив кроме Profile используется только в dev-preview секциях. API (`checked`/`onCheckedChange`), haptic, focus-ring не изменились |
| Sub page clients | — (panel DB) | Конфиг «Default» страницы подписки (`sub.proxykeys.net`, таблица `subscription_page_config`): набор приложений ProxyKeys — Xray: Happ (+новая Linux-карточка), INCY, V2rayTun, Shadowrocket; Mihomo: Rabbit Hole, Koala Clash; TV — только Happ. Deep-links `v2raytun://import/`, `rabbithole://add/`; INCY — ручной импорт (нет crypt1 в панели 3.2.1). Иконки: Incy — монокромный wordmark `#FAFAFA` (2026-08-30, стиль vrayTUN), RabbitHole — официальный лого; кастомные ключи svgLibrary. Применено PATCH `/api/subscription-page-configs` (admin JWT + `x-remnawave-client-type: browser`, HTTPS обязателен). См. ProxyBook/BedolagaSubPageClients.md |
| Sub page full cycles | — (panel DB) | 2026-08-30: полные циклы установки в карточках — порядок «Установка → Подготовка → Добавление → Подключение → Известные проблемы (красный, ВСЕГДА последний)». Happ: refresh-подписка при недокачанных списках правил, проверка профиля маршрутизации «ProxyKeys», iOS-совет 50 МБ → Dev Settings → Xray memory limit; macOS DNS-TUN в тот же блок. Shadowrocket «Подготовка»: Send HWID (Настройки→Обновление→Подписка; без него 404 «App not supported» — HWID Device Limit включён), конфиг `shadowrocket://config/add/…proxykeys-mmdb.conf` (основной) / `proxykeys.conf` (запасной), mmdb `mmdbfilter@release/Country.mmdb` в GeoLite2→Страна. Koala: CVR-удаление в install-описание. Валидатор панели: у блока обязателен `buttons` (пусть `[]`), у кнопки `svgIconKey` |
| Routing profile Happ/INCY | — (panel DB) | 2026-08-30: заголовок `routing: {happ,incy}://routing/onadd/<b64>` в Response Rules заменён с минимального (2 URL) на полный профиль (по `filter@main/incy-routing.json`): PROXY `geosite:ru-blocked`+`geoip:re-filter`, BLOCK `geosite:category-ads-ru`, DIRECT RU/TLD/private, DoH cloudflare/quad9, геофайлы `datfilter@release` (jsdelivr, сборка 6ч, категории обрезаны xray-geodata-cut, UPPERCASE — Xray сам uppercase'ит коды). `LastUpdated`=ts применения → клиенты перекачивают при следующем update. PATCH `/api/subscription-settings` багует (500 A231) — применено UPDATE БД + `docker restart remnawave`. Скрипт/бэкапы: `ProxyBook/backups/{routing-profile.json, subscription-settings-backup-2026-08-30.json}` |
| Routing profile V2rayTun | — (panel DB) | 2026-08-30: правило «Xray v2RayTun» получило заголовок `routing: <b64>` (Xray-routing JSON формата V2rayTun: proxy `geosite:ru-blocked`+`geoip:re-filter`, direct `category-ru`/TLD-regexp/`geoip:ru|private`/CIDR; БЕЗ ad-block — категория не гарантирована в geo V2rayTun). V2rayTun применяет правила поверх локальных при каждом обновлении подписки; подменить его geo-файлы на datfilter нельзя. Тот же путь: UPDATE БД + рестарт. Профиль: `ProxyBook/backups/v2t-routing-profile.json` |
| INCY one-tap import | `de53d50a` + bot custom.patch | 2026-08-30 v2: кнопка «Добавить подписку» для INCY на ОБОИХ поверхностях. Конфиг панели: `subscriptionLink` `https://hooks.proxykeys.net/incy-import?sub={{SUBSCRIPTION_LINK}}` (sub page резолвит `{{SUBSCRIPTION_LINK}}` нативно — `INCY_CRYPT1_LINK` в sub page v8 НЕ поддержан, только USERNAME/SUBSCRIPTION_LINK/HAPP_CRYPT3/4). Эндпоинт бота `/incy-import` (`app/webserver/incy_import.py`, публичный, host-allowlist `sub.proxykeys.net`) кодирует Python-портом кодировщика (`app/utils/incy_link_encoder/`) → HTML `location.replace('incy://crypt1/…')` + fallback. Кабинет: `_inject_incy_crypt1_button` ЗАМЕНЯЕТ link конфиговой кнопки на `{{INCY_CRYPT1_LINK}}` (кабинет кодирует локально `@incy/link-encoder/sync`, без хопа; дубля нет). copyButton — fallback везде. Caddy: `/incy-import` в allowlist hooks. При появлении `INCY_CRYPT1_LINK` в sub page — перейти на нативный шаблон, инжекцию+эндпоинт удалить. См. ProxyBook/BedolagaSubPageClients.md |
| Connection deep-link buttons | `bad1a58b` + `3843afcd` | 2026-08-30: кабинет `/connection` рендерит тот же sub page config (через бота); `BlockButtons.tsx` external-ветка валидировала только http(s) → кнопки `shadowrocket://config/add/…` исчезали (на sub-странице панели были видны). Фикс `bad1a58b`: external deep-link'и (`://`, не js/data:) открываются через `onOpenDeepLink` (openAppScheme iframe), шаблоны резолвятся. Фикс `3843afcd`: subscriptionLink с `#{{USERNAME}}` (Shadowrocket) скрывался для аккаунтов без username (email-only auth) — теперь неразрешённый `#fragment` отрезается вместо скрытия кнопки. INCY «Скопировать ссылку» (copyButton) в кабинете скрывается при `hide_link` |
| Stage icons palette | — (panel DB) | 2026-08-30: `svgIconColor` иконок этапов установки (обе поверхности — sub page + кабинет `/connection`, единый конфиг в БД панели): Установка `#0079D8` (accent кабинета), Подготовка/Инструкции `#DAA559` (warning), Добавление подписки `#6A9BCC` (claude.com sky — пробел палитры), Подключение `#00795A` (success), Известные проблемы `#DF615B` (error). Акценты — branding кабинета (админка БД бота), НЕ дефолты globals.css; диапазон яркости L 0.15–0.41 = диапазону акцентов. Hex работает на обеих сторонах (sub page hex-regex в бандле; кабинет `hexToRgb` в colorParser.ts); нормализованы артефакты violet/#ffffff на Happ. Код кабинета НЕ менялся. Скрипт `ProxyBook/backups/recolor-stages.py`; откат `subpage-config-before-stage-colors-2026-08-30.json`. См. ProxyBook/BedolagaSubPageClients.md |
| Hide loyalty tab | `d1728bed` | 2026-08-31: таб «Статусы» (программа лояльности, promo groups по накопленным тратам) скрыт на `/info` — в БД бота одна дефолтная группа «Базовый юзер» без порогов/скидок, фича не используется. Патч `Info.tsx`: `visibleBuiltinTabs`-фильтр `loyalty → return false` (upstream хардкодил `return true`, игнорируя visibility). Рендер-код и API остались (мёртвая ветка), при желании вернуть — откат одной строки |

Подробная документация: см. ProxyBook (секция ниже).

## Бизнес-модель ProxyKeys

- **Single-tariff**: один активный тариф (id=3, «ProxyKeys Subscription»). `MULTI_TARIFF_ENABLED` не установлен.
- **Unlimited traffic**: все тарифы `traffic_limit_gb=0`, включая trial (`TRIAL_TRAFFIC_LIMIT_GB=0`).
- **Device pricing**: `device_price_kopeks=4800` (48₽ за доп. устройство, обновлено 2026-08-22). Базовое `device_limit=1`, `max_device_limit=15` (единый потолок для веба и бота).
- **No-manual-renewal**: активная (non-trial, non-expired) подписка не продлевается вручную. Продление — только автопродление с баланса (`autopay`). Истёкшая — повторная покупка через каталог.
- **Trial → fresh purchase**: trial-подписка не помечает тариф `is_current=True` → покупка открывается как fresh purchase с селектором устройств.

## Backend (Bot) Integration

Бот (Bedolaga Telegram Bot v4.2.0) работает на сервере `193.23.197.134`. Все ProxyKeys-патчи бота собраны в `custom.patch` на сервере.

**Обновление 4.0.0 → 4.2.0 (2026-08-30)**: конфликты только в `tariff_purchase.py` (нативный single-tariff skip заменил наш кастом-хунк; наш device selector и no-manual-renewal guard сохранены) и `my_subscriptions.py` (наш текст «Оформить подписку» + upstream gift-кнопка). Порядок клавиатур покупки: BACK-кнопки upstream (`back_callback`: menu_buy / back_to_menu при скипе), «❌ Отмена» удалена.

### Патчи бота

- **Расположение**: `/opt/remnawave/bedolaga/custom.patch` (2552 строки, 26 файлов исходного кода; `locales/` volume-mount файлы исключены)
- **Backup'ы**: `/opt/remnawave/bedolaga/custom-before-*.patch` (снапшоты перед каждым этапом)
- **Применение**: `cd /opt/remnawave/bedolaga/bot-src && git diff HEAD > ../custom.patch` (регенерация)

### Ключевые патчи бота

| Файл | Что изменено |
|---|---|
| `.env` | `TRIAL_TRAFFIC_LIMIT_GB=0`, `DEFAULT_AUTOPAY_DAYS_BEFORE=1`, `DEFAULT_AUTOPAY_ENABLED=false`, `REMNAWAVE_API_KEY` (v3 JWT), `TRAFFIC_EXCLUDED_USER_IDS` (вместо `_UUIDS`), `AVAILABLE_LANGUAGES=ru` (один язык кабинета/бота — переключатель в хедере кабинета скрывается сам при ≤1 языке; backup `.env.backup-before-single-lang-*`) |
| `app/cabinet/routes/subscription_modules/purchase.py` | Trial → `is_current=False`; no-manual-renewal guard (409); device_count validation + pricing |
| `app/cabinet/routes/subscription_modules/renewal.py` | No-manual-renewal guard (409 для активных) |
| `app/handlers/subscription/tariff_purchase.py` | Device selector (`get_tariff_device_keyboard`, `format_device_purchase_preview`, `tariff_dev:` handler); single-tariff auto-select; «❌ Отмена» back buttons; fallback `BUY_TARIFF_BUTTON` → «📦 Оформить подписку» |
| `app/handlers/subscription/my_subscriptions.py` | Traffic display + кнопка [📊 Трафик] убраны; «Автоплатеж»→«Автопродление»; [🛒 Оформить подписку], [➕ Добавить устройства] |
| `app/handlers/subscription/devices.py` | Device stepper в боте как в вебе (`chgdev:`/`chgdevred`/`chgdevr:`): докупка [−] +N [+] с живой ценой + отдельный экран уменьшения; исполнение через существующие `confirm/execute_change_devices`; `CHGDEV_TOPUP_PROMPT` — «Добавление устройств» |
| `app/utils/device_price.py` | Новый файл: `calculate_device_topup_price()` — цена докупки, зеркалит `/devices/price` кабинета (пророт по days_left, бесплатные в пределах тарифа, скидка PricingEngine) |
| `app/handlers/subscription/autopay.py` | «Автоплатеж» → «Автопродление», согласование «включено/выключено»; фикс-текст (дни/период не настраиваются); consent-экран при включении (`_show_autopay_consent` → callback `autopay_enable_confirm`: URL-кнопка «Рекуррентные платежи» + «Ознакомлен(а), включить»); отключение — один клик; guards вынесены в `_autopay_enable_guards_failed` |
| `app/keyboards/inline.py` | Скрыт [Продлить] для активных; скрыт [Тариф]; скрыты [Настроить дни] + [Период продления]; `pack_buttons_in_rows()` (фикс обрезки кнопок); [🎫 Промокод] перенесён из главного меню в `get_balance_keyboard` (экран «Баланс», как в вебе); URL-кнопка «📄 Публичная оферта» на экране оплаты (`PUBLIC_OFFER_URL`, default my.proxykeys.net/offer) |
| `app/handlers/balance/main.py` | `show_payment_methods`: строка «Оплата означает согласие с публичной офертой» под текстом методов |
| `app/localization/locales/{ru,en,fa,zh,ua}.json` | SUBSCRIPTION_*_TEMPLATE без traffic/servers; ключи `CHGDEV_*` (степпер устройств, ru/en); `AUTOPAY_BUTTON` → «💳 Автопродление», `CHANGE_DEVICES_BUTTON` → «📱 Лимит количества устройств» (renamed 2026-08-24; «Изменить …» не влезало в кнопку — убрали глагол; дефолты в inline.py и menu_layout/constants.py синхронны); `MENU_BUY_SUBSCRIPTION`/`BUY_TARIFF_BUTTON` → «Оформить подписку» (2026-08-29) |
| `app/services/menu_layout/constants.py` | Главное меню: «🛒 Оформить подписку» (ru; en «Subscribe»), синхронно с `MENU_BUY_SUBSCRIPTION` |
| `app/handlers/promocode.py` | «← Назад» из промокод-флоу → экран «Баланс» (callback `promo_back_balance`: `_restore_previous_state` + `show_balance_menu`; без очистки FSM текст после возврата перехватывался бы как код) |
| `app/handlers/subscription/purchase.py` | No-manual-renewal guard; traffic/servers убраны из шаблонов; регистрация степпер-хендлеров `chgdev*`; регистрация `confirm_autopay_enable` (`autopay_enable_confirm`) |

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
- **Test user**: panel id=41 (telegram_id=185929880, bot user id=18 turtlemutant)
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
| `BedolagaBotUpdate410.md` | Runbook обновления Bot 4.0.0 → 4.1.0 (поглощён апгрейдом 4.2.0 от 2026-08-30 — см. BedolagaV3Upgrade.md) |
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