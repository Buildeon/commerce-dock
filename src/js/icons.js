/**
 * Commerce Dock: Bundled Vector SVG Platform Icons
 * 
 * Zero-telemetry, offline vector SVG assets for composable commerce,
 * search, AI, PIM, and cloud infrastructure platforms.
 * Adheres strictly to GDPR: zero external CDN calls or remote tracking pixels.
 */

const SVG_ICONS = {
  'adobe-commerce': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7.78V16.22L6 18.53V9.75L12 6.28L18 9.75V18.53L22 16.22V7.78L12 2Z" fill="#EE672F"/>
    <path d="M10 11.47L6 13.78V22L10 19.69V11.47Z" fill="#EE672F"/>
    <path d="M14 11.47L18 13.78V22L14 19.69V11.47Z" fill="#EE672F"/>
  </svg>`,

  'medusa': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#111827"/>
    <path d="M6 16.5V7.5L10 11.5L6 16.5Z" fill="#5452F6"/>
    <path d="M18 16.5V7.5L14 11.5L18 16.5Z" fill="#5452F6"/>
    <path d="M10 11.5L12 9.5L14 11.5L12 13.5L10 11.5Z" fill="#A5B4FC"/>
    <path d="M8 17.5L12 13.5L16 17.5H8Z" fill="#5452F6"/>
  </svg>`,

  'shopify': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.8 6.5C18.7 6.2 18.5 6.1 18.2 6.1L15.6 5.8C15.6 4.3 14.5 3 13 3C12.3 3 11.7 3.3 11.2 3.8C10.7 4.3 10.4 5 10.4 5.8L7.8 6.1C7.5 6.1 7.3 6.3 7.2 6.5L4 19.5C3.9 19.8 4.1 20.2 4.4 20.3L15.6 22.9C15.7 22.9 15.8 22.9 16 22.9C16.2 22.9 16.4 22.8 16.6 22.6L20 7.5L18.8 6.5ZM13 4.5C13.8 4.5 14.3 5.1 14.4 5.8L11.6 5.8C11.7 5.1 12.2 4.5 13 4.5ZM12.7 15.5C11.5 15.5 10.8 14.9 10.8 14.1C10.8 12.6 13.4 12.3 13.4 11.3C13.4 10.8 13.1 10.5 12.5 10.5C11.8 10.5 11.2 10.9 11 11.6L9.6 11.1C10 9.8 11.1 9.1 12.5 9.1C13.7 9.1 14.8 9.8 14.8 11.1C14.8 12.8 12.2 12.9 12.2 13.9C12.2 14.3 12.5 14.5 12.9 14.5C13.5 14.5 14.1 14 14.4 13.4L15.7 14.1C15.2 15 14 15.5 12.7 15.5Z" fill="#95BF47"/>
  </svg>`,

  'akeneo': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#59238F"/>
    <path d="M12 4L6 14.5H10.5L12 11.5L13.5 14.5H18L12 4Z" fill="#FFFFFF"/>
    <path d="M9 16.5L7.5 19.5H16.5L15 16.5H9Z" fill="#C084FC"/>
  </svg>`,

  'algolia': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.9 19.78C7.6 19.78 4.12 16.3 4.12 12C4.12 7.7 7.6 4.22 11.9 4.22C16.2 4.22 19.68 7.7 19.68 12C19.68 16.3 16.2 19.78 11.9 19.78ZM16.42 15.28L14.72 13.58C15.14 12.86 15.38 12.02 15.38 11.12C15.38 8.86 13.54 7.02 11.28 7.02C9.02 7.02 7.18 8.86 7.18 11.12C7.18 13.38 9.02 15.22 11.28 15.22C12.18 15.22 13.02 14.98 13.74 14.56L15.44 16.26L16.42 15.28Z" fill="#003DFF"/>
  </svg>`,

  'stripe': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#635BFF"/>
    <path d="M13.5 10.3C13.5 9.7 13 9.3 12.2 9.3C11.1 9.3 9.9 9.7 9.1 10.2V7.7C10.1 7.3 11.2 7 12.3 7C14.7 7 16.3 8.2 16.3 10.5C16.3 13.9 11.7 13.5 11.7 15.1C11.7 15.8 12.4 16.1 13.3 16.1C14.5 16.1 15.8 15.6 16.6 15V17.6C15.6 18.1 14.4 18.4 13.1 18.4C10.6 18.4 9 17.2 9 14.8C9 11.4 13.5 11.9 13.5 10.3Z" fill="#FFFFFF"/>
  </svg>`,

  'strapi': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#4945FF"/>
    <path d="M6 14.5V9.5C6 7.57 7.57 6 9.5 6H14.5V11C14.5 12.93 12.93 14.5 11 14.5H6Z" fill="#FFFFFF"/>
    <path d="M14.5 11V16C14.5 17.93 12.93 19.5 11 19.5H6V14.5H11C12.93 14.5 14.5 12.93 14.5 11Z" fill="#8E8BFF"/>
    <path d="M14.5 11H19.5V16C19.5 17.93 17.93 19.5 16 19.5H14.5V11Z" fill="#FFFFFF"/>
  </svg>`,

  'n8n': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#18181B"/>
    <circle cx="7" cy="12" r="2.5" fill="#FF6D5A"/>
    <circle cx="17" cy="8" r="2.5" fill="#FF6D5A"/>
    <circle cx="17" cy="16" r="2.5" fill="#FF6D5A"/>
    <path d="M9.5 12H12M12 12L14.5 8M12 12L14.5 16" stroke="#FF6D5A" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  'supabase': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#1C1C1C"/>
    <path d="M12.5 3L4 13.5H11.5L10.5 21L19 10.5H11.5L12.5 3Z" fill="#3ECF8E"/>
  </svg>`,

  'posthog': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#1D1F27"/>
    <path d="M5 14.5C5 12 7 10 9.5 10C10.5 10 11.4 10.3 12.1 10.9L10 14.5H5Z" fill="#F54E00"/>
    <path d="M12 8C12 6.5 13.2 5.3 14.7 5.3C15.8 5.3 16.7 6 17.1 6.9L14 12H12V8Z" fill="#F54E00"/>
    <path d="M14.5 14.5H19C19 16.5 17.4 18.2 15.4 18.2C14.2 18.2 13.1 17.5 12.5 16.5L14.5 14.5Z" fill="#F54E00"/>
    <circle cx="8" cy="12.5" r="1" fill="#FFFFFF"/>
  </svg>`,

  'omniroute': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#0A192F"/>
    <circle cx="6" cy="6" r="2.5" fill="#06B6D4"/>
    <circle cx="18" cy="6" r="2.5" fill="#3B82F6"/>
    <circle cx="12" cy="18" r="2.5" fill="#10B981"/>
    <path d="M8.2 7.2L15.8 7.2M7.4 8.2L10.8 15.8M16.6 8.2L13.2 15.8" stroke="#38BDF8" stroke-width="1.8" stroke-dasharray="2 2"/>
  </svg>`,

  'portainer': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#131B2B"/>
    <rect x="5" y="6" width="6" height="5" rx="1" fill="#05ACF0"/>
    <rect x="13" y="6" width="6" height="5" rx="1" fill="#05ACF0"/>
    <rect x="5" y="13" width="6" height="5" rx="1" fill="#05ACF0"/>
    <rect x="13" y="13" width="6" height="5" rx="1" fill="#20C4F4"/>
  </svg>`,

  'grafana': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#161719"/>
    <circle cx="12" cy="12" r="7" stroke="#F46800" stroke-width="2"/>
    <path d="M12 5V12L16 16" stroke="#F9A825" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  'traefik': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#1A2B3C"/>
    <path d="M5 8H19M7 12H17M9 16H15" stroke="#24A1C1" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  'postgres': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#1A2A3A"/>
    <path d="M12 4C8.7 4 6 6.7 6 10C6 12.8 7.9 15.2 10.5 15.8V19L13.5 17.5V15.9C16.6 15.4 18 13.1 18 10C18 6.7 15.3 4 12 4ZM10 9C10.6 9 11 9.4 11 10C11 10.6 10.6 11 10 11C9.4 11 9 10.6 9 10C9 9.4 9.4 9 10 9ZM14 9C14.6 9 15 9.4 15 10C15 10.6 14.6 11 14 11C13.4 11 13 10.6 13 10C13 9.4 13.4 9 14 9Z" fill="#336791"/>
  </svg>`,

  'redis': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#221212"/>
    <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="#DC382D"/>
    <path d="M4 11L12 15L20 11V13L12 17L4 13V11Z" fill="#A82820"/>
    <path d="M4 15L12 19L20 15V17L12 21L4 17V15Z" fill="#801C16"/>
  </svg>`,

  'mailhog': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#122438"/>
    <path d="M4 6H20C20.6 6 21 6.4 21 7V17C21 17.6 20.6 18 20 18H4C3.4 18 3 17.6 3 17V7C3 6.4 3.4 6 4 6ZM12 12.5L19.5 8H4.5L12 12.5ZM5 16H19V9.5L12 13.8L5 9.5V16Z" fill="#1976D2"/>
  </svg>`,

  'opencart': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#0C2538"/>
    <path d="M6 6H19L17.5 13H8.5L7.2 7.2L6 6ZM8.5 14H18V16H8.5V14ZM9 18C9.6 18 10 18.4 10 19C10 19.6 9.6 20 9 20C8.4 20 8 19.6 8 19C8 18.4 8.4 18 9 18ZM17 18C17.6 18 18 18.4 18 19C18 19.6 17.6 20 17 20C16.4 20 16 19.6 16 19C16 18.4 16.4 18 17 18Z" fill="#239FD4"/>
  </svg>`,

  'umami': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#0F172A"/>
    <circle cx="12" cy="12" r="3.5" fill="#38BDF8"/>
    <path d="M6 12C6 8.7 8.7 6 12 6C15.3 6 18 8.7 18 12C18 15.3 15.3 18 12 18" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  'unopim': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#17122E"/>
    <path d="M7 6H17V10H11V14H16V18H7V6Z" fill="#818CF8"/>
    <circle cx="17" cy="16" r="2" fill="#C084FC"/>
  </svg>`,

  'bagisto': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#081433"/>
    <path d="M12 4L5 8V16L12 20L19 16V8L12 4ZM12 6.5L16.8 9.2L12 12L7.2 9.2L12 6.5ZM6.8 10.4L11 12.8V17.8L6.8 15.4V10.4ZM13 17.8V12.8L17.2 10.4V15.4L13 17.8Z" fill="#0045FC"/>
  </svg>`,

  'docker': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 10.5V8.5H15V10.5H13ZM10.5 10.5V8.5H12.5V10.5H10.5ZM8 10.5V8.5H10V10.5H8ZM13 8V6H15V8H13ZM10.5 8V6H12.5V8H10.5ZM8 8V6H10V8H8ZM15.5 10.5V8.5H17.5V10.5H15.5ZM21.9 11.3C21.6 11.2 21.1 11.2 20.7 11.4C20.5 11 20.2 10.7 19.8 10.5L19.4 10.4L19.2 10.8C18.9 11.4 18.8 12 19 12.6C18.6 12.8 18 13.2 17.2 13.2H3C2.4 13.2 2 13.6 2 14.2C2 16.8 3.9 19 8.2 19C13.2 19 17.5 16.7 19.1 12.9C20.3 12.9 21.4 12.2 21.9 11.3Z" fill="#2496ED"/>
  </svg>`,

  'woocommerce': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#7F54B3"/>
    <path d="M4 7C4 5.34 5.34 4 7 4H17C18.66 4 20 5.34 20 7V13C20 14.66 18.66 16 17 16H11L7 19V16H7C5.34 16 4 14.66 4 13V7Z" fill="#7F54B3"/>
    <path d="M7.2 8.5C7.5 8.5 7.8 8.8 7.9 9.1L8.8 13.2L10.1 8.8C10.2 8.5 10.5 8.3 10.8 8.4C11.1 8.5 11.2 8.7 11.2 9L10.2 13.9C10.1 14.3 9.7 14.6 9.3 14.6C8.9 14.6 8.5 14.3 8.4 13.9L7.4 9.8L6.5 13.9C6.4 14.3 6 14.6 5.6 14.6C5.2 14.6 4.8 14.3 4.7 13.9L3.8 9C3.8 8.7 3.9 8.5 4.2 8.4C4.5 8.3 4.8 8.5 4.9 8.8L6.2 13.2L7.1 9.1C7.1 8.8 7.2 8.5 7.2 8.5ZM14.2 8.5C14.5 8.5 14.8 8.8 14.9 9.1L15.8 13.2L17.1 8.8C17.2 8.5 17.5 8.3 17.8 8.4C18.1 8.5 18.2 8.7 18.2 9L17.2 13.9C17.1 14.3 16.7 14.6 16.3 14.6C15.9 14.6 15.5 14.3 15.4 13.9L14.4 9.8L13.5 13.9C13.4 14.3 13 14.6 12.6 14.6C12.2 14.6 11.8 14.3 11.7 13.9L10.8 9C10.8 8.7 10.9 8.5 11.2 8.4C11.5 8.3 11.8 8.5 11.9 8.8L13.2 13.2L14.1 9.1C14.1 8.8 14.2 8.5 14.2 8.5Z" fill="#FFFFFF"/>
  </svg>`,

  'ghost': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#15171A"/>
    <path d="M12 4C8.13 4 5 7.13 5 11V19L7.5 17.5L10 19L12 17.5L14 19L16.5 17.5L19 19V11C19 7.13 15.87 4 12 4ZM9 11C8.45 11 8 10.55 8 10C8 9.45 8.45 9 9 9C9.55 9 10 9.45 10 10C10 10.55 9.55 11 9 11ZM15 11C14.45 11 14 10.55 14 10C14 9.45 14.45 9 15 9C15.55 9 16 9.45 16 10C16 10.55 15.55 11 15 11Z" fill="#FFFFFF"/>
  </svg>`,

  'anchor': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="2"/>
    <path d="M12 7V19M8 11H16M5 13C5 17.5 8 20 12 20C16 20 19 17.5 19 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`
};

