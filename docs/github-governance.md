# GitHub Governance and Nonprofit Migration

This document defines the target GitHub operating model for Vantage Foundation Uganda.

## 1. Target ownership model

The website repository should ultimately be owned by a dedicated Vantage Foundation Uganda GitHub organization rather than an individual's account.

Recommended organization structure:

- **Owners:** keep this group small (normally 2–3 trusted organizational administrators). Owners manage organization settings, billing, security, repository transfers, and emergency access.
- **Maintainers / Engineering:** trusted people who can review and merge technical work without receiving full organization-owner access.
- **Contributors:** developers, volunteers, interns, or contractors working through branches and pull requests.
- **Content/Programme contributors:** use the website's approved content/admin workflows where possible instead of broad repository write access.

Use named individual GitHub accounts. Do not share one password among staff or volunteers.

## 2. Repository migration

After the Vantage organization is created and verified:

1. Add at least two trusted organization owners.
2. Enable two-factor authentication for privileged users and organization-wide enforcement when practical.
3. Transfer `vantage-foundation-uganda-website` from `turyasingurahillo-ux` to the Vantage organization.
4. Confirm the Vercel project remains linked and that production deployment still works.
5. Replace temporary individual CODEOWNERS entries with Vantage organization teams.
6. Review all collaborators and remove access that is no longer required.
7. Confirm repository visibility intentionally remains public or change it based on the Foundation's policy.

## 3. `main` branch protection / ruleset

Create an organization or repository ruleset targeting `main` with these baseline controls:

- require a pull request before merging;
- require at least 1 approval;
- require CODEOWNER review for sensitive paths where the team size allows it;
- dismiss stale approvals when new commits materially change a reviewed PR;
- require conversation resolution before merge;
- block force pushes and branch deletion;
- require the current CI checks to pass:
  - `Lint, type-check, unit tests`
  - `Production build`
  - `E2E accessibility (axe-core)`;
- allow bypass only for a very small emergency administrator group.

For a small nonprofit engineering team, one required approval is a pragmatic starting point. Increase to two approvals for authentication, donation, case-management, safeguarding, privacy, infrastructure, or security-sensitive changes once the reviewer pool is large enough.

## 4. Merge policy

Prefer **squash merge** for normal feature and maintenance pull requests so each PR lands as one coherent change on `main`. Keep merge commits or rebase merges available only if there is a clear project need.

Do not push routine feature work directly to `main`.

## 5. Security baseline

- Keep credentials in Vercel/GitHub/environment secret stores, never in the repository.
- Keep Dependabot enabled.
- Review dependency alerts regularly.
- Enable GitHub secret scanning and push protection where available.
- Enable private vulnerability reporting when available for the repository.
- Remove inactive collaborators promptly.
- Use least-privilege repository and organization roles.
- Rotate any credential that may have been exposed, even if it was later deleted from the current branch.

## 6. Public repository hygiene

A public nonprofit repository should contain enough information for an external reviewer to understand who owns it and how it is governed. Maintain:

- a clear README;
- contribution guidelines;
- security-reporting instructions;
- CODEOWNERS;
- issue and pull-request templates;
- a community code of conduct;
- clear copyright/licensing language;
- accurate organization and website links.

Avoid publishing internal case data, beneficiary records, donor records, credentials, private operational addresses, or unpublished safeguarding material.

## 7. GitHub for Nonprofits application readiness

Before applying, ensure the GitHub organization name and profile correspond with the Foundation's formal identity. Keep the nonprofit application evidence outside the public repository unless the Foundation has intentionally published it.

Prepare separately:

- the exact registered legal name;
- government-issued proof of nonprofit/non-governmental status;
- registration number and jurisdiction;
- official website;
- concise mission and programme description;
- an organization administrator authorized to manage the GitHub account.

Do not alter legal-name or registration details merely to match a preferred GitHub username. The application should follow the Foundation's actual legal documentation.

## 8. Review cadence

Review GitHub access, owners, repositories, deployment integrations, open security alerts, and stale branches at least quarterly and whenever a staff member, contractor, or volunteer with repository access changes role or leaves.
