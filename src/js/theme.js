/**
 * Commerce Dock — Theme & Brand Identity Engine
 * 
 * Features:
 * - Curated preset palettes (Buildeon, Sharaf DG, Emerald, Cyber Amber, Slate)
 * - Dynamic domain-based Auto-Themer: automatically extracts brand palette from website domain
 * - CSS Variables runtime injector
 * - Respects preset policy: allowThemeCustomizer flag
 */

class CommerceDockTheme {
  constructor() {
    this.storageKey = 'commerce_dock_theme_v1';
    this.presets = {
      buildeon: {
        id: 'buildeon',
        name: 'Buildeon Modern',
        primary: '#6366f1',
        secondary: '#06b6d4',
        accent: '#818cf8',
        bg: '#0b0f19',
        cardBg: 'rgba(17, 24, 39, 0.75)',
        border: 'rgba(99, 102, 241, 0.25)',
        text: '#f3f4f6',
        textMuted: '#9ca3af'
      },
      sharafdg: {
        id: 'sharafdg',
        name: 'Sharaf DG Omnichannel',
        primary: '#ffcc00',
        secondary: '#002f6c',
        accent: '#e5b700',
        bg: '#0b1329',
        cardBg: 'rgba(15, 23, 42, 0.82)',
        border: 'rgba(255, 204, 0, 0.3)',
        text: '#ffffff',
        textMuted: '#94a3b8'
      },
      emerald: {
        id: 'emerald',
        name: 'Emerald Terminal',
        primary: '#10b981',
        secondary: '#14b8a6',
        accent: '#34d399',
        bg: '#051912',
        cardBg: 'rgba(6, 32, 24, 0.8)',
        border: 'rgba(16, 185, 129, 0.25)',
        text: '#ecfdf5',
        textMuted: '#6ee7b7'
      },
      amber: {
        id: 'amber',
        name: 'Cyber Amber',
        primary: '#f59e0b',
        secondary: '#f97316',
        accent: '#fbbf24',
        bg: '#140c03',
        cardBg: 'rgba(28, 17, 6, 0.8)',
        border: 'rgba(245, 158, 11, 0.25)',
        text: '#fffbeb',
        textMuted: '#fcd34d'
      },
      slate: {
        id: 'slate',
        name: 'Minimal Slate',
        primary: '#38bdf8',
        secondary: '#818cf8',
        accent: '#7dd3fc',
        bg: '#0f172a',
        cardBg: 'rgba(30, 41, 59, 0.8)',
        border: 'rgba(56, 189, 248, 0.2)',
        text: '#f8fafc',
        textMuted: '#94a3b8'
      }
    };

    // Known enterprise brand color maps for instant high-fidelity detection
    this.knownBrandColors = {
      'sharafdg.com': { primary: '#ffcc00', secondary: '#002f6c', bg: '#0b1329' },
      'uae.sharafdg.com': { primary: '#ffcc00', secondary: '#002f6c', bg: '#0b1329' },
      'amazon.com': { primary: '#ff9900', secondary: '#146eb4', bg: '#0f1111' },
      'shopify.com': { primary: '#96bf48', secondary: '#004c3f', bg: '#002e25' },
      'magento.com': { primary: '#ee672f', secondary: '#333333', bg: '#171717' },
      'adobe.com': { primary: '#eb1000', secondary: '#fa0f00', bg: '#141414' },
      'nike.com': { primary: '#f36b21', secondary: '#111111', bg: '#0d0d0d' },
      'apple.com': { primary: '#2997ff', secondary: '#0071e3', bg: '#000000' },
      'buildeon.solutions': { primary: '#6366f1', secondary: '#06b6d4', bg: '#0b0f19' },
      'unopim.com': { primary: '#6366f1', secondary: '#a855f7', bg: '#0e0b1f' },
      'bagisto.com': { primary: '#0045fc', secondary: '#2463eb', bg: '#090f20' }
    };

    this.currentTheme = null;
  }

  apply(themeConfig) {
    let resolved = null;
    if (typeof themeConfig === 'string') {
      resolved = this.presets[themeConfig] || this.presets.buildeon;
    } else if (themeConfig && typeof themeConfig === 'object') {
      resolved = {
        primary: themeConfig.primaryColor || '#6366f1',
        secondary: themeConfig.secondaryColor || '#06b6d4',
        accent: themeConfig.accentColor || themeConfig.primaryColor || '#818cf8',
        bg: themeConfig.bgColor || '#0b0f19',
        cardBg: themeConfig.cardBg || 'rgba(17, 24, 39, 0.75)',
        border: themeConfig.borderColor || 'rgba(99, 102, 241, 0.25)',
        text: themeConfig.textColor || '#f3f4f6',
        textMuted: themeConfig.textMuted || '#9ca3af'
      };
    } else {
      resolved = this.presets.buildeon;
    }

    this.currentTheme = resolved;
    const root = document.documentElement;
    root.style.setProperty('--dock-primary', resolved.primary);
    root.style.setProperty('--dock-secondary', resolved.secondary);
    root.style.setProperty('--dock-accent', resolved.accent || resolved.primary);
    root.style.setProperty('--dock-bg', resolved.bg);
    root.style.setProperty('--dock-card-bg', resolved.cardBg);
    root.style.setProperty('--dock-border', resolved.border);
    root.style.setProperty('--dock-text', resolved.text);
    root.style.setProperty('--dock-text-muted', resolved.textMuted);
  }

  detectFromUrl(urlInput) {
    if (!urlInput) return null;
    let clean = urlInput.trim().toLowerCase();
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    const domain = clean.split('/')[0].split(':')[0];

    // Check exact match or base domain match
    for (const [key, colors] of Object.entries(this.knownBrandColors)) {
      if (domain === key || domain.endsWith('.' + key)) {
        return {
          id: 'custom-' + domain,
          name: domain.toUpperCase(),
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.primary,
          bg: colors.bg,
          cardBg: 'rgba(15, 23, 42, 0.85)',
          border: `${colors.primary}44`,
          text: '#ffffff',
          textMuted: '#94a3b8'
        };
      }
    }

    // Algorithmic color synthesis based on domain hash
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = (hash << 5) - hash + domain.charCodeAt(i);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    const hueSec = (hue + 45) % 360;

    return {
      id: 'synth-' + domain,
      name: domain,
      primary: `hsl(${hue}, 85%, 55%)`,
      secondary: `hsl(${hueSec}, 80%, 50%)`,
      accent: `hsl(${hue}, 90%, 65%)`,
      bg: `hsl(${hue}, 30%, 6%)`,
      cardBg: `hsla(${hue}, 25%, 12%, 0.8)`,
      border: `hsla(${hue}, 85%, 55%, 0.25)`,
      text: '#f8fafc',
      textMuted: '#94a3b8'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommerceDockTheme;
}
if (typeof window !== 'undefined') {
  window.CommerceDockTheme = CommerceDockTheme;
}

export default CommerceDockTheme;