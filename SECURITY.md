# Security Policy

Security and privacy are important to Vantage Foundation Uganda, particularly because the platform includes administrative, donor, contact, media, and case-management functionality.

## Reporting a vulnerability

Please do **not** disclose suspected vulnerabilities, leaked credentials, private data, or exploitation details in a public GitHub issue, discussion, pull request, or social-media post.

Report security concerns through Vantage Foundation Uganda's official website contact form at https://www.vantagefoundationuganda.com and clearly mark the message **Security Vulnerability**. Include only the information needed for the maintainers to reproduce and assess the issue.

If credentials or personal information are exposed, avoid copying them into the report unless necessary. Describe where the exposure occurs instead.

## What to include

A useful report normally contains:

- the affected page, route, API, workflow, or component;
- the type and potential impact of the vulnerability;
- safe reproduction steps;
- whether personal data or credentials may be affected;
- any suggested remediation, if known.

## Supported code

The current production branch (`main`) is the supported version. Security fixes should normally be implemented through a dedicated branch and reviewed pull request, except where an urgent incident requires immediate credential rotation or deployment action.

## Secrets

Production secrets belong in approved deployment secret stores, not source control. If a credential is accidentally committed, treat it as compromised: revoke or rotate it, remove the exposed value from active code/configuration, and assess whether history remediation is required.
