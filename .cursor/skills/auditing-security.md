---
name: auditing-security
description: Security audit workflow for Travel Nurse App — OWASP, secrets, secure storage.
---

# Security Audit (Travel Nurse App)

Source: [awesome-cursor-skills/auditing-security](https://github.com/spencerpauly/awesome-cursor-skills)

## Mobile-specific checklist

- [ ] Session tokens in `expo-secure-store` only (`src/services/secure-storage`)
- [ ] No secrets in `app.json`, source, or git history
- [ ] `EXPO_PUBLIC_*` vars contain no privileged API keys
- [ ] AuthZ enforced server-side; client checks are UX-only
- [ ] PII scrubbed from logs and error messages
- [ ] HTTPS-only API base URL in production
- [ ] Credential vault files use signed URLs / server-side encryption (when implemented)

## Forbidden patterns

```typescript
// NEVER
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.setItem('access_token', token);
```

```typescript
// ALWAYS
import { secureStorage, SECURE_STORAGE_KEYS } from '@/services/secure-storage';
await secureStorage.set(SECURE_STORAGE_KEYS.ACCESS_TOKEN, token);
```
