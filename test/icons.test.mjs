import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SVG_ICONS, resolveIconKey, getServiceIcon } from '../src/js/icons.js';

describe('CommerceDockIcons (Bundled Vector Platform Icons)', () => {
  it('bundles clean vector SVGs for all core platforms with zero external network requests', () => {
    const requiredIcons = [
      'adobe-commerce', 'medusa', 'shopify', 'akeneo', 'algolia',
      'stripe', 'strapi', 'n8n', 'supabase', 'posthog',
      'omniroute', 'portainer', 'grafana', 'traefik',
      'postgres', 'redis', 'mailhog', 'opencart', 'umami',
      'unopim', 'bagisto', 'docker', 'anchor'
    ];

    for (const key of requiredIcons) {
      assert.ok(SVG_ICONS[key], `Missing SVG icon for ${key}`);
      assert.ok(SVG_ICONS[key].startsWith('<svg'), `Icon ${key} must start with <svg`);
      assert.ok(SVG_ICONS[key].includes('</svg>'), `Icon ${key} must end with </svg>`);
      const sanitized = SVG_ICONS[key].replace('http://www.w3.org/2000/svg', '');
      assert.ok(!sanitized.includes('http://'), `Icon ${key} must not contain insecure external URLs`);
      assert.ok(!sanitized.includes('https://'), `Icon ${key} must not contain external CDN URLs (GDPR violation)`);
    }
  });

  it('accurately resolves icon keys from service names and badges', () => {
    assert.equal(resolveIconKey({ name: 'Adobe Commerce (Magento 2)' }), 'adobe-commerce');
    assert.equal(resolveIconKey({ name: 'Medusa Headless Engine' }), 'medusa');
    assert.equal(resolveIconKey({ name: 'Akeneo Enterprise PIM' }), 'akeneo');
    assert.equal(resolveIconKey({ name: 'Algolia Search Cluster' }), 'algolia');
    assert.equal(resolveIconKey({ name: 'OmniRoute GCC Smart Dispatcher' }), 'omniroute');
    assert.equal(resolveIconKey({ name: 'PostHog Analytics' }), 'posthog');
    assert.equal(resolveIconKey({ name: 'Custom Tool', icon: 'supabase' }), 'supabase');
  });

  it('renders SVG markup when recognized, and emoji when unrecognized', () => {
    const svgRender = getServiceIcon({ name: 'Medusa v2' });
    assert.ok(svgRender.includes('service-svg-wrap'));
    assert.ok(svgRender.includes('<svg'));

    const emojiRender = getServiceIcon({ name: 'Custom Legacy CRM', icon: '📞' });
    assert.ok(emojiRender.includes('service-emoji-wrap'));
    assert.ok(emojiRender.includes('📞'));
  });
});
