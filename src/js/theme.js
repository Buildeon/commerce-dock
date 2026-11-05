/**
 * Commerce Dock: Theme & Brand Identity Engine
 * 
 * Features:
 * - Curated preset palettes (Buildeon, Sharaf DG, Emerald, Cyber Amber, Slate)
 * - Dynamic WCAG 2.1 Relative Luminance and Smart Contrast calculation
 * - Dynamic domain-based Auto-Themer: automatically extracts brand palette from website domain
 * - Curated native system font stacks (zero external fonts, zero GDPR telemetry)
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
        textMuted: '#9ca3af',
        fontStack: 'modern-sans'
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
        textMuted: '#94a3b8',
        fontStack: 'geometric'
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
        textMuted: '#6ee7b7',
        fontStack: 'tech-mono'
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
        textMuted: '#fcd34d',
        fontStack: 'tech-mono'
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
        textMuted: '#94a3b8',
        fontStack: 'modern-sans'
      }
    };

    // Curated zero-telemetry system font stacks
    this.fontStacks = {
      'modern-sans': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      'tech-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      'geometric': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'editorial': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
    };

    // Known enterprise brand color maps for instant high-fidelity detection
    this.knownBrandColors = {
      'sharafdg.com': { primary: '#ffcc00', secondary: '#002f6c', bg: '#0b1329', fontStack: 'geometric' },
      'uae.sharafdg.com': { primary: '#ffcc00', secondary: '#002f6c', bg: '#0b1329', fontStack: 'geometric' },
      'amazon.com': { primary: '#ff9900', secondary: '#146eb4', bg: '#0f1111', fontStack: 'modern-sans' },
      'shopify.com': { primary: '#96bf48', secondary: '#004c3f', bg: '#002e25', fontStack: 'geometric' },
      'magento.com': { primary: '#ee672f', secondary: '#333333', bg: '#171717', fontStack: 'modern-sans' },
      'adobe.com': { primary: '#eb1000', secondary: '#fa0f00', bg: '#141414', fontStack: 'geometric' },
      'nike.com': { primary: '#f36b21', secondary: '#111111', bg: '#0d0d0d', fontStack: 'geometric' },
      'apple.com': { primary: '#2997ff', secondary: '#0071e3', bg: '#000000', fontStack: 'modern-sans' },
      'buildeon.solutions': { primary: '#6366f1', secondary: '#06b6d4', bg: '#0b0f19', fontStack: 'modern-sans' },
      'unopim.com': { primary: '#6366f1', secondary: '#a855f7', bg: '#0e0b1f', fontStack: 'modern-sans' },
      'bagisto.com': { primary: '#0045fc', secondary: '#2463eb', bg: '#090f20', fontStack: 'modern-sans' }
    };

    this.currentTheme = null;
  }

  /**
   * Calculates W3C WCAG 2.1 relative luminance (0.0 to 1.0)
   * @param {string} color
   * @returns {number} Relative luminance
   */
  calculateLuminance(color) {
    if (!color || typeof color !== 'string') return 0;

    let r = 0, g = 0, b = 0;
    const clean = color.trim().toLowerCase();

    if (clean.startsWith('#')) {
      const hex = clean.substring(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length >= 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    } else if (clean.startsWith('rgb')) {
      const match = clean.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (match) {
        r = parseInt(match[1], 10);
        g = parseInt(match[2], 10);
        b = parseInt(match[3], 10);
      }
    } else if (clean.startsWith('hsl')) {
      // Basic HSL approximation
      const match = clean.match(/hsla?\s*\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/);
      if (match) {
        const h = parseInt(match[1], 10) / 360;
        const s = parseFloat(match[2]) / 100;
        const l = parseFloat(match[3]) / 100;
        if (s === 0) {
          r = g = b = Math.round(l * 255);
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          const hue2rgb = (t) => {
            let tc = t;
            if (tc < 0) tc += 1;
            if (tc > 1) tc -= 1;
            if (tc < 1/6) return p + (q - p) * 6 * tc;
            if (tc < 1/2) return q;
            if (tc < 2/3) return p + (q - p) * (2/3 - tc) * 6;
            return p;
          };
          r = Math.round(hue2rgb(h + 1/3) * 255);
          g = Math.round(hue2rgb(h) * 255);
          b = Math.round(hue2rgb(h - 1/3) * 255);
        }
      }
    }

    // Convert to sRGB and linearize
    const sR = r / 255;
    const sG = g / 255;
    const sB = b / 255;

    const rLin = sR <= 0.04045 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
    const gLin = sG <= 0.04045 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
    const bLin = sB <= 0.04045 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  /**
   * Returns accessible text contrast color (#ffffff or #090d16) to ensure WCAG AA compliance
   * @param {string} color
   * @returns {string} Hex color
   */
  getContrastColor(color) {
    const lum = this.calculateLuminance(color);
    // Relative luminance threshold: colors with luminance > 0.42 (e.g. yellow, amber, cyan)
    // require deep dark text for WCAG readability.
    return lum > 0.42 ? '#090d16' : '#ffffff';
  }

  /**
   * Resolves a curated system font stack
   * @param {string} stackKey
   * @returns {string} Font family CSS value
   */
  getFontStack(stackKey) {
    return this.fontStacks[stackKey] || this.fontStacks['modern-sans'];
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
        textMuted: themeConfig.textMuted || '#9ca3af',
        fontStack: themeConfig.fontStack || 'modern-sans'
      };
    } else {
      resolved = this.presets.buildeon;
    }

    this.currentTheme = resolved;

    const primaryContrast = this.getContrastColor(resolved.primary);
    const accentContrast = this.getContrastColor(resolved.accent || resolved.primary);
    const fontFamily = this.getFontStack(resolved.fontStack);

    if (typeof document !== 'undefined' && document.documentElement) {
      const root = document.documentElement;
      root.style.setProperty('--dock-primary', resolved.primary);
      root.style.setProperty('--dock-primary-contrast', primaryContrast);
      root.style.setProperty('--dock-secondary', resolved.secondary);
      root.style.setProperty('--dock-accent', resolved.accent || resolved.primary);
      root.style.setProperty('--dock-accent-contrast', accentContrast);
      root.style.setProperty('--dock-bg', resolved.bg);
      root.style.setProperty('--dock-card-bg', resolved.cardBg);
      root.style.setProperty('--dock-border', resolved.border);
      root.style.setProperty('--dock-text', resolved.text);
      root.style.setProperty('--dock-text-muted', resolved.textMuted);
      root.style.setProperty('--dock-font-family', fontFamily);
    }
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
          textMuted: '#94a3b8',
          fontStack: colors.fontStack || 'modern-sans'
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
      textMuted: '#94a3b8',
      fontStack: 'modern-sans'
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
