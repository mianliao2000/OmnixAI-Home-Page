# Repository workflow

This repository owns only the public homepage and account UI. Do not copy module
business logic or credentials here. Commit completed changes on main; contributors
use branches and CI review before merging. Main publishes only the Home Page service.
Run `npm run check:contract`, `npm test`, `npm run build`, and `npx playwright test`.
Do not change existing platform URLs or account/billing contracts implicitly.
