/**
 * Commerce Dock — SSRF Protection & URL Security Engine
 * 
 * Protects against Server-Side Request Forgery (SSRF) and Client-Side Blind Probing
 * targeting:
 * - Cloud Provider Instance Metadata Services (AWS/GCP/Azure IMDS: 169.254.169.254, metadata.google.internal)
 * - IPv4 & IPv6 Loopback addresses (127.0.0.0/8, ::1, localhost, 0.0.0.0)
 * - IPv6 Link-Local addresses (fe80::/10)
 * - Private RFC 1918 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) unless explicitly allowlisted
 * - Alternative IP encodings (octal, hex, dword/decimal integer notation)
 * - Open HTTP Redirect Chaining (enforces redirect: "error")
 * - Response Exfiltration (sanitizes output; never returns raw HTTP response bodies)
 */

class SSRFSecurityError extends Error {
  constructor(message, targetUrl) {
    super(`[SSRF Blocked] ${message} Target: ${targetUrl}`);
    this.name = 'SSRFSecurityError';
    this.targetUrl = targetUrl;
  }
}

class CommerceDockSSRF {
  static get DEFAULT_TIMEOUT_MS() { return 5000; }

  // Blocked Hostnames and Cloud Metadata Domains
  static get BLOCKED_HOSTNAMES() {
    return new Set([
      'localhost',
      'metadata.google.internal',
      'metadata',
      'instance-data',
      'vault.internal',
      'docker.internal',
      'host.docker.internal'
    ]);
  }

  /**
   * Parse IPv4 address into a 32-bit unsigned integer to defeat hex/octal/dword obfuscation
   */
  static parseIPv4ToNumber(ipStr) {
    // Standard dotted decimal or single integer notation
    const parts = ipStr.split('.');
    if (parts.length === 1) {
      const num = Number(parts[0]);
      return (!isNaN(num) && num >= 0 && num <= 0xFFFFFFFF) ? num : null;
    }
    if (parts.length !== 4) return null;

    let dword = 0;
    for (let i = 0; i < 4; i++) {
      let partStr = parts[i].trim();
      let val;
      if (partStr.startsWith('0x') || partStr.startsWith('0X')) {
        val = parseInt(partStr, 16);
      } else if (partStr.startsWith('0') && partStr.length > 1) {
        val = parseInt(partStr, 8);
      } else {
        val = parseInt(partStr, 10);
      }
      if (isNaN(val) || val < 0 || val > 255) return null;
      dword = (dword << 8) | val;
    }
    return dword >>> 0;
  }

  /**
   * Check if an IPv4 integer falls in forbidden IP ranges
   */
  static isForbiddenIPv4(dword) {
    const unsignedDword = dword >>> 0;

    // 0.0.0.0/8 (Broadcast/Current network)
    if (((unsignedDword & 0xFF000000) >>> 0) === 0x00000000) return 'Current Network (0.0.0.0/8)';

    // 127.0.0.0/8 (Loopback)
    if (((unsignedDword & 0xFF000000) >>> 0) === 0x7F000000) return 'Loopback IP (127.0.0.0/8)';

    // 169.254.0.0/16 (Link-Local / Cloud Instance Metadata Services AWS/GCP/Azure)
    if (((unsignedDword & 0xFFFF0000) >>> 0) === 0xA9FE0000) return 'Cloud Metadata / Link-Local IP (169.254.0.0/16)';

    // 10.0.0.0/8 (RFC 1918 Private)
    if (((unsignedDword & 0xFF000000) >>> 0) === 0x0A000000) return 'RFC 1918 Private Subnet (10.0.0.0/8)';

    // 172.16.0.0/12 (RFC 1918 Private: 172.16.0.0 - 172.31.255.255)
    if (((unsignedDword & 0xFFF00000) >>> 0) === 0xAC100000) return 'RFC 1918 Private Subnet (172.16.0.0/12)';

    // 192.168.0.0/16 (RFC 1918 Private)
    if (((unsignedDword & 0xFFFF0000) >>> 0) === 0xC0A80000) return 'RFC 1918 Private Subnet (192.168.0.0/16)';

    // 100.64.0.0/10 (Carrier-Grade NAT RFC 6598)
    if (((unsignedDword & 0xFFC00000) >>> 0) === 0x64400000) return 'Carrier-Grade NAT (100.64.0.0/10)';

    return null;
  }

