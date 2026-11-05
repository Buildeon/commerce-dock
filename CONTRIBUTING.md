# Contributing to Commerce Dock

Thank you for your interest in contributing to **Commerce Dock**, the sovereign, self-hosted operations launcher and zero-knowledge vault for composable commerce, AI sidecars, and cloud infrastructure.

Commerce Dock is open source under the **Apache 2.0 License**. We welcome contributions from developers, security researchers, and commerce architects who value operator sovereignty, privacy, and infrastructure hardening.

---

## 1. Core Operating Principles

Every contribution must align with Commerce Dock's core tenets:

1. **Zero-Knowledge by Design**: Master passwords and encryption keys never leave the operator's browser. Secrets are encrypted client-side with AES-256-GCM and non-extractable keys.
2. **Zero Telemetry & GDPR Compliance**: No tracking scripts, analytics beacons, external CDN dependencies, or external font loaders. Everything runs locally and sovereignly.
3. **Defense-in-Depth**: Strict SSRF validation on health probes, non-root container runtimes, loopback-default port bindings, and defensive HTTP security headers.
4. **Issue-First Engineering**: Every code change must begin with an issue to discuss design, threat model, and UX impact before submitting a Pull Request.

---

## 2. Issue-First Workflow (Mandatory)

To ensure clear architecture alignment and maintain an auditable changelog, **every Pull Request must be linked to an existing GitHub Issue**.

1. **Check Existing Issues**: Search the [issue tracker](https://github.com/Buildeon/commerce-dock/issues) before opening a new one.
2. **File an Issue First**:
   - For bug reports: clearly document reproduction steps, browser/runtime environment, and expected behavior.
   - For feature requests or architecture proposals: outline the use case, security threat model, and potential UX impact.
3. **Wait for Discussion / Triage**: Collaborate with maintainers to align on implementation details.
4. **Branch & Implement**: Branch off `main` with a descriptive name (e.g. `feat/issue-12-adapter-health` or `fix/issue-15-iv-generation`).
5. **Reference the Issue in your PR**: Always include `Closes #<issue-number>` or `Fixes #<issue-number>` in the PR description.

---

## 3. Commit Message Conventions

We adhere to the Conventional Commits specification. Commits should be atomic, descriptive, and categorized:

- `sec(vault)`: Cryptographic, secret-handling, or key derivation updates.
- `sec(ssrf)`: SSRF defense, IP validation, or outbound network controls.
- `sec(container)`: Dockerfile, non-root privileges, compose bindings, or security headers.
- `feat(ops)`: New operational presets, adapter monitors, or stack export capabilities.
- `fix(...)`: Bug fixes and defect corrections.
- `chore(compliance)`: License, privacy, or policy updates.
- `chore(tooling)`: Linter, TypeScript, build scripts, or dependency updates.
- `test(...)`: Unit, integration, or cryptographic test additions.
- `docs(...)`: README, deployment guides, or architecture documentation.

---

## 4. Local Development & Verification

### Prerequisites
- Node.js 20.x or 22.x LTS
- npm 10.x+
- Docker Engine & Docker Compose (for container testing)

### Setup
```bash
git clone https://github.com/Buildeon/commerce-dock.git
cd commerce-dock
npm install
```

### Running Tests and Quality Audits
Before opening or updating a PR, verify all checks pass locally:

```bash
# 1. Run cryptographic and SSRF test suite
npm test

# 2. Run ESLint and compliance check (validates GDPR zero-telemetry and anchor security)
npm run lint

# 3. Verify TypeScript typings without emitting JavaScript
npm run typecheck

# 4. Verify stack preset integrity and asset builds
npm run build
```

---

## 5. Security & Cryptographic Guidelines

When touching vault or networking logic, you must adhere to these rules:

1. **Key Derivation (PBKDF2)**: Always use at least 600,000 iterations of PBKDF2 with SHA-256 and a 16-byte cryptographically random salt (`crypto.getRandomValues(new Uint8Array(16))`).
2. **IV Uniqueness**: Never reuse an IV. Generate a fresh, random 12-byte IV (`crypto.getRandomValues(new Uint8Array(12))`) for every single encryption call.
3. **Non-Extractable Keys**: Set `extractable: false` when importing or deriving CryptoKeys to prevent in-memory exfiltration.
4. **SSRF Guardrails**: Outbound probes must use `CommerceDockSSRF.validateUrl()` to block cloud IMDS (`169.254.169.254`), loopbacks (`127.0.0.0/8`, `::1`), private subnets (RFC 1918), and encoded IP representations.
5. **Zero Secret Leakage in Telemetry**: Any export function (e.g. MCP stack context, pulse topology) must pass through `CommerceDockPulse.sanitizeTopology()` to strip credentials and tokens.

---

## 6. Styleguide & Documentation Rules

- **Documentation Tone**: Concise, technical, and objective.
- **Punctuation Standard**: Avoid em dashes in documentation and marketing copy per company styleguide. Use standard hyphens, colons, or parentheses instead.
- **Code Formatting**: 2 spaces indentation, single quotes, no unnecessary external npm dependencies. Maintain zero runtime dependencies for the front-end core.

---

## 7. Security Disclosures

If you discover a security vulnerability in Commerce Dock, please do not file a public GitHub issue. Refer to [SECURITY.md](SECURITY.md) for our coordinated disclosure process and reporting email.
