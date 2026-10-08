# Platform account API v1

The browser calls same-origin routes. The gateway sends identity operations to
Library and `/api/v1/billing/*` to Console. OAuth begins at Library; its registered
provider callback URLs remain unchanged. Allowed return origins are exactly the
five HTTPS origins in `platform-v1.json`; queries and fragments are preserved.

`GET /api/auth/providers` returns configured providers. `GET /api/auth/session`
returns `{user, csrfToken}` with `Cache-Control: private, no-store`. Anonymous or
revoked sessions return `user:null`. An authenticated user contains the original
provider subject `id`, stable `accountId`, device `sessionId`, verified provider
email, display name, picture, `authenticatedAt` (epoch seconds), `loginProvider`
and `status` (`active` or deletion recovery `deleting`). No provider tokens enter
the browser. Sessions are opaque, revocable, 30-day tokens; legacy signed cookies
are rejected and require one new login. Demo access never authenticates an account.

All writes require an allowed Origin and the session-specific `X-CSRF-Token`.
Failures are JSON with an `error` and optional `message`: 401 authentication,
403 Origin/CSRF, 400 invalid input, 409 conflict, 503 unavailable/incomplete.

| Method and path under `/api/account/v1` | Contract |
|---|---|
| GET /profile | `{user}` |
| PATCH /profile | `{name}`; cannot modify provider email |
| GET /identities | `{identities:[{id,provider,email}]}` |
| POST /identities/link | `{provider}` → Library OAuth URL with one-use device-bound intent |
| DELETE /identities/:id | Reject last method or identity owned by another account |
| GET /sessions | Active devices with timestamps and `current` |
| DELETE /sessions/:id | Revoke only an owned device, clear cookie if current |
| POST /logout | `{}` current device; `{allDevices:true}` every device |
| GET /deletion/preflight | `{blockers:[{module,code,message,url}],notice}`; fail closed if a module is unavailable |
| GET /deletion | Status, operation ID and per-service steps |
| POST /deletion | `{confirmation:verifiedEmail}`; recent authentication required; repeat safely resumes the operation |

Deletion checks projects, team ownership, Library history/tasks/source files,
reserved credits, active subscriptions and unpaid invoices. It blocks new work,
drains existing writes, and checks again before deleting profile data. A new
blocker before any service deletion unlocks the account for cleanup. Failed module
processing remains visibly incomplete and supports same-account reauthentication
and retry. Financial owner tombstones and identity revocation markers remain.
Verification records without account ownership are outside this deletion contract.

Console's SSO exchange binds its existing local session to account/device IDs and
validates the authority on protected requests. Google subjects preserve original
Console user and Stripe IDs. Legacy non-Google identities incorrectly labeled
Google require the previous revocable Console device session as ownership proof;
ambiguous mappings return 409 instead of merging by email. Administrative resolution
is required if that device session is unavailable.

Billing retains Console's existing owner checks, ledger and Stripe idempotency.
Bootstrap `/api/v1/auth/session` and `/api/v1/auth/sso/exchange` for the host-specific
Console CSRF/session binding. Summary, ledger, invoices, checkout and Portal remain
under `/api/v1/billing`, including optional `projectId`. Checkout sends an
`Idempotency-Key`. Payment/Portal returns go to `/account/billing` with their query.
Never replace a failed billing request with a demo balance.

Runtime constraint: current Console is one Uvicorn process and Library one threaded
authority process with persistent SQLite. Resource/deletion gates drain requests
within these deployments. Scale-out requires distributed gates before enabling
multiple authority or Console writers.