  /**
   * Validate destination URL before executing request
   */
  static validateUrl(targetUrl, allowedHosts = []) {
    if (!targetUrl || typeof targetUrl !== 'string') {
      throw new SSRFSecurityError('Invalid or empty URL provided', targetUrl);
    }

    let parsed;
    try {
      parsed = new URL(targetUrl.trim());
    } catch {
      throw new SSRFSecurityError('Malformed URL syntax', targetUrl);
    }

    // 1. Strict Protocol Guard: only http: and https: allowed
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new SSRFSecurityError(`Forbidden URL protocol '${parsed.protocol}'. Only http: and https: are allowed.`, targetUrl);
    }

    const rawHost = parsed.hostname.toLowerCase();

    // 2. Normalize and check Allowed Hosts Bypass
    const normalizedAllowed = new Set(
      allowedHosts.map(h => String(h).trim().toLowerCase())
    );
    if (normalizedAllowed.has(rawHost) || normalizedAllowed.has(parsed.host.toLowerCase())) {
      return { valid: true, url: parsed.toString(), hostname: rawHost, allowed: true };
    }

    // 3. Block Known Cloud Metadata and Local Domain Names
    if (CommerceDockSSRF.BLOCKED_HOSTNAMES.has(rawHost)) {
      throw new SSRFSecurityError(`Prohibited infrastructure hostname '${rawHost}'`, targetUrl);
    }

    // Block .local, .internal, .lan, .onion
    if (/\.(local|internal|lan|onion|corp|home)$/i.test(rawHost)) {
      throw new SSRFSecurityError(`Prohibited private TLD '${rawHost}'`, targetUrl);
    }

    // 4. IPv6 Checks
    if (rawHost.startsWith('[') && rawHost.endsWith(']')) {
      const ipv6 = rawHost.slice(1, -1);
      if (ipv6 === '::1' || ipv6 === '0:0:0:0:0:0:0:1') {
        throw new SSRFSecurityError('Forbidden IPv6 loopback (::1)', targetUrl);
      }
      if (/^fe[89ab]/i.test(ipv6)) {
        throw new SSRFSecurityError('Forbidden IPv6 link-local (fe80::/10)', targetUrl);
      }
      if (/^f[cd]/i.test(ipv6)) {
        throw new SSRFSecurityError('Forbidden IPv6 unique local (fc00::/7)', targetUrl);
      }
    }

    // 5. IPv4 Dword and Obfuscation Resolution
    const ipv4Dword = CommerceDockSSRF.parseIPv4ToNumber(rawHost);
    if (ipv4Dword !== null) {
      const forbiddenReason = CommerceDockSSRF.isForbiddenIPv4(ipv4Dword);
      if (forbiddenReason) {
        throw new SSRFSecurityError(`Restricted IP address range: ${forbiddenReason}`, targetUrl);
      }
    }

    return { valid: true, url: parsed.toString(), hostname: rawHost, allowed: false };
  }

  /**
   * Execute an SSRF-protected, sanitized live health check
   */
  static async executeSafeHealthCheck(targetUrl, options = {}) {
    const allowedHosts = options.allowedHosts || [];
    const timeoutMs = options.timeoutMs || CommerceDockSSRF.DEFAULT_TIMEOUT_MS;

    try {
      CommerceDockSSRF.validateUrl(targetUrl, allowedHosts);
    } catch (err) {
      return {
        online: false,
        statusCode: 0,
        latencyMs: -1,
        blocked: true,
        error: err.message,
        checkedAt: new Date().toISOString()
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'error', // STRICT: Refuse open HTTP redirects to prevent metadata bypass
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'CommerceDock-Pulse/1.1 (Sovereign Ingress Healthcheck; +https://buildeon.solutions)'
        }
      });

      clearTimeout(timer);
      const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const latencyMs = Math.round(end - start);

      // SECURITY: Discard response body immediately - never return raw body content
      if (response.body && typeof response.body.cancel === 'function') {
        try { response.body.cancel(); } catch { /* ignore */ }
      }

      return {
        online: response.ok,
        statusCode: response.status,
        latencyMs,
        checkedAt: new Date().toISOString()
      };
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err.name === 'AbortError';
      return {
        online: false,
        statusCode: 0,
        latencyMs: -1,
        error: isAbort ? `Healthcheck timed out after ${timeoutMs}ms` : err.message,
        checkedAt: new Date().toISOString()
      };
    }
  }
}

// Module export for Node.js / test suites, or Window global for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CommerceDockSSRF, SSRFSecurityError };
}
if (typeof window !== 'undefined') {
  window.CommerceDockSSRF = CommerceDockSSRF;
}

export { CommerceDockSSRF, SSRFSecurityError };
export default CommerceDockSSRF;
