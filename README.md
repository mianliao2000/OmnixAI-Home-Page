# OmnixAI Home Page

Independent React/TypeScript/Vite frontend for https://omnixai.biz. Console,
Library, and Verification remain independently maintained applications.

## Development

Node 24: `npm ci`, then `npm run dev` → http://127.0.0.1:5174.
Console stays on 5173. Development API proxies default to Library 8765 and
Console backend 8000; override with HOME_AUTH_PROXY/HOME_CONSOLE_PROXY.
VITE_CONSOLE_ORIGIN may point navigation to the local Console. OAuth callbacks
stay on Library's HTTPS origin; development uses isolated test identities and
fixtures, never production credentials or cookies.

## Ownership and collaboration

Edit this repo for homepage appearance, navigation and account pages. Contract:
`contracts/platform-v1.json`. Backend account changes belong to Component Library;
projects/EDA/billing remain in Engineering Console. Review is Verification at
https://verification.omnixai.biz/. Layout retains https://pcb.omnixai.biz/.
Give homepage contributors access only to this repository. CI must pass before
merging main. The public repo contains no runtime secrets or private module data.

## Release and rollback

Main runs CI, builds an immutable Artifact Registry image, validates a tagged
Cloud Run candidate, and promotes only the current main commit. Deployment uses
OIDC with resource-scoped permissions; it has no VM/SSH, backend, or secret access.
Repository variables: GCP_WORKLOAD_IDENTITY_PROVIDER and GCP_DEPLOY_SERVICE_ACCOUNT.
Service: omnixai-home-page, project project-783f678d-77b6-459e-847, region us-west1.

The GCE gateway owns domain and API routing. Home deployments never rewrite it.
`/health/home-ready` checks the independent homepage; `/health/ready` preserves
the existing Console readiness endpoint. Roll back with an administrator:
`gcloud run services update-traffic omnixai-home-page --region us-west1 --project project-783f678d-77b6-459e-847 --to-revisions PREVIOUS_REVISION=100`.

## Source provenance

Initial homepage component, cascade-selected CSS and five brand assets were
extracted from mianliao2000/OmnixAI commit
8f870e803ed24d82c9dc438842d15278991c4991 (Engineering Console). Omnix AI brand
assets remain copyright Omnix AI, all rights reserved. Encode Sans is installed
from @fontsource under its bundled SIL Open Font License. No KiCad, EDA, generation
engine, verification source, server environment or database is included.