/**
 * Resolves an SVG icon key based on service metadata
 * @param {object} service
 * @returns {string|null} Key in SVG_ICONS or null
 */
function resolveIconKey(service) {
  if (!service) return null;

  // Direct icon match if user specified a registered key
  if (service.icon && SVG_ICONS[service.icon]) {
    return service.icon;
  }

  const id = String(service.id || '').toLowerCase();
  const name = String(service.name || '').toLowerCase();
  const badge = String(service.badge || '').toLowerCase();

  const probe = `${id} ${name} ${badge}`;

  if (probe.includes('magento') || probe.includes('adobe commerce') || probe.includes('adobe-commerce')) return 'adobe-commerce';
  if (probe.includes('medusa')) return 'medusa';
  if (probe.includes('shopify')) return 'shopify';
  if (probe.includes('akeneo')) return 'akeneo';
  if (probe.includes('algolia')) return 'algolia';
  if (probe.includes('stripe')) return 'stripe';
  if (probe.includes('strapi')) return 'strapi';
  if (probe.includes('n8n')) return 'n8n';
  if (probe.includes('supabase')) return 'supabase';
  if (probe.includes('posthog')) return 'posthog';
  if (probe.includes('omniroute') || probe.includes('smart dispatcher') || probe.includes('dispatch')) return 'omniroute';
  if (probe.includes('portainer')) return 'portainer';
  if (probe.includes('grafana') || probe.includes('prometheus')) return 'grafana';
  if (probe.includes('traefik')) return 'traefik';
  if (probe.includes('postgres')) return 'postgres';
  if (probe.includes('redis')) return 'redis';
  if (probe.includes('mailhog') || probe.includes('mailpit')) return 'mailhog';
  if (probe.includes('opencart')) return 'opencart';
  if (probe.includes('umami')) return 'umami';
  if (probe.includes('unopim')) return 'unopim';
  if (probe.includes('bagisto')) return 'bagisto';
  if (probe.includes('docker') || probe.includes('container fleet')) return 'docker';
  if (probe.includes('woocommerce') || probe.includes('woo')) return 'woocommerce';
  if (probe.includes('ghost')) return 'ghost';

  return null;
}

