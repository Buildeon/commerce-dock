# Commerce Dock

> **Sovereign Operations Launcher, Stack Hub, and Zero-Knowledge Client-Side Vault for Composable Commerce & AI Fleets.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![CodeQL Security Analysis](https://github.com/Buildeon/commerce-dock/actions/workflows/codeql.yml/badge.svg)](https://github.com/Buildeon/commerce-dock/actions/workflows/codeql.yml)
[![Trivy Container Scan](https://github.com/Buildeon/commerce-dock/actions/workflows/trivy.yml/badge.svg)](https://github.com/Buildeon/commerce-dock/actions/workflows/trivy.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/Buildeon/commerce-dock/badge)](https://securityscorecards.dev/viewer/?run=github.com/Buildeon/commerce-dock)
[![Crypto: AES-256-GCM](https://img.shields.io/badge/Crypto-AES--256--GCM%20(600k%20PBKDF2)-brightgreen)](src/js/vault.js)
[![GDPR Ready](https://img.shields.io/badge/GDPR%20Ready-Zero%20Telemetry-success)](PRIVACY.md)
[![Zero-Trust Ready](https://img.shields.io/badge/Zero--Trust%20Ingress-Cloudflare%20%7C%20Tailscale-orange)](deployments/)

Commerce Dock is an open-source, client-side operations dashboard and credential vault built for engineering teams, agency founders, and omnichannel retailers. It consolidates your fragmented ecosystem across commerce engines, ERP/OMS backends, AI routers, analytics, and marketing automation into a single responsive launchpad.

Every administrative URL, staging environment, and production console is accessible in one click with zero credential copy-paste friction, protected by an in-browser Zero-Knowledge cryptographic vault.

---

## The Critical Security Problem: Why Browser Password Saving Is Broken

Engineering teams frequently manage dozens of staging, production, and demo credentials across headless storefronts, PIMs, and microservices. The default developer habit is saving these logins inside Chrome, Edge, or Firefox password managers. **This practice is fundamentally insecure.**

### 1. Infostealer Proliferation (LummaC2, RedLine, Vidar, Stealc)
Modern browser password managers store website credentials in local SQLite databases (e.g., `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data`). While Chrome encrypts individual entries with an AES-256 key, that master key is stored in the `Local State` file protected only by the Windows Data Protection API (`DPAPI`).

- Any unprivileged user-level process running on the host machine can invoke `CryptUnprotectData` to instantly decrypt the browser master key.
- Threat intelligence reports from Mandiant, Group-IB, and Recorded Future confirm that infostealer malware accounts for over 58% of all corporate credential leaks, with billions of saved browser passwords siphoned in automated sub-second background scripts.

### 2. The Malicious Node / npm Dependency Injection Vector
Developers are uniquely vulnerable through their package ecosystems:
- Malicious npm packages execute unauthorized `postinstall` shell scripts.
- As documented in real-world incident analyses across repositories such as `The-malware-museum`, attackers inject silent reconnaissance modules that harvest local browser `Login Data`, `Cookies`, SSH private keys, and `.env` files, immediately exfiltrating them via encrypted HTTP webhooks.
- If your commerce staging or production passwords are saved in your default browser profile, a single compromised npm dependency compromises your entire enterprise fleet.

---

## The Commerce Dock Solution: Zero-Knowledge Browser Vault (OWASP ASVS Level 2)

Commerce Dock eliminates browser password manager vulnerability through hardened client-side Web Crypto primitives:

1. **Hardened PBKDF2 Key Derivation:** When you supply your master password, Commerce Dock derives an ephemeral 256-bit cryptographic key using `PBKDF2` with HMAC-SHA256 and **600,000 iterations** alongside a cryptographically random 16-byte salt (meeting OWASP ASVS Level 2 recommendations).
2. **Non-Extractable CryptoKey:** Keys are generated with `extractable: false`, ensuring raw symmetric key bits cannot be exported from memory by browser extensions or third-party scripts.
3. **Strict IV Uniqueness:** All credentials (usernames, tokens, passwords) are encrypted using AES-GCM with a fresh, non-repeating 12-byte (96-bit) Initialization Vector on every single encryption operation.
4. **Zero Server Computation:** Commerce Dock is a static client application. There is no backend database, no login API, and zero telemetry tracking your secrets.
5. **Inactivity Auto-Lock:** In-memory keys are automatically wiped after **5 minutes** of inactivity or when the tab stays hidden.
6. **20-Second Clipboard Scrubbing:** 1-click credential copying automatically clears or scrubs the system clipboard after 20 seconds.
7. **Server-Blind `.cdvault` Export / Import:** Export and restore encrypted AES-256-GCM payloads for offline backups without ever transmitting plaintext secrets.

---

## Security & GDPR Compliance

Commerce Dock is built under strict privacy and security principles:

* **Zero Outbound Asset Requests (GDPR Article 25 & 32):** The application loads zero external fonts (Google Fonts), zero external CDN scripts (unpkg, jsdelivr), and zero external favicon resolvers. All assets are self-contained.
* **SSRF Protection Engine:** Built-in URL validation engine (`CommerceDockSSRF`) blocks Server-Side Request Forgery attempts against cloud metadata endpoints (`169.254.169.254`), loopback addresses (`127.0.0.0/8`, `localhost`), and unauthorized private subnets.
* **Non-Root Container Runtime:** Executes under unprivileged user `USER nginx` with restricted capabilities.
* **Localhost Port Binding by Default:** `docker-compose.yml` binds strictly to `127.0.0.1:8089` to prevent Docker from bypassing host `ufw`/`iptables` firewall rules.
* **Strict HTTP Security Headers:** Enforces `Content-Security-Policy: default-src 'self'`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.
* **Full Documentation:** Review our complete [SECURITY.md](./SECURITY.md) and [PRIVACY.md](./PRIVACY.md).

---

## AI Agent & MCP Stack Context

Commerce Dock includes built-in support for autonomous AI engineering and operations agents (OpenClaw, Hermes, Claude Code, Antigravity):

* **1-Click MCP Topology Manifest Export:** Click **🤖 MCP Stack** to generate a sanitized architecture topology (`stack-context.json` or Markdown).
* **Strict Security Guarantee:** The AI topology manifest strictly excludes all vault secrets, passwords, tokens, and hints, enabling safe context sharing with LLMs.
* **Commerce Pulse Adapters:** Modular health adapters for Medusa (`/health`), Meilisearch (`/health`), Umami (`/api/heartbeat`), and generic HTTP/HTTPS endpoints with SSRF guards.

---

## Multi-Tenant Presets

- `demo.json`: Pre-configured public sandbox featuring OpenCart, Adobe Commerce (Magento 2), UnoPim, Bagisto, Umami Analytics, and Medusa v2.
- `sharafdg.json`: Tailored GCC omnichannel preset featuring Akeneo Enterprise PIM, custom Laravel OMS (`dgoms.sharafdg.com`), multi-country storefronts, Algolia, and Grafana.
- `buildeon-fleet.json`: Internal operational fleet preset for VPS staging clusters, Dokploy Swarm, Postiz, and n8n.

---

## 1-Click Deployment Templates

Ready-to-use production orchestration templates are available in [`deployments/`](./deployments/):

* **[Dokploy](./deployments/dokploy/docker-compose.yml):** Automated Traefik ingress and Let's Encrypt TLS.
* **[Coolify](./deployments/coolify/docker-compose.yml):** Self-hosted PaaS with automated reverse proxying.
* **[Cloudflare Tunnel](./deployments/cloudflare-tunnel/docker-compose.yml):** Air-gapped ingress with zero open inbound WAN ports.

---

## Quickstart with Docker

Run Commerce Dock locally in 5 seconds:

```bash
# Clone the repository inside ~/projects/
cd ~/projects/Buildeon/
git clone https://github.com/Buildeon/commerce-dock.git
cd commerce-dock

# Launch container
docker compose up -d
```

Access the dashboard at `http://localhost:8089`.

---

## Development & Test Suite

Commerce Dock includes a comprehensive automated test and compliance suite:

```bash
# Install development dependencies
npm install

# Run unit test suite (Cryptographic Vault, SSRF Engine, Pulse Telemetry)
npm test

# Run TypeScript type verification
npm run typecheck

# Run GDPR compliance and security linting
npm run lint

# Verify build assets
npm run build
```

---

## Contributing & License

Contributions, presets for popular platforms, and security enhancements are warmly welcomed. Please review [SECURITY.md](./SECURITY.md) for vulnerability disclosure guidelines.

Distributed under the **Apache-2.0 License**. Crafted with precision by [Buildeon Solutions](https://buildeon.solutions).
