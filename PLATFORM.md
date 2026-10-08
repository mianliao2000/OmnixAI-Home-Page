# Platform integration and operations

Home Page owns the public landing page, navigation and account UI. It does not
own business data, authentication secrets or module deployment. Contributors
can clone this repository alone, run `npm ci` and `npm run dev`, then submit a
branch and pull request. Main requires the `ci` check and publishes only Home.

## Stable interfaces

`contracts/platform-v1.json` is the versioned source for platform addresses and
account/billing routes. Change contracts explicitly with the affected backend
owners; run `npm run check:contract` and the matching checks in each repository.

| Module | Public entry | Backend ownership |
| --- | --- | --- |
| Home / account | https://omnixai.biz/ | Home UI; Library identity API |
| Console | https://console.omnixai.biz/console | Console projects, EDA and billing |
| Library | https://library.omnixai.biz/ | Library generation and shared identity |
| Verification / Review | https://verification.omnixai.biz/ | Verification |
| Layout | https://pcb.omnixai.biz/ | Existing Layout / Library service |

Account pages use `/account/profile`, `/account/security`, `/account/billing`
and `/account/privacy`. OAuth always starts at Library. Return destinations
are restricted to the canonical platform origins. The GCE gateway routes
same-origin `/api/account/v1/*` to Library and `/api/v1/*` to Console. No account
or billing secrets are present in Home's container.

Shared sessions are server-revocable. Logout revokes this device; logout-all
is separate. Modules refresh visible identity within 30 seconds and on focus.
Console checks the central session for each protected request. After the v2
session cutover, old signed login cookies require a fresh login; user projects,
Library ownership and Stripe mappings retain their original identities.

Stripe is intentionally unconfigured for this release. Purchase and Portal
buttons remain disabled, and the UI displays this state. Test-mode purchase,
subscription and invoice acceptance remains pending configuration. No demo
bills substitute for failed backend requests.

Account deletion requires cleared module blockers, recent authentication and
email confirmation. Failure is retryable and does not appear as success.
Verification records without account ownership are outside this deletion scope.

## Independent release and rollback

GitHub Actions builds an immutable image, publishes a candidate Cloud Run
revision, checks its Git SHA and promotes only the current main commit. OIDC
grants access only to the Home service, its registry and runtime identity.
The workflow has no VM/SSH, other module deployment or database permissions.

Production service: `omnixai-home-page`, region `us-west1`, project
`project-783f678d-77b6-459e-847`. `HOME_PUBLIC_SMOKE_ENABLED=true` makes releases
also check `https://omnixai.biz/health/home-ready`. `/health/ready` continues to
check Console. Gateway routing is maintained separately at
`/opt/omnixai/shared/Caddyfile` and survives Console releases.

An administrator can list revisions and restore a known healthy one:

```sh
gcloud run revisions list --service omnixai-home-page --region us-west1 --project project-783f678d-77b6-459e-847
gcloud run services update-traffic omnixai-home-page --region us-west1 --project project-783f678d-77b6-459e-847 --to-revisions HEALTHY_REVISION=100
```

Then check `/health/home-ready`, public navigation and account pages. Rolling
back Home does not restart the other modules. Backend rollback must retain the
persistent v2 session service; never re-enable the retired signed-cookie login
implementation after session migration. Backend data backups remain private
on the VM and outside this repository.

## Local development

Home uses 5174, Console frontend 5173, Console API 8000 and Library auth 8765.
`HOME_AUTH_PROXY` and `HOME_CONSOLE_PROXY` configure isolated local backends;
`VITE_CONSOLE_ORIGIN` changes only local Console navigation. A public preview
works without account services and clearly reports their unavailability.
Never use production credentials, database copies or browser cookies as local
identity fixtures.
