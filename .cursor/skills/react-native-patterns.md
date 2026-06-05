---
name: react-native-patterns
description: Build mobile apps with React Native and Expo — navigation, platform-specific code, performance, and native modules.
---

# React Native Patterns (Travel Nurse App)

Source: [awesome-cursor-skills/react-native-patterns](https://github.com/spencerpauly/awesome-cursor-skills)

## Stack

- **Expo SDK** (current: 54) + **expo-router** (file-based routing)
- Run `npm run upgrade:expo` when Expo Go reports an SDK mismatch — do not hard-code SDK versions in docs
- **NativeWind v4** for styling
- **Zustand** for global state
- **TanStack Query** for server state
- **expo-secure-store** for sensitive tokens (never AsyncStorage)

## Navigation structure

```
app/
├── _layout.tsx
├── index.tsx
├── (auth)/login.tsx, onboarding.tsx
└── (tabs)/booking, safety, stipend, vault
```

## Performance

- `FlatList` for lists; memoize row components.
- `expo-image` for remote images (when added).
- Avoid inline styles and anonymous `renderItem` callbacks.

## Forms

- `react-hook-form` + Zod validators from `src/utils/validators.ts`.

## Testing

- Jest + `@testing-library/react-native`
- Mock `expo-secure-store` in `__tests__/setup.ts`
