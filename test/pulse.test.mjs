import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CommerceDockPulse } from '../src/js/pulse.js';

describe('CommerceDockPulse (AI Stack Context & Pulse Telemetry)', () => {
  const samplePreset = {
    dockId: 'test-dock-enterprise',
    title: 'Enterprise GCC Stack',
    brand: { name: 'Acme Commerce' },
    services: [
      {
        id: 'commerce-medusa',
        name: 'Medusa B2B Backend',
        category: 'commerce',
        badge: 'Headless Engine',
        url: 'https://medusa.example.com',
        description: 'Node.js commerce engine with automated order lifecycle.',
        status: 'online',
        credentials: {
          username: 'admin@acme.com',
          password: 'SuperSecretPlainPassword123!',
          hint: 'Do not leak this hint'
        },
        subplatforms: [
          {
            name: 'Medusa Admin Dashboard',
            url: 'https://admin.medusa.example.com',
            description: 'Order management interface'
          }
        ]
      },
      {
        id: 'search-meilisearch',
        name: 'Meilisearch Cluster',
        category: 'search',
        url: 'https://search.example.com',
        description: 'Instant full-text catalog search engine.',
        status: 'online'
      }
    ]
  };

  it('exports sanitized JSON topology manifest and strictly excludes credentials and secrets', () => {
    const jsonStr = CommerceDockPulse.exportStackContext(samplePreset, 'json');
    const parsed = JSON.parse(jsonStr);

    assert.equal(parsed.manifestVersion, '1.0.0');
    assert.equal(parsed.totalServices, 2);
    assert.equal(parsed.brand, 'Acme Commerce');
    assert.deepEqual(parsed.categories, ['commerce', 'search']);

    // Critical Security Verification: Plaintext passwords, usernames, and hints must NOT exist anywhere in the payload
    assert.ok(!jsonStr.includes('SuperSecretPlainPassword123!'), 'Passwords must never leak in stack context');
    assert.ok(!jsonStr.includes('admin@acme.com'), 'Usernames must never leak in stack context');
    assert.ok(!jsonStr.includes('Do not leak this hint'), 'Credential hints must never leak in stack context');

    // Verify sanitized structure
    const medusaService = parsed.services.find(s => s.id === 'commerce-medusa');
    assert.ok(medusaService);
    assert.equal(medusaService.credentials, undefined);
    assert.equal(medusaService.subplatforms.length, 1);
  });

  it('exports formatted Markdown topology for AI operational agents', () => {
    const md = CommerceDockPulse.exportStackContext(samplePreset, 'markdown');

    assert.ok(md.includes('# Architecture Topology: Enterprise GCC Stack'));
    assert.ok(md.includes('### [Medusa B2B Backend](https://medusa.example.com)'));
    assert.ok(md.includes('**Brand:** Acme Commerce'));
    assert.ok(md.includes('Security Guarantee'));

    // Zero credential leakage in Markdown
    assert.ok(!md.includes('SuperSecretPlainPassword123!'));
    assert.ok(!md.includes('admin@acme.com'));
  });

  it('probes service pulse and resolves adapter endpoints', async () => {
    const pulse = new CommerceDockPulse({ allowedHosts: ['internal-pulse.local'] });

    // SSRF-blocked endpoint returns safe offline status without crashing
    const probe = await pulse.probeService({
      id: 'internal-medusa',
      url: 'http://169.254.169.254:9000'
    });

    assert.equal(probe.online, false);
    assert.equal(probe.blocked, true);
  });
});
