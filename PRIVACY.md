# Privacy Policy & Sovereign Data Architecture

Commerce Dock is built on a sovereign, client-side, zero-knowledge architecture. This document outlines our data privacy principles, zero-telemetry commitment, and alignment with the European Union General Data Protection Regulation (GDPR, Articles 25 and 32).

---

## 1. Core Privacy Commitments

* **100% Self-Hosted & Air-Gapped Capable:** Commerce Dock runs completely inside your own container infrastructure. No external dependencies, analytics brokers, or telemetry collectors are contacted.
* **Zero Telemetry Collection:** Buildeon Solutions does not collect, log, aggregate, or inspect your traffic, platform usage, service URLs, operational credentials, or company details.
* **Zero Outbound Asset Requests (GDPR Article 25):** The web application does not load third-party fonts (such as Google Fonts), third-party icons (such as favicon scraping APIs), or remote CDN scripts (such as unpkg or jsdelivr). All fonts utilize system font stacks, and icons use bundled SVGs or Unicode glyphs.
* **Zero Server-Side State:** All credential storage and encryption operations occur strictly within your browser's local Web Crypto engine.

---

## 2. Cryptographic Storage & Zero-Knowledge Model

* **Client-Side AES-256-GCM:** All passwords, usernames, and tokens entered into Commerce Dock tiles are encrypted using the Web Crypto API before being committed to your browser's local storage.
* **Key Derivation (PBKDF2):** Keys are derived from your Master Password using PBKDF2 with HMAC-SHA256 and 600,000 iterations (meeting OWASP ASVS Level 2 standards).
* **Non-Extractable Keys:** Derived cryptographic keys are marked as non-extractable in browser RAM to prevent script exfiltration.
* **Inactivity Auto-Lock:** In-memory cryptographic keys are automatically dropped after 5 minutes of inactivity or when the tab is backgrounded.
* **Clipboard Scrubbing:** Plaintext secrets copied to the operating system clipboard are automatically scrubbed after 20 seconds.

---

## 3. GDPR Compliance Matrix

| GDPR Article | Requirement | Commerce Dock Implementation |
| :--- | :--- | :--- |
| **Article 25(1)** | Data protection by design | Zero-knowledge cryptographic architecture; credentials never leave client browser memory in plaintext. |
| **Article 25(2)** | Data protection by default | Default container configuration binds strictly to loopback (`127.0.0.1:8089`). No telemetry or analytics tracking enabled. |
| **Article 32(1)(a)** | Pseudonymisation and encryption of personal data | Multi-tenant and internal passwords encrypted with AES-256-GCM using unique 12-byte IVs on every operation. |
| **Article 32(1)(b)** | Ongoing confidentiality, integrity, and resilience | Strict Content Security Policy (`default-src 'self'`), `Referrer-Policy: no-referrer`, and non-root container execution (`USER nginx`). |
| **Article 32(1)(d)** | Regular testing and security evaluation | Automated CodeQL static analysis, container image CVE scanning (Trivy), and OpenSSF Scorecard CI validation. |

---

## 4. Third-Party Webhook & Service Ingress

When using Commerce Dock to launch third-party services (such as Dokploy, Umami, Postiz, Akeneo, or Medusa), communication occurs directly between your client browser and the designated service endpoint. Commerce Dock does not intermediate, proxy, or inspect those connections.

To prevent Server-Side Request Forgery (SSRF) when configuring automated health checks or webhook notifications, Commerce Dock enforces strict URL validation that blocks access to internal cloud metadata endpoints (e.g. `169.254.169.254`) and unauthorized private IP ranges.

---

## 5. Contact & Privacy Inquiries

For any questions regarding Commerce Dock's sovereign privacy architecture or compliance standards, contact:

* **Email:** hey@buildeon.solutions
* **Website:** [https://buildeon.solutions](https://buildeon.solutions)
* **Security & Vulnerability Reporting:** See [SECURITY.md](./SECURITY.md)
