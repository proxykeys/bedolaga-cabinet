# ProxyKeys Cabinet — Restyle к дизайн-системе claude.com

**Дата:** 2026-07-14
**Статус:** Approved
**Подход:** A (Foundation + override CSS)

## Цель

Кастомизировать UI кабинета под эстетику claude.com: сдержанный, монохромный,
«бумажный» вид. Убрать излишние декоративные эффекты (градиенты, анимации,
тени, полупрозрачность, glow, spotlight). Кнопки сделать монохромными как у
claude.com.

## Контекст дизайн-системы claude.com

Проанализированы CSS-токены claude.com (Next.js, Anthropic). Ключевые принципы:

- **Палитра — тёплый grayscale** (не холодный синий). Фоны `#faf9f5`/`#141413`.
  Серые тона с тёплым подтоном.
- **Акцент clay/терракота `#d97757`** используется **крайне умеренно**.
- **Кнопки монохромные**: primary = сплошной тёмный фон + светлый текст
  (инверсия в dark mode). Без shadow/glow/scale на hover. Hover = расширение
  кольца на 1px (box-shadow ring) или затемнение фона.
- **Структура держится на 1px сплошных бордерах**, а не тенях.
- **Никаких**: градиентов, glassmorphism, декоративных теней, blur, прозрачности.
  Только сплошные фоны.
- **Углы**: 4-12px, максимум 16px для инпутов.

## Текущее состояние проекта

- 1634 совпадений по `gradient|backdrop-blur|animate-|transition-|shadow-glow|@keyframes`
  в 326 файлах компонентов/страниц.
- 21 анимированный фон (aurora, meteors, fireflies, vortex...) в
  `src/components/ui/backgrounds/`.
- Motion-компоненты на framer-motion (`src/components/motion/`).
- Две системы кнопок: CVA `Button` (1018 использований) и CSS `.btn-*` (140).
- Палитра `dark` (холодный slate) и `champagne` (тёплый бежевый).
- В `globals.css` уже определена палитра `--color-gray-*`, близкая к claude.com.
- Кастомные цвета пользователя через UI уже имитируют claude-like grayscale
  (фон `#141413`, поверхность `#262624`, текст `#faf9f6`).

## Решения (по итогам брейншторма)

1. **Цвета**: оставить кастомные warm grayscale (уже claude-like, симметричные
   темы). Не менять палитру глобально.
2. **Кнопки**: монохром как у claude.com (primary = инверсия фона/текста).
   Accent сохраняется только для тонких деталей (ссылки, active-состояния
   навигации, focus-rings, badge-info).
3. **Анимации**: убрать декоративные, оставить короткие функциональные для UX
   (sheet slide, fade модалок, skeleton pulse, tooltip/dropdown, button tap).
4. **Радиусы**: оставить текущие (16-24px для bento).
5. **Эффекты**: убрать все градиенты/тени/прозрачность/glow/spotlight/blur.

## Архитектура решения

Принцип: максимум нагрузки на новый override CSS (ноль конфликтов при rebase),
точечные хирургические правки upstream-файлов только там, куда CSS не дотягивается
(JS-варианты кнопок, framer-motion, рендерер фонов).

## Фазы реализации

### Фаза 1: `src/styles/globals.css` — нейтрализация декоративных классов

| Класс | Убрать | Оставить |
|---|---|---|
| `.glass` | `backdrop-blur-xl`, `bg-dark-900/30` | сплошной фон + бордер |
| `.bento-card` | stagger (`bentoFadeIn`), `inset 0 1px 0` | сплошной фон + бордер |
| `.bento-card-hover` | `translateY`, spotlight `::after`, hover shadow | только `border-color` |
| `.bento-card-glow`/`.card-glow` | `shadow-glow` | `border-color` на hover |
| `.btn-primary` | glow shadow → монохром | сплошной фон |
| `body::before` (noise) | удалить entirely | — |
| `.hover-border-gradient` | удалить | — |
| `.text-gradient`, `.shimmer` | удалить | — |
| `.glow-accent`, `.glow-success` | удалить | — |
| `.admin-orb` + keyframes | удалить | — |
| `.btn-highlight` (`animate-spotlight`) | анимацию | — |

**Оставить функциональные**: sheet slide keyframes, backdropFadeIn/Out,
skeleton pulse, scaleInBounce, confetti-fall, toast shrink, pageEnter/Exit.

### Фаза 2: `tailwind.config.js` — чистка токенов

- `boxShadow`: убрать `glow`, `glow-lg`, `linear-glow`. Оставить `linear-sm`,
  `linear`, `card`, `soft`, `linear-lg`.
