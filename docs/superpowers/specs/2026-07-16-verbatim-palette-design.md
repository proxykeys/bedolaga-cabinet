# Verbatim Operator Palette — Design Spec

**Date:** 2026-07-16
**Status:** Approved
**Branch:** `custom-ui`

## Problem

Three independent issues cause the UI to display status colors that differ
from what the operator picks in the theme editor:

### 1. `generatePalette` ignores operator's lightness

`src/hooks/useThemeColors.ts:24-50` generates all 11 shades by forcing
shade-500 to `L=50%`, regardless of the input hex's actual lightness. The
operator's hex is converted to HSL, but only hue and saturation are kept —
lightness is discarded.

With the operator's real palette:

| Color   | Operator hex | L₀  | derived-500 (forced L=50) | ΔL  |
|---------|--------------|-----|---------------------------|-----|
| accent  | `#55B2D8`    | 59% | `#306ECF`                 | 9%  |
| success | `#5BBD6F`    | 55% | `#49B65F`                 | 5%  |
| warning | `#E5A451`    | 61% | `#DE8B21`                 | 11% |
| error   | `#DF614D`    | 59% | `#D83F27`                 | 9%  |

The operator's exact hex **never appears** in any CSS variable. This is why
"кнопки SubscriptionCardExpired темнее оригинала" and "акцент royal blue вместо
sky".

### 2. Traffic zone uses shade-400 + alpha

`src/utils/trafficZone.ts:32` — `mainVar: 'rgb(var(--color-accent-400))'`
(L=64%, even lighter than 500) + `TrafficProgressBar.tsx:49` overlays
`rgba(..., 0.6)` on top → compound lightening. This is why "трафиковая шкала
светлее оригинального цвета".

### 3. Semi-transparent colored elements scattered across ~12 components

Patterns like `bg-warning-400/15`, `rgba(var(--color-warning-400),0.04)`,
`bg-accent-500/10` produce the tinted backgrounds that claude.com's design
system does not use. `claude-overrides.css` neutralizes gradients/shadows/blur
but does **not** catch these valid Tailwind opacity utilities.

## Solution

### Part 1 — Verbatim shade-500

Rewrite `generatePalette(baseHex)`:

1. Convert input to HSL → `(h, s, L₀)`
2. `palette[500] = hex verbatim` (RGB of input)
3. For each other shade, compute `L = clamp(L₀ + offset, 5, 95)` where:
   ```
   offsets: { 50:+47, 100:+44, 200:+36, 300:+26, 400:+14, 500:0,
              600:−8, 700:−16, 800:−24, 900:−32, 950:−40 }
   ```
4. Keep current saturation adjustment (`s*0.7` for shades ≤100, `s*0.8` for
   shades ≥900)

Result with operator palette:
- `accent-500 = 55B2D8` ✓
- `success-500 = 5BBD6F` ✓
- `warning-500 = E5A451` ✓
- `error-500 = DF614D` ✓

### Part 2 — Canonicalize shade usage

`src/utils/trafficZone.ts`:
- All `mainVar` → `*-500` (was 400)
- Remove dead `gradientFrom`/`gradientTo` (flattened already)
- `danger.textClass: 'text-warning-300'` → `'text-warning-500'`

`src/components/dashboard/TrafficProgressBar.tsx`:
- Unlimited fill: `rgba(...,0.6)` → `zone.mainVar` (solid)
- Remove warning zone tint backgrounds (decorative; status already conveyed
  by fill color)

### Part 3 — Semi-transparent element replacement (per category)

| Cat | Element | Strategy |
|-----|---------|----------|
| A | Status badge pills | Neutral bg + colored text + solid 1px colored border |
| B | Icon chip in card | Outline style: transparent bg, 1px solid color, colored icon |
| C | Status card border | Solid 1px `rgb(*-500)` |
| D | Inner info strip | Neutral: `g.innerBg` + `g.innerBorder` |
| E | Warning callout banner | `border-*-500 bg-dark-800 text-*-500` + colored icon |
| F | Promo badges | Solid pill: `bg-*-500 text-on-*` |
| G | Trial card banner | Neutral bg + solid accent border + colored heading |
| H | Spinner border | `g.innerBorder` + `borderTopColor: accent.solid` |
| I | Unlimited progress fill | Solid `zone.mainVar` |
| J | Track zone tints | Remove entirely |
| K | Hardcoded `text-white` | Use `onColor` for auto-contrast |

## Scope (13 files)

1. `src/hooks/useThemeColors.ts` — fix generatePalette
2. `src/utils/trafficZone.ts` — canonicalize shades
3. `src/components/dashboard/SubscriptionCardExpired.tsx` — B,C,D,H,K
4. `src/components/dashboard/SubscriptionCardActive.tsx` — B,C,D
5. `src/components/dashboard/TrafficProgressBar.tsx` — I,J
6. `src/components/dashboard/TrialOfferCard.tsx` — C,G
7. `src/components/subscription/SubscriptionListCard.tsx` — A,C,D
8. `src/components/subscription/PurchaseCTAButton.tsx` — B,C
9. `src/components/subscription/sheets/DeleteSubscriptionSheet.tsx` — E
10. `src/components/subscription/purchase/TariffPurchaseForm.tsx` — E,F
11. `src/components/subscription/purchase/ClassicPurchaseWizard.tsx` — E,F
12. `src/components/subscription/purchase/TariffPickerGrid.tsx` — F
13. `src/dev/preview/sections/PagesSubscriptionSection.tsx` — D (preview mirror)

## Out of scope

- Admin pages (NetworkGraph, ColorPicker, bulk actions) — canvas/SVG rgba
- Background components (matrix-rain, sparkles, fortune wheel) — decorative
- `PaymentMethodIcon.tsx` — brand hex colors (Visa, Mastercard etc.)
- News section — decorative canvas

## Verification

- `npm run type-check && npm run build`
- `/dev/ui-preview` — all states (active/expired/limited/trial) in both themes
- `/dashboard` — real data
- DevTools: `getComputedStyle(el).getPropertyValue('--color-error-500')` must
  return RGB of `#DF614D`, not `#D83F27`

## Commit plan

1. `chore(branding): spec + fix generatePalette to preserve operator hex at shade-500`
2. `chore(branding): canonicalize trafficZone to shade-500, remove dead gradients`
3. `chore(branding): replace alpha tints in dashboard components (Expired, Active, Traffic, Trial)`
4. `chore(branding): replace alpha tints in subscription components (ListCard, CTA, Delete sheet)`
5. `chore(branding): replace alpha tints in purchase wizards (Tariff, Classic, Picker)`
6. `chore(branding): sync preview section with new palette strategy`
