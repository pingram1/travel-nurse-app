---
name: using-ui-stack
description: Enforce configuration-driven design system for all UI generation in Travel Nurse App.
---

# Using UI Stack (Travel Nurse App)

Source: [awesome-cursor-skills/using-ui-stack](https://github.com/spencerpauly/awesome-cursor-skills)

## Tokens

Reference `src/constants/theme.ts` and `tailwind.config.js`.

- **Spacing**: 8px grid (4, 8, 16, 24, 32, 48)
- **Colors**: 60% neutral, 30% brand blue, 10% accent
- **Typography**: 1.25 ratio scale (12–30px)
- **Touch targets**: ≥ 44×44px

## Component rules

1. Build from `src/components/ui/` primitives first.
2. Domain components live in `src/components/domain/`.
3. Every interactive element needs default, pressed, disabled, and focus states.
4. Dark mode: use `slate-950` backgrounds, not pure black.

## Primitives

- `Button` — primary, secondary, ghost, danger variants
- `Card` — elevated or bordered
- `Input` — label + error message support
