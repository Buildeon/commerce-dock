# Security Policy & Cryptographic Threat Model

The security of Commerce Dock is central to our mission of providing sovereign, self-hosted operations cockpits for composable commerce and autonomous AI agent stacks.

---

## 1. Supported Versions

Security updates and vulnerability patches are actively maintained for the following versions:

| Version | Supported | Security Maintenance |
| :--- | :--- | :--- |
| `1.1.x` | Yes | Active maintenance and security patches |
| `1.0.x` | Yes | Legacy migration to version 2 envelope supported |
| `< 1.0` | No | Upgrade to latest version recommended |

---

## 2. Cryptographic Architecture (OWASP ASVS Level 2)

Commerce Dock implements a client-side Zero-Knowledge Vault engine based on the W3C Web Crypto API standard:

```
[ Master Password ]
        |
        v
[ PBKDF2 Key Derivation ] <--- 16-byte Cryptographic Salt (crypto.getRandomValues)
  - Hash: HMAC-SHA256
  - Iterations: 600,000 rounds
  - Non-Extractable CryptoKey: true
        |
        v
[ AES-256-GCM Symmetric Cipher ] <--- Unique 12-byte IV per encryption operation
        |
        v
[ Version 2 Envelope Storage ]
  - Base64 binary serialization
  - Zero plaintext transmission
```

### Cryptographic Parameters
* **Key Derivation Function (KDF):** Web Crypto `PBKDF2` using `SHA-256` with **600,000 iterations**, matching OWASP Password Storage and ASVS Level 2 guidelines.
* **Salt Management:** A cryptographically random **16-byte salt** (`crypto.getRandomValues(new Uint8Array(16))`) is generated on initialization. Salts are never hardcoded and are stored inside the encrypted envelope.
* **Non-Extractable Symmetric Keys:** When calling `crypto.subtle.deriveKey(...)` and `importKey(...)`, keys are marked `extractable: false` so browser extensions or injected scripts cannot export raw symmetric key bits from memory.
* **Strict IV Uniqueness:** Every encryption operation generates a unique, non-repeating **12-byte IV** (`96 bits`). Reusing an IV with AES-GCM destroys confidentiality; Commerce Dock prevents IV reuse by enforcing fresh random generation on every edit.
* **Backward Migration:** Legacy version 1 vaults (100,000 iterations) are automatically upgraded to version 2 envelopes (600,000 iterations) upon successful unlock.
* **Inactivity Auto-Lock:** Memory keys are flushed after **5 minutes** of inactivity or when the browser tab is hidden for longer than the timeout period.
* **Clipboard Scrubbing:** Plaintext credentials copied to the system clipboard are scrubbed with empty strings after **20 seconds**.

---

## 3. Server-Side Request Forgery (SSRF) Mitigations

Commerce Dock includes a dedicated URL security engine (`CommerceDockSSRF`) that validates all outbound URLs before health checks or webhook probes:

1. **Protocol Restriction:** Only `http:` and `https:` schemes are permitted. Dangerous protocols (`file:`, `ftp:`, `gopher:`, `javascript:`, `data:`) are rejected immediately.
2. **Cloud Metadata IP Blocking:** Outbound requests to `169.254.169.254` (AWS, GCP, Azure IMDS) and `metadata.google.internal` are strictly blocked.
3. **Loopback & Private Network Filtering:** IP ranges including `127.0.0.0/8`, `::1`, `localhost`, `0.0.0.0`, `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16` are blocked by default unless explicitly allowlisted via `allowedHosts`.
4. **Obfuscation Defense:** Decimal dword integer IPs (`http://2130706433/`), hex IPs (`http://0x7f000001/`), and octal IPs are normalized and evaluated as 32-bit unsigned integers before resolution.
5. **No Open HTTP Redirects:** Health checks enforce `redirect: "error"` to stop open redirects from bypassing IP validation.
6. **Zero Body Exposure:** Health checks never return raw HTTP response bodies to client state, returning only `{ online, statusCode, latencyMs, checkedAt }`.

---

## 4. Container & Ingress Hardening

* **Non-Root Container Execution:** Docker runtime executes under unprivileged user `USER nginx` (UID 101). Capabilities are restricted using `setcap cap_net_bind_service=+ep /usr/sbin/nginx`.
* **Localhost Port Binding:** Default `docker-compose.yml` binds to `127.0.0.1:8089` rather than `0.0.0.0:8089`, ensuring Docker does not bypass host `ufw`/`iptables` firewall rules.
* **No Docker Socket Mounting:** `/var/run/docker.sock` is never mounted into the web container.
* **HTTP Security Headers:**
  * `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';`
  * `Referrer-Policy: no-referrer`
  * `X-Frame-Options: DENY`
  * `X-Content-Type-Options: nosniff`
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 5. Recommended Zero-Trust Ingress Topologies

Commerce Dock is designed to be accessed through an authenticated Zero-Trust network layer:

1. **Cloudflare Zero Trust Access:** Enforce corporate identity provider (OIDC, Google Workspace, Azure AD, Okta) or One-Time PIN before requests hit the origin.
2. **Tailscale / WireGuard Mesh:** Run the container on an internal private tailnet without public internet exposure.
3. **Traefik Dynamic Ingress:** Enforce IP allowlists (`local-only` middleware) and Let's Encrypt TLS certs.

---

## 6. Coordinated Vulnerability Disclosure

If you discover a security vulnerability within Commerce Dock, please report it responsibly:

* **Security Contact:** `hey@buildeon.solutions`
* **GitHub Private Vulnerability Reporting:** Submit an advisory via the [Security Advisory page](https://github.com/Buildeon/commerce-dock/security/advisories/new).
* **Response SLA:** We acknowledge vulnerability reports within 24 hours and aim to release validated patches within 72 hours.
