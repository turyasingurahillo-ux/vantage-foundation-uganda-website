# Contributing to Vantage Foundation Uganda Website

Thank you for helping improve Vantage Foundation Uganda's digital infrastructure.

## Development workflow

1. Create a short-lived branch from `main`.
2. Make the smallest coherent change needed.
3. Run the relevant quality checks locally.
4. Open a pull request and explain the purpose, scope, testing performed, and any deployment or content implications.
5. Do not merge until required checks and review are complete.

## Quality checks

Before opening a pull request, run as applicable:

```bash
npm install
npm run lint
npm run type-check
npm run validate-content
npm test
```

For user-facing or routing changes, also run the relevant Playwright tests.

## Content, safeguarding, and privacy

Vantage works with communities and may handle sensitive information. Contributors must:

- avoid committing personal, beneficiary, donor, applicant, case-management, or safeguarding information unless it is explicitly approved for publication;
- use only media with the required consent and publication status;
- avoid publishing private operational email addresses or other protected contact details;
- follow the repository's safeguarding, consent, editorial, and media guidance.

## Secrets and credentials

Never commit production credentials, API tokens, private keys, passwords, database connection strings, or `.env.local` files. Use environment variables in the deployment platform and placeholders in `.env.example`.

If you believe a secret has been committed, do not open a public issue. Follow `SECURITY.md`.

## Pull requests

Pull requests should be focused and reviewable. Include screenshots for meaningful UI changes and identify any database migrations, environment-variable changes, security considerations, or follow-up work.

## Ownership

Until the repository is transferred to the Vantage Foundation Uganda GitHub organization, final repository ownership remains with the current administrative account. After transfer, organization teams and CODEOWNERS should replace individual ownership where appropriate.