- `backgroundImage`: убрать `gradient-radial`, `gradient-subtle`.
- `animation`/`keyframes`: убрать декоративные — `aurora`, `meteor-effect`,
  `float`, `glow-pulse`, `spotlight`, `pulse-slow`, `traffic-shimmer`,
  `unlimited-flow`, `unlimited-pulse`, `trial-glow`, `move-vertical`,
  `move-in-circle*`, `move-horizontal`, `spotlight-ace`.
  Оставить: `fade-in*`, `slide-up`, `slide-down`, `slide-in-*`, `scale-in*`,
  `pulse-slow` (используется skeleton'ом — проверить).

### Фаза 3: Монохромные кнопки

**`src/components/primitives/Button/Button.variants.ts`** (CVA, 1018 использ.):
```
primary: bg-dark-950 text-dark-50
         hover:bg-dark-850
         БЕЗ shadow-linear, transition-all → transition-colors
```
Light theme: `bg-dark-50 text-dark-950` (инверсия) через CSS-override.

**`globals.css` `.btn-primary`** (CSS, 140 использ.) — синхронно → монохром.

Accent сохраняется для: `.link`, `.nav-item-active`, focus-rings, badge-info.

### Фаза 4: Motion system

**`src/components/motion/transitions.ts`**:
- `staggerContainer`: `staggerChildren: 0` (мгновенно, без каскада)
- `buttonHover` (scale 1.02): удалить
- `buttonTap` (scale 0.98): оставить (тактильный отклик)
- Оставить: `fadeIn`, `slideUp`, `scale`, `backdrop`, `sheetSlideUp`,
  `tooltip`, `dropdown`, `commandPalette`

`FadeIn.tsx` / `SlideUp.tsx` — без изменений (уже 0.2s).

### Фаза 5: Фоны — нейтрализация рендерера

**`src/components/backgrounds/BackgroundRenderer.tsx`**:
`RenderBackground` всегда возвращает `null`. Один edit убивает все 21 фона у
пользователей, не трогая 21 файл-компонент.

Registry/admin-редактор фонов НЕ трогаем (продукт-фича; просто ничего не
рендерится). Опциональный follow-up: убрать опции из `BackgroundConfigEditor`.

### Фаза 6: Новый `src/styles/claude-overrides.css` (catch-all)

Импортируется последним в `src/main.tsx`. Нейтрализует остатки в компонентах:

1. `backdrop-filter: none !important` глобально.
2. Полупрозрачные фоны `bg-dark-900/NN`, `bg-dark-800/NN` → сплошные.
3. Hover-трансформации (`hover:translate-y-*`, `hover:scale-*`,
   `active:scale-*`) → `transform: none`.
4. Glow-тени (`shadow-glow*`) → `box-shadow: none`.
5. Градиентные тексты/бордеры (`.text-gradient`, `.hover-border-gradient`)
   → сплошные.
6. Inset-блики на карточках → удалить.

Точные селекторы уточняются после аудита Tailwind-классов в компонентах.

### Фаза 7: Верификация

- `npm run type-check && npm run lint`
- `npm run dev` → проверить `/dev/ui-preview`, dashboard, login, admin
- Проверить обе темы (dark/light)
- Проверить primary/secondary/ghost/destructive кнопки
- Commit с префиксом `chore(branding):` per AGENTS.md

## Затронутые файлы

| Файл | Тип | Конфликт-риск при rebase |
|---|---|---|
| `src/styles/globals.css` | upstream edit | средний |
| `tailwind.config.js` | upstream edit | средний |
| `src/components/primitives/Button/Button.variants.ts` | upstream edit | низкий |
| `src/components/motion/transitions.ts` | upstream edit | низкий |
| `src/components/backgrounds/BackgroundRenderer.tsx` | upstream edit | низкий |
| `src/styles/claude-overrides.css` | **новый** | **ноль** |
| `src/main.tsx` | upstream edit (1 строка import) | минимальный |

~7 файлов, 1 новый. Соответствует AGENTS.md.

## Коммит-стратегия

Один коммит `chore(branding): restyle UI to claude.com aesthetic — flat, monochrome, no decorative effects`.

## Out of scope (не делаем)

- Изменение палитры `dark`/`champagne` глобально.
- Удаление 21 файла анимированных фонов (нейтрализуем рендерер).
- Удаление motion-компонентов (гасим декор в transitions.ts).
- Изменение радиусов.
- Перевод шрифтов на Anthropic Sans/Serif.
- Смена accent-цвета (остаётся настраиваемым через UI).