/**
 * Returns styled HTML for the service icon (bundled SVG or emoji fallback)
 * @param {object} service
 * @param {number} size
 * @returns {string} HTML string
 */
function getServiceIcon(service, size = 28) {
  const iconKey = resolveIconKey(service);
  if (iconKey && SVG_ICONS[iconKey]) {
    return `<span class="service-svg-wrap" style="width:${size}px; height:${size}px; display:inline-flex; align-items:center; justify-content:center;" data-icon-key="${iconKey}">${SVG_ICONS[iconKey]}</span>`;
  }

  // Graceful fallback to emoji, monogram, or default box
  const raw = String(service?.icon || '').trim();
  const isEmoji = raw && (raw.length <= 4 || /^\p{Emoji}+$/u.test(raw)) && !/^[a-zA-Z0-9_-]+$/.test(raw);
  if (isEmoji) {
    return `<span class="service-emoji-wrap" style="font-size:${Math.round(size * 0.75)}px;">${raw}</span>`;
  }

  if (raw.length > 0) {
    // Generate 2-letter monogram fallback for unrecognized text slugs
    const source = service?.name || raw;
    const monogram = source.split(/[\s-_]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '🛠️';
    return `<span class="service-monogram-wrap" style="font-size:${Math.round(size * 0.42)}px; font-family:monospace; font-weight:700; width:${size}px; height:${size}px; display:inline-flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border-radius:6px; color:#e4e4e7;">${monogram}</span>`;
  }

  return `<span class="service-emoji-wrap" style="font-size:${Math.round(size * 0.75)}px;">📦</span>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SVG_ICONS, resolveIconKey, getServiceIcon };
}
if (typeof window !== 'undefined') {
  window.CommerceDockIcons = { SVG_ICONS, resolveIconKey, getServiceIcon };
}

export { SVG_ICONS, resolveIconKey, getServiceIcon };
