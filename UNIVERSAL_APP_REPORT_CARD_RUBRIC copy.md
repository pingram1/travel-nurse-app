# Universal Application Report Card — Rubric (v1.1)

Use this document to grade **any** software product you ship: REST/GraphQL backends, SPAs, server-rendered apps, **Expo/React Native** clients, desktop shells, or combinations. Copy the [blank template](#blank-report-card-template) into a project wiki, PR, or quarterly review and fill in grades with evidence.

> **Versioning note:** This rubric describes _practices_, not pinned toolchain versions. Record the **current** Expo SDK, React Native, Node, and lockfile hash in each report card snapshot (see [Platform baseline snapshot](#platform-baseline-snapshot)) — never bake a specific SDK (e.g. “52”) into the rubric itself.

## How to grade

1. **Pick scope** — Grade the _system_ you are responsible for (e.g. “API + mobile app + infra,” not “the whole organization”).
2. **Mark N/A** — If a row does not apply (no file uploads, no payments, no containers), use **N/A** and omit from executive summaries so scores stay comparable _within_ that product class.
3. **Use the same scale** — A− means “strong, minor gaps”; C means “works but needs deliberate investment.” See [Grade scale](#grade-scale).
4. **Evidence, not vibes** — Every cell should cite files, tickets, metrics, or behaviors (see examples in each section).
5. **Re-grade on cadence** — After a “tech-debt sprint,” duplicate the table with Old / New / Evidence like your Start Right example.
6. **Snapshot the platform baseline** — On each review, record the _then-current_ SDK/runtime versions (Expo, RN, Node, etc.) in the report card header. Upgrades are expected; grades judge _process_, not a frozen stack.

## Grade scale

| Grade       | Meaning                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| **A**       | Best-in-class for your stage; safe to benchmark others against; residual risk is narrow and documented.     |
| **A−**      | Strong; a few deliberate follow-ups; production-appropriate.                                                |
| **B+ / B**  | Solid; recurring patterns work; notable gaps in depth, coverage, or consistency.                            |
| **B− / C+** | Acceptable for early delivery; several categories need focused work before scaling users, revenue, or team. |
| **C / D**   | Fragile, inconsistent, or missing practice; **treat as pre-production** until improved or scoped down.      |

**Not comparable across domains** — “B in Security” and “B in UX” are judged against different failure modes; use the row descriptions below, not GPA-style averaging.

---

## Domain 1 — Security

### 1.1 Authentication & authorization (AuthN / AuthZ)

| Aspect            | What “good” looks like                                                                                               | Platform notes                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity**      | Password policies/hashing, MFA where appropriate, session or token lifetimes justified, refresh strategy defined.    | **Mobile:** tokens in **Keychain/Keystore** or hardened storage pattern—not dev-only AsyncStorage for high-sensitivity apps without threat modeling. |
| **Authorization** | Role/permission checks at **route + service** layers; object-level rules (e.g. “own resource”) enforced server-side. | BFF or API must not trust client claims.                                                                                                             |
| **Data exposure** | Serialized user/API objects **strip secrets** (`password`, refresh tokens, MFA seeds, internal ids if needed).       | Same for WebSocket payloads if used.                                                                                                                 |

### 1.2 Input validation

| Aspect          | What “good” looks like                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Coverage**    | Validators on **every** externally reachable input: JSON body, query, params, headers used for logic, multipart fields. |
| **Consistency** | Shared schema or validator modules; no one-off `if (!x)` sprinkled only in hot paths.                                   |
| **Errors**      | Field-level errors (`path` + `msg`); safe messages for clients; **no raw DB/driver errors** to clients in prod.         |

### 1.3 Secrets management

| Aspect       | What “good” looks like                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Startup**  | Required env vars validated **before** listening (fail fast).                                                                                                            |
| **Runtime**  | No secrets in VCS, screenshots, or client bundles; **mobile:** no prod API keys embedded for reversible billing keys—use server or provider SDK patterns as appropriate. |
| **Rotation** | Documented owners and cadence (see DevOps — Secrets & rotation).                                                                                                         |

### 1.4 Transport & headers

| Aspect          | What “good” looks like                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **TLS**         | HTTPS in all prod paths; HSTS where you control hostnames.                                                                           |
| **Headers**     | Security headers (CSP for web, appropriate `Trust-Proxy` / IP for rate limits), **CORS allow-list** (not `*` for credentialed APIs). |
| **Correlation** | **Request ID** end-to-end (header + logs + error body) for support and forensics.                                                    |

### 1.5 File uploads _(N/A if no user uploads)_

| Aspect         | What “good” looks like                                                                        |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Type truth** | Magic-byte / content sniffing vs extension; max size; virus scanning if threat model demands. |
| **Storage**    | Non-public buckets or signed URLs; least-privilege credentials.                               |

### 1.6 Payments & billing webhooks _(N/A if no payments)_

| Aspect                | What “good” looks like                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| **Webhook integrity** | Signature verification, idempotency store, clear status lifecycle (`received` → `processed` / `failed`). |
| **Failure modes**     | Provider misconfig returns **safe** HTTP codes; no double-charge on retries.                             |

### 1.7 PII & logging

| Aspect        | What “good” looks like                                                                |
| ------------- | ------------------------------------------------------------------------------------- |
| **Scrubbing** | Structured scrub of tokens, card-like patterns, emails in logs and error trackers.    |
| **Errors**    | Prod responses do not leak stack traces or internal messages; dev-only detail toggle. |

### 1.8 Client security _(Web, React Native, desktop)_

| Aspect     | What “good” looks like                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Web**    | CSP posture, XSS surfaces (HTML injection, `dangerouslySetInnerHTML`), third-party script risk.                                            |
| **Mobile** | Jailbreak/root **detection** only if required; deep links validated; certificate pinning **if** threat model requires (costly to operate). |
| **Shared** | No sensitive data in persistent logs on device; clipboard/timeouts for OTP flows considered.                                               |

---

## Domain 2 — Testing & quality

### 2.1 Test breadth

| Aspect         | What “good” looks like                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Layers**     | Unit tests for pure logic; middleware/utilities; **route-level** tests for high-blast-radius APIs; **critical UI** flows for client. |
| **Proportion** | High-risk domains (auth, money, permissions) disproportionately covered.                                                             |

### 2.2 Test depth / quality

| Aspect         | What “good” looks like                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Assertions** | Behavior-focused (status, envelope shape, side effects), not only “does not throw.”                |
| **Realism**    | Integration tests hit real HTTP stack and **test DB** or containers—not only mocks for everything. |

### 2.3 Test infrastructure & CI

| Aspect    | What “good” looks like                                                                        |
| --------- | --------------------------------------------------------------------------------------------- |
| **CI**    | Lint + tests + **build smoke** on every mainline PR; artifacts (coverage HTML/lcov) retained. |
| **Gates** | Coverage **thresholds** ratchet slowly upward—not “100% or bust.”                             |
| **Flake** | Retries documented; quarantine policy for flaky suites.                                       |

### 2.4 Linting & static analysis

| Aspect       | What “good” looks like                                                |
| ------------ | --------------------------------------------------------------------- |
| **Config**   | ESLint/TypeScript/Ruff/etc. checked in; same rules locally and in CI. |
| **Severity** | **0 errors**; warnings budget explicit if migrating legacy code.      |

### 2.5 Code hygiene / smells

| Aspect          | What “good” looks like                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| **Errors**      | Central error type + single error middleware (or equivalent) with stable `code` values. |
| **Duplication** | Cross-cutting concerns (pagination, auth, idempotency) implemented once and reused.     |

### 2.6 Build health

| Aspect      | What “good” looks like                                                          |
| ----------- | ------------------------------------------------------------------------------- |
| **Client**  | Release builds succeed; TypeScript strictness aligned with team pain tolerance. |
| **Backend** | Compiles; Docker images build in CI.                                            |

---

## Domain 3 — Architecture

### 3.1 Backend / service layering

| Aspect    | What “good” looks like                                                          |
| --------- | ------------------------------------------------------------------------------- |
| **Shape** | Controllers/handlers thin; **services/domain** own rules; data access isolated. |
| **Leaks** | Business rules not copy-pasted across 5 controllers.                            |

### 3.2 API consistency

| Aspect        | What “good” looks like                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------- |
| **Envelope**  | Consistent **success** and **error** JSON (or Protobuf) shapes; **pagination** helpers shared. |
| **Semantics** | Meaningful HTTP verbs/codes; idempotency keys where appropriate.                               |
| **Docs**      | OpenAPI/GraphQL schema **or** disciplined inline docs + examples.                              |

### 3.3 Data modeling

| Aspect        | What “good” looks like                                                                    |
| ------------- | ----------------------------------------------------------------------------------------- |
| **Integrity** | Indexes for real query patterns; constraints where DB supports them.                      |
| **Evolution** | Migration strategy (SQL migrations, migrate-mongo, Prisma, etc.) for non-toy deployments. |

### 3.4 Client architecture _(web and/or mobile)_

| Aspect         | What “good” looks like                                                            |
| -------------- | --------------------------------------------------------------------------------- |
| **UI system**  | Shared primitives (buttons, cards, dialogs/sheets) instead of duplicated styles.  |
| **Navigation** | Clear module boundaries; lazy loading / code splitting where bundle size matters. |
| **State**      | Predictable global vs local state; server cache strategy if applicable.           |

### 3.5 Cross-cutting concerns

| Aspect            | What “good” looks like                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| **Observability** | Request IDs, structured access logs, error tracking (Sentry etc.) with PII scrub. |
| **Consistency**   | Same patterns for logging, metrics, and user-facing error **codes**.              |

### 3.6 Deployment topology

| Aspect           | What “good” looks like                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dependencies** | Healthchecks: API waits for DB; reverse proxy waits for API; **mobile:** this maps to “release pipeline produces signed artifacts,” OTA policy if using Expo Updates. |
| **Hardening**    | Non-root containers; pinned base images; **app store** privacy manifests / permissions justified (mobile).                                                            |

---

## Domain 4 — UX, accessibility & performance

### 4.1 UX consistency

| Aspect       | What “good” looks like                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| **Patterns** | One confirmation pattern (not `window.confirm` + 3 custom modals); toasts/snackbars for async feedback. |
| **Copy**     | Errors actionable (“what failed / what to do next”).                                                    |

### 4.2 Accessibility

| Aspect     | What “good” looks like                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| **Web**    | Focus management in modals, `aria-*`, skip links, keyboard paths.                                       |
| **Mobile** | **React Native:** `accessibilityLabel`, touch target sizes, VoiceOver/TalkBack sanity on primary flows. |

### 4.3 Bundle / runtime performance

| Aspect     | What “good” looks like                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **Web**    | Code splitting, vendor chunks, lazy routes, image discipline.                                    |
| **Mobile** | Startup time, list virtualization, image sizing/caching; avoid shipping huge JS blobs to Hermes. |

### 4.4 Layout & responsiveness

| Aspect     | What “good” looks like                                                                       |
| ---------- | -------------------------------------------------------------------------------------------- |
| **Web**    | Responsive breakpoints; no unusable states at mobile widths.                                 |
| **Mobile** | Tablet / foldable layouts if in scope; safe areas—not graded if deliberately phone-only MVP. |

### 4.5 Error UX

| Aspect       | What “good” looks like                                      |
| ------------ | ----------------------------------------------------------- |
| **Support**  | **Request ID** or trace id visible on error UI for tickets. |
| **Recovery** | Retry, refresh, or logout paths—not a dead end.             |

### 4.6 Internationalization (i18n) readiness

| Aspect       | What “good” looks like                                                      |
| ------------ | --------------------------------------------------------------------------- |
| **Baseline** | Strings centralized; ICU/interpolation planned; RTL considered if relevant. |
| **Reality**  | “D” is fine for single-locale MVPs if intentional.                          |

---

## Domain 5 — DevOps, reliability & documentation

### 5.1 CI / CD

| Aspect        | What “good” looks like                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Pipeline**  | Separate jobs per package; `npm ci` / lockfile-strict where applicable; concurrency cancel; least-privilege tokens. |
| **Promotion** | Staging/prod separation (even if manual deploy at first).                                                           |

### 5.2 Containers & process management _(N/A if serverless-only)_

| Aspect          | What “good” looks like                                |
| --------------- | ----------------------------------------------------- |
| **Docker**      | Healthchecks, non-root user, minimal images.          |
| **Compose/k8s** | Dependency order with health gates (DB → API → edge). |

### 5.3 Logging & tracing

| Aspect          | What “good” looks like                                                     |
| --------------- | -------------------------------------------------------------------------- |
| **Structure**   | JSON or parseable fields; levels used consistently.                        |
| **Correlation** | requestId in access + error logs; trace propagation if microservices grow. |

### 5.4 Health, audit & compliance _(scope-dependent)_

| Aspect       | What “good” looks like                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Liveness** | `/health` or platform equivalent; synthetic checks optional.                                                          |
| **Audit**    | Mutable sensitive actions leave an **append-only** or versioned trail when needed (admin actions, billing overrides). |

### 5.5 Database operations

| Aspect         | What “good” looks like                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| **Migrations** | Repeatable, documented rollback posture.                                         |
| **Backups**    | RPO/RTO stated; restore **tested** once in a while—not only “we enable backups.” |

### 5.6 Docs & onboarding

| Aspect     | What “good” looks like                                                |
| ---------- | --------------------------------------------------------------------- |
| **README** | How to run locally in <15 minutes for a new dev.                      |
| **Ops**    | Env matrix, third-party setup (Stripe, push, email), troubleshooting. |

### 5.7 Dependency hygiene

| Aspect                    | What “good” looks like                                                                                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pins**                  | `engines` / lockfiles; CI uses locked installs.                                                                                                                                                                                                                  |
| **Risk**                  | Advisory audits or Dependabot/Renovate; critical CVEs addressed with SLA.                                                                                                                                                                                        |
| **Mobile / Expo cadence** | Documented upgrade rhythm (e.g. quarterly): `npx expo install expo@latest && npx expo install --fix`, then `validate` (typecheck + lint + test). **Expo Go on physical devices tracks the latest SDK only** — plan upgrades before devs hit SDK mismatch errors. |
| **Evidence**              | Report card cites `package.json` + lockfile date, not a static “SDK XX” label in README/rubric.                                                                                                                                                                  |

### 5.8 Secrets & rotation _(ties to 1.3)_

| Aspect         | What “good” looks like                                            |
| -------------- | ----------------------------------------------------------------- |
| **Process**    | Rotation playbook (Stripe keys, JWT signing keys, API keys).      |
| **Automation** | Secret manager integration when team > 1–2 or compliance demands. |

---

## Mapping: Start Right report card → this rubric

Your Start Right columns map cleanly:

| Your row                       | Rubric section |
| ------------------------------ | -------------- |
| Security — AuthN / AuthZ       | §1.1           |
| Security — Input validation    | §1.2           |
| Security — Secrets management  | §1.3 + §5.8    |
| Security — Transport & headers | §1.4           |
| Security — File uploads        | §1.5           |
| Security — Payments security   | §1.6           |
| Security — PII / logging       | §1.7           |
| Security — Frontend security   | §1.8           |
| Testing & quality — _all rows_ | Domain 2       |
| Architecture — _all rows_      | Domain 3       |
| UX/a11y/perf — _all rows_      | Domain 4       |
| DevOps/docs — _all rows_       | Domain 5       |

---

## Platform baseline snapshot

Capture once per grading cycle (update when dependencies change):

```markdown
## Platform baseline — YYYY-MM-DD

| Item                      | Version / evidence                              |
| ------------------------- | ----------------------------------------------- |
| Expo SDK                  | _(from `expo` in package.json)_                 |
| React Native              | _(from package.json)_                           |
| Node (engines + CI)       | _(from package.json / CI config)_               |
| Last `expo install --fix` | _(date + PR link)_                              |
| Lockfile                  | _(commit SHA of package-lock.json / yarn.lock)_ |
| Expo Go compatibility     | _(device vs simulator notes)_                   |
```

---

## Blank report card template

Copy from the pipe table below. Replace `APP_NAME` and dates; use **N/A** freely.

```markdown
# Report Card — APP_NAME — YYYY-MM-DD

## Platform baseline

_(Paste snapshot table from [Platform baseline snapshot](#platform-baseline-snapshot).)_

## Executive summary

**Top 3 strongest areas**

1. …
2. …
3. …

**Top 2 next investments**

1. …
2. …

---

| Domain & Subcategory                      | Old | New | Evidence of improvement (or reason for no change) |
| ----------------------------------------- | --- | --- | ------------------------------------------------- |
| **Security — AuthN / AuthZ**              |     |     |                                                   |
| **Security — Input validation**           |     |     |                                                   |
| **Security — Secrets management**         |     |     |                                                   |
| **Security — Transport & headers**        |     |     |                                                   |
| **Security — File uploads**               |     |     |                                                   |
| **Security — Payments security**          |     |     |                                                   |
| **Security — PII / logging**              |     |     |                                                   |
| **Security — Client security**            |     |     |                                                   |
| **Testing — Breadth**                     |     |     |                                                   |
| **Testing — Depth / quality**             |     |     |                                                   |
| **Testing — Infra / CI**                  |     |     |                                                   |
| **Testing — Lint / static analysis**      |     |     |                                                   |
| **Testing — Code hygiene / smells**       |     |     |                                                   |
| **Testing — Build health**                |     |     |                                                   |
| **Architecture — Backend layering**       |     |     |                                                   |
| **Architecture — API consistency**        |     |     |                                                   |
| **Architecture — Data modeling**          |     |     |                                                   |
| **Architecture — Client architecture**    |     |     |                                                   |
| **Architecture — Cross-cutting concerns** |     |     |                                                   |
| **Architecture — Deployment topology**    |     |     |                                                   |
| **UX — Consistency**                      |     |     |                                                   |
| **UX — Accessibility**                    |     |     |                                                   |
| **UX — Bundle / runtime performance**     |     |     |                                                   |
| **UX — Responsive / adaptive layout**     |     |     |                                                   |
| **UX — Error UX**                         |     |     |                                                   |
| **UX — i18n readiness**                   |     |     |                                                   |
| **DevOps — CI / CD**                      |     |     |                                                   |
| **DevOps — Containers / process**         |     |     |                                                   |
| **DevOps — Logging & tracing**            |     |     |                                                   |
| **DevOps — Health & audit**               |     |     |                                                   |
| **DevOps — Database ops**                 |     |     |                                                   |
| **DevOps — Docs & onboarding**            |     |     |                                                   |
| **DevOps — Dependency hygiene**           |     |     |                                                   |
| **DevOps — Secrets & rotation**           |     |     |                                                   |
```

---

## Snapshot: KingVision Fitness (2026-05) — example N/A and focus rows

_Informal spot-check only; re-grade with evidence when you run the full process._

- **Likely focus early:** §2.3 CI, §2.1–2.2 tests, §1.8 mobile token storage hardening (AsyncStorage vs Keychain if threat model requires), §3.2 API docs parity with `/api/docs` mention, §5.1 pipeline presence.
- **Likely strong already:** Express + TS backend with helmet/CORS/rate limit; JWT + refresh story; Socket.io; structured API routes (`server.ts` mounting).

Use this file as the **single source of truth** for grading; fork it into each product repo if you want repo-specific weighting (e.g. fintech ups §1.6 and §5.8).
