# Travel Nurse App

All-in-one logistics and safety platform for travel nurses and physicians.

**Developed by Start Right Tutoring, LLC**

## Features

- **Safety First Booking** — Flights, transit, and housing with OSHA and crime data overlays
- **Stipend Management Tracker** — Take-home pay calculations
- **Credential Vault** — Secure storage for BLS, ACLS, and licenses
- **Work Order Parsing** — Automated trip planning initiation (planned)

## Tech Stack

| Layer          | Choice                                         |
| -------------- | ---------------------------------------------- |
| Framework      | Expo SDK 54 + React Native 0.81                |
| Navigation     | expo-router (file-based)                       |
| Styling        | NativeWind v4 (Tailwind)                       |
| State          | Zustand + TanStack Query                       |
| HTTP           | Axios with typed envelopes                     |
| Secure storage | expo-secure-store (no AsyncStorage for tokens) |
| Validation     | Zod                                            |
| Testing        | Jest + React Native Testing Library            |

## Getting Started

```bash
cp .env.example .env
npm install
npm start
```

> **Expo Go:** Physical devices only support the latest Expo Go SDK. Run `npm run upgrade:expo` quarterly (or when Expo Go reports an SDK mismatch) to stay aligned.

## Dependency upgrades

```bash
npm run upgrade:expo   # align Expo SDK + peer packages
npm run validate       # confirm typecheck, lint, and tests after upgrading
```

## Quality Gates

```bash
npm run validate   # typecheck + lint + format + test
```

## Architecture

```
app/           → Navigation boundaries (Expo Router)
src/components/ui/     → Shared primitives
src/components/domain/ → Feature-specific UI
src/hooks/             → Composed business logic for screens
src/services/          → API client + secure storage
src/store/             → Global state
src/utils/             → Pure helpers + error handling
```

See `.cursor/rules/enterprise-architecture.mdc` for full conventions.

## Security

Sensitive credentials (tokens, MFA seeds) **must** use `src/services/secure-storage/index.ts`. Never persist session data in AsyncStorage.
