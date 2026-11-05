import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CommerceDockSSRF, SSRFSecurityError } from '../src/js/ssrf-validator.js';

describe('CommerceDockSSRF (OWASP SSRF Protection Engine)', () => {
  it('allows valid public HTTP and HTTPS endpoints', () => {
    const validUrls = [
      'https://api.github.com/zen',
      'https://demo.unopim.com/api/ping',
      'https://uae.sharafdg.com/',
      'http://public-telemetry.buildeon.solutions:8080/health'
    ];

    for (const url of validUrls) {
      const res = CommerceDockSSRF.validateUrl(url);
      assert.equal(res.valid, true);
    }
  });

  it('blocks non-HTTP/HTTPS protocols (file, ftp, gopher, javascript)', () => {
    const dangerousUrls = [
      'file:///etc/passwd',
      'file:///var/run/docker.sock',
      'ftp://anonymous@internal-ftp.local/',
      'gopher://127.0.0.1:70/',
      'javascript:alert(1)',
      'data:text/html,<h1>pwn</h1>'
    ];

    for (const url of dangerousUrls) {
      assert.throws(
        () => CommerceDockSSRF.validateUrl(url),
        SSRFSecurityError,
        `Expected protocol rejection for ${url}`
      );
    }
  });

  it('blocks AWS/GCP/Azure Instance Metadata Services (169.254.169.254)', () => {
    const imdsUrls = [
      'http://169.254.169.254/latest/meta-data/',
      'http://169.254.169.254/computeMetadata/v1/',
      'http://metadata.google.internal/computeMetadata/v1/',
      'http://169.254.1.1/',
      'http://instance-data/latest/meta-data/'
    ];

    for (const url of imdsUrls) {
      assert.throws(
        () => CommerceDockSSRF.validateUrl(url),
        SSRFSecurityError,
        `Expected IMDS block for ${url}`
      );
    }
  });

  it('blocks IPv4 loopback and local hostnames (127.0.0.1, localhost)', () => {
    const loopbacks = [
      'http://127.0.0.1:3000',
      'http://127.0.0.2:8080',
      'http://127.255.255.255',
      'http://localhost:8080',
      'http://0.0.0.0:80'
    ];

    for (const url of loopbacks) {
      assert.throws(
        () => CommerceDockSSRF.validateUrl(url),
        SSRFSecurityError,
        `Expected loopback rejection for ${url}`
      );
    }
  });

  it('blocks IPv6 loopback [::1] and link-local [fe80::]', () => {
    const ipv6Dangerous = [
      'http://[::1]:8080/',
      'http://[0:0:0:0:0:0:0:1]:80/',
      'http://[fe80::1]:8080/',
      'http://[fe80::20c:29ff:fe4a:2a4b]/'
    ];

    for (const url of ipv6Dangerous) {
      assert.throws(
        () => CommerceDockSSRF.validateUrl(url),
        SSRFSecurityError,
        `Expected IPv6 rejection for ${url}`
      );
    }
  });

  it('blocks private RFC 1918 subnets unless explicitly allowlisted', () => {
    const privateIps = [
      'http://10.0.0.1:8080',
      'http://10.254.0.1:9000',
      'http://172.16.0.1:3000',
      'http://172.31.255.255:80',
      'http://192.168.1.1',
      'http://192.168.100.254'
    ];

    for (const url of privateIps) {
      assert.throws(
        () => CommerceDockSSRF.validateUrl(url),
        SSRFSecurityError,
        `Expected RFC 1918 block for ${url}`
      );
    }

    // When allowlisted, private IP should pass
    const allowedRes = CommerceDockSSRF.validateUrl('http://192.168.1.1:8080', ['192.168.1.1']);
    assert.equal(allowedRes.valid, true);
    assert.equal(allowedRes.allowed, true);
  });

  it('defeats alternative IP encodings (decimal dword, octal, hex)', () => {
    const obfuscated = [
      'http://2130706433/', // 127.0.0.1 in decimal integer
      'http://0x7f000001/', // 127.0.0.1 in hex
      'http://0177.0.0.1/'  // 127.0.0.1 in octal
    ];

    for (const url of obfuscated) {
      assert.throws(
        () => CommerceDockSSRF.validateUrl(url),
        SSRFSecurityError,
        `Expected obfuscated IP block for ${url}`
      );
    }
  });

  it('allows explicit internal docker service names when provided in allowedHosts', () => {
    const internalServices = [
      'http://medusa-backend:9000/health',
      'http://meilisearch:7700/health',
      'http://traefik:8080/ping'
    ];
    const allowed = ['medusa-backend', 'meilisearch', 'traefik'];

    for (const url of internalServices) {
      const res = CommerceDockSSRF.validateUrl(url, allowed);
      assert.equal(res.valid, true);
      assert.equal(res.allowed, true);
    }
  });

  it('executeSafeHealthCheck blocks SSRF attempts and returns clean metadata without body leak', async () => {
    const result = await CommerceDockSSRF.executeSafeHealthCheck('http://169.254.169.254/latest/meta-data/');
    assert.equal(result.online, false);
    assert.equal(result.blocked, true);
    assert.ok(result.error.includes('[SSRF Blocked]'));
    assert.equal(result.statusCode, 0);
    assert.ok(result.checkedAt);
  });
});
