# Commerce Dock

> **Sovereign Operations Launcher, Stack Hub, and Zero-Knowledge Client-Side Vault for Composable Commerce & AI Fleets.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker Image](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](Dockerfile)
[![Zero-Knowledge](https://img.shields.io/badge/Crypto-Web%20Crypto%20AES--256--GCM-green)](src/js/vault.js)
[![Zero Backend](https://img.shields.io/badge/Compute-Zero%20Backend-purple)](#architecture)

Commerce Dock is an open-source, client-side operations dashboard and credential vault built for engineering teams, agency founders, and omnichannel retailers. It consolidates your fragmented ecosystem across commerce engines, ERP/OMS backends, AI routers, analytics, and marketing automation into a single responsive launchpad.

Every administrative URL, staging environment, and production console is accessible in one click with zero credential copy-paste friction, protected by an in-browser Zero-Knowledge cryptographic vault.

---

## The Critical Security Problem: Why Browser Password Saving Is Broken

Engineering teams frequently manage dozens of staging, production, and demo credentials across headless storefronts, PIMs, and microservices. The default developer habit is saving these logins inside Chrome, Edge, or Firefox password managers. **This practice is fundamentally insecure.**

### 1. Infostealer Proliferation (LummaC2, RedLine, Vidar, Stealc)
Modern browser password managers store website credentials in local SQLite databases (e.g., `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data`). While Chrome encrypts individual entries with an AES-256 key, that master key is stored in the `Local State` file protected only by the Windows Data Protection API (`DPAPI`).

- Any unprivileged user-level process running on the host machine can invoke `CryptUnprotectData` to instantly decrypt the browser master key.
- According to 2024-2026 cybersecurity threat intelligence reports from Mandiant, Group-IB, and Recorded Future, infostealer malware accounted for over 58% of all corporate credential leaks, with billions of saved browser passwords siphoned in automated sub-second background scripts.

### 2. The Malicious Node / npm Dependency Injection Vector
Developers are uniquely vulnerable through their package ecosystems. When installing open-source repositories or running build scripts:
- Malicious npm packages execute unauthorized `postinstall` shell scripts.
- As documented in security research and real-world incident analyses (including disclosures across repositories such as `The-malware-museum`), attackers inject silent reconnaissance modules that harvest local browser `Login Data`, `Cookies`, SSH private keys, and `.env` files, immediately exfiltrating them via encrypted HTTP webhooks.
- If your commerce staging or production passwords are saved in your default browser profile, a single compromised npm dependency compromises your entire enterprise fleet.

---

## The Commerce Dock Solution: Zero-Knowledge Browser Vault

Commerce Dock eliminates browser password manager vulnerability through client-side Web Crypto primitives:

1. **PBKDF2 Key Derivation**: When you supply your master password, Commerce Dock derives an ephemeral 256-bit cryptographic key using `PBKDF2` with HMAC-SHA256 and **100,000 iterations** alongside a cryptographically random salt.
2. **AES-GCM (256-bit) Encryption**: All sensitive credentials (usernames, tokens, passwords) are encrypted and decrypted in browser memory using AES-GCM with a fresh 96-bit Initialization Vector (IV) per operation.
3. **Zero Server Computation**: Commerce Dock is a 100% static application. There is no backend database, no login API, and no telemetry tracking your secrets. Cryptographic keys exist strictly in volatile RAM and are flushed immediately upon locking the vault or closing the browser tab.
4. **Offline and Air-Gapped**: The vault functions completely offline. You can export an encrypted JSON backup for git storage or local backup without exposing plaintext secrets.

---

## Key Features

- **1-Click Stack Launchpad**: Organize systems by categories: Commerce, Analytics, Automation, AI & LLM, Infrastructure, Marketing, and Inbound.
- **Multi-Environment Subplatforms**: Expand any tile to reveal instant links to Production, Staging, Admin Consoles, and direct database endpoints.
- **Multi-Tenant Presets**:
  - `demo.json`: Pre-configured public sandbox featuring OpenCart, Adobe Commerce (Magento 2), UnoPim, Bagisto, Umami Analytics, and Medusa v2.
  - `sharafdg.json`: Tailored GCC omnichannel preset featuring Akeneo Enterprise PIM, custom Laravel OMS (`dgoms.sharafdg.com`), multi-country storefronts, Algolia, and Grafana.
  - `buildeon-fleet.json`: Internal operational fleet preset for VPS staging clusters, Dokploy, Postiz, and n8n.
- **Brand Auto-Themer**: Enter any company domain (e.g. `uae.sharafdg.com` or `nike.com`) to extract brand colors and skin the entire cockpit dynamically. Presets can freeze their theme by setting `"allowThemeCustomizer": false`.
- **Cloudflare Zero Trust Access Ready**: Deploy behind Cloudflare Access or Traefik IP allowlists for zero-trust perimeter defense.

---

## Live Demo & Screenshots

- **Public Instant Demo**: [demo.buildeon.solutions/commerce-dock](https://demo.buildeon.solutions/commerce-dock)
- **Marketing & Product Overview**: [buildeon.solutions/products/commerce-dock](https://buildeon.solutions/products/commerce-dock/)
- **Default Demo Vault Master Password**: `buildeon-demo`

---

## Quickstart with Docker

Run Commerce Dock locally in 5 seconds using Docker:

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

## Static Hosting & Cloudflare Pages

Because Commerce Dock has **zero backend computation requirements**, you can host it for free on any static host or CDN:

### Deploy to Cloudflare Pages
1. Push your repository to GitHub or GitLab.
2. Connect your repo in the Cloudflare Dashboard under **Workers & Pages**.
3. Set build configuration:
   - **Framework Preset**: None (Static HTML)
   - **Build Output Directory**: `/` (or root)
4. Deploy. Your dock will be live on Cloudflare's edge network globally.

### Deploying Behind Cloudflare Zero Trust (Recommended Enterprise Architecture)
For maximum defense-in-depth:
1. Place your Commerce Dock domain behind **Cloudflare Zero Trust Access**.
2. Configure corporate Identity Provider authentication (Google Workspace, Microsoft Entra ID, or Email One-Time Pin).
3. The outer perimeter is guarded by corporate SSO with zero public port exposure; the inner operational credentials remain guarded by Commerce Dock's local client-side AES-256-GCM vault.

---

## Configuration & Custom Presets

Create your custom stack preset in `src/presets/my-company.json`:

```json
{
  "dockId": "my-enterprise-stack",
  "title": "Acme Corp Operations Dock",
  "subtitle": "Global Omnichannel Commerce & Cloud Infrastructure",
  "brand": {
    "name": "Acme Operations",
    "theme": "slate",
    "primaryColor": "#38bdf8",
    "secondaryColor": "#818cf8",
    "bgColor": "#0f172a",
    "allowThemeCustomizer": true
  },
  "services": [
    {
      "id": "acme-storefront",
      "name": "Acme Storefront",
      "category": "commerce",
      "badge": "Shopify Plus / Headless",
      "url": "https://store.acme.com",
      "status": "online",
      "description": "Production commerce storefront and catalog.",
      "icon": "🛍️",
      "credentials": {
        "username": "admin@acme.com",
        "hint": "Master password unlocks administrative access"
      },
      "subplatforms": [
        {
          "name": "Shopify Admin Console",
          "url": "https://admin.shopify.com/store/acme-store",
          "icon": "🔑",
          "description": "Inventory, orders, and promotions."
        },
        {
          "name": "Staging Storefront",
          "url": "https://staging.store.acme.com",
          "icon": "🧪",
          "description": "Pre-release build validation."
        }
      ]
    }
  ]
}
```

Load your preset via query parameter:
`http://localhost:8089/?preset=my-company`

---

## Technology Stack

- **Cryptographic Core**: Native Web Crypto API (`window.crypto.subtle`)
- **Key Derivation**: PBKDF2 (HMAC-SHA256, 100,000 iterations)
- **Encryption**: AES-GCM (256-bit, unique 96-bit IV)
- **Frontend**: Lightweight vanilla ES6 JavaScript (Zero npm runtime dependencies)
- **Styling**: Modern CSS3 with CSS variables and responsive glassmorphism
- **Container**: Minimal Alpine Nginx container (< 25MB)

---

## Contributing & License

Contributions, presets for popular platforms, and security enhancements are warmly welcomed. Please open an issue or submit a pull request.

Distributed under the **MIT License**. Crafted with precision by [Buildeon Solutions](https://buildeon.solutions).
