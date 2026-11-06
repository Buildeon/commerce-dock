/**
 * Commerce Dock: Main Orchestrator & UI Controller
 */

import CommerceDockVault from './vault.js';
import CommerceDockTheme from './theme.js';
import { CommerceDockPulse } from './pulse.js';
import { getServiceIcon } from './icons.js';

(() => {
  const vault = new CommerceDockVault();
  const theme = new CommerceDockTheme();

  let activePresetData = null;
  let currentFilter = 'all';
  let currentEnvFilter = 'all';
  let searchQuery = '';
  let activeIoMode = 'vault'; // 'vault' or 'mcp'

  // DOM Elements
  const servicesContainer = document.getElementById('services-grid');
  const searchInput = document.getElementById('search-input');
  const categoryTabs = document.getElementById('category-tabs');
  const envPillsContainer = document.getElementById('env-pills');
  const vaultStatusPill = document.getElementById('vault-status-pill');
  const unlockVaultBtn = document.getElementById('unlock-vault-btn');
  const exportVaultBtn = document.getElementById('export-vault-btn');
  const exportMcpBtn = document.getElementById('export-mcp-btn');
  const wipeVaultBtn = document.getElementById('wipe-vault-btn');
  const themeCustomizerSection = document.getElementById('theme-customizer');
  const urlThemeInput = document.getElementById('url-theme-input');
  const applyUrlThemeBtn = document.getElementById('apply-url-theme-btn');
  const dockClientLogo = document.getElementById('dock-client-logo');
  const coBrandAnchor = document.getElementById('co-brand-anchor');

  // Modal Elements
  const vaultModal = document.getElementById('vault-modal');
  const vaultModalTitle = document.getElementById('vault-modal-title');
  const vaultPasswordInput = document.getElementById('vault-password-input');
  const vaultModalSubmit = document.getElementById('vault-modal-submit');
  const closeVaultModalBtn = document.getElementById('close-vault-modal');

  const ioModal = document.getElementById('io-modal');
  const ioTextarea = document.getElementById('io-textarea');
  const ioModalTitle = document.getElementById('io-modal-title');
  const ioModalDesc = document.getElementById('io-modal-desc');
  const ioSubmitBtn = document.getElementById('io-submit-btn');
  const closeIoModalBtn = document.getElementById('close-io-modal');
  const closeIoModalActionBtn = document.getElementById('close-io-modal-btn');
  const downloadCdvaultBtn = document.getElementById('download-cdvault-btn');
  const importCdvaultTrigger = document.getElementById('import-cdvault-trigger');
  const cdvaultFileInput = document.getElementById('cdvault-file-input');
  const copyIoBtn = document.getElementById('copy-io-btn');

  const toastEl = document.getElementById('toast');

  // Visual Stack Configurator Elements
  const configModal = document.getElementById('config-modal');
  const openConfigModalBtn = document.getElementById('open-config-modal-btn');
  const closeConfigModalBtn = document.getElementById('close-config-modal');
  const closeConfigModalActionBtn = document.getElementById('close-config-modal-btn');
  const configServiceForm = document.getElementById('config-service-form');
  const configModalTitle = document.getElementById('config-modal-title');
  const templateChipsContainer = document.getElementById('template-chips-container');
  const cfgAddSubplatformBtn = document.getElementById('cfg-add-subplatform-btn');
  const cfgSubplatformsList = document.getElementById('cfg-subplatforms-list');
  const cfgExportPresetBtn = document.getElementById('cfg-export-preset-btn');
  const cfgImportPresetTrigger = document.getElementById('cfg-import-preset-trigger');
  const cfgImportPresetFile = document.getElementById('cfg-import-preset-file');

  const cfgServiceId = document.getElementById('cfg-service-id');
  const cfgIcon = document.getElementById('cfg-icon');
  const cfgName = document.getElementById('cfg-name');
  const cfgCategory = document.getElementById('cfg-category');
  const cfgEnvironment = document.getElementById('cfg-environment');
  const cfgBadge = document.getElementById('cfg-badge');
  const cfgUrl = document.getElementById('cfg-url');
  const cfgHealthUrl = document.getElementById('cfg-health-url');
  const cfgDesc = document.getElementById('cfg-desc');
  const cfgUsername = document.getElementById('cfg-username');
  const cfgPassword = document.getElementById('cfg-password');

  // --- Insecure Ingress Guard Banner ---
  const insecureBanner = document.getElementById('insecure-http-banner');
  if (insecureBanner && window.location.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    insecureBanner.style.display = 'flex';
  }
  const dismissBanner = document.getElementById('dismiss-http-warning');
  if (dismissBanner && insecureBanner) {
    dismissBanner.addEventListener('click', () => {
      insecureBanner.style.display = 'none';
    });
  }

  // Auto-lock listener
  window.addEventListener('commerce-dock:vault-locked', (_e) => {
    showToast('Vault auto-locked due to inactivity (5 min).');
    renderServices();
  });

  // --- Helpers ---
  function showToast(message, duration = 3000) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  const DEDICATED_HOST_PRESETS = {
    'sharafdg': 'sharafdg',
    'wakqasahmed': 'wakqasahmed',
    'flowform': 'flowform',
    'signalops': 'signalops',
    'safevault': 'safevault',
    'tools': 'buildeon-fleet'
  };

  function resolvePresetName() {
    const host = window.location.hostname.toLowerCase();
    // Strictly bind dedicated subdomains to prevent preset switching or leaks
    for (const [key, preset] of Object.entries(DEDICATED_HOST_PRESETS)) {
      if (host.includes(key)) return preset;
    }

    const params = new URLSearchParams(window.location.search);
    const queryPreset = params.get('preset');
    if (queryPreset) return queryPreset;

    return 'demo';
  }

  async function loadPreset(presetName) {
    const host = window.location.hostname.toLowerCase();
    const isDedicatedHost = Object.keys(DEDICATED_HOST_PRESETS).some(key => host.includes(key));

    try {
      const response = await fetch(`/src/presets/${presetName}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      activePresetData = await response.json();
    } catch (e) {
      console.warn(`Failed to fetch /src/presets/${presetName}.json, fallback to inline demo`, e);
      // Fallback relative path check
      try {
        const response2 = await fetch(`src/presets/${presetName}.json`);
        activePresetData = await response2.json();
      } catch (err) {
        console.error('Fatal: Cannot load preset', err);
      }
    }

    if (!activePresetData) return;

    // Load any customized stack services stored in localStorage
    try {
      const customKey = `commerce_dock_custom_services_${presetName}`;
      const savedCustom = localStorage.getItem(customKey);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activePresetData.services = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load custom services from localStorage:', e);
    }

    // Set page titles and metadata
    document.title = activePresetData.title || 'Commerce Dock';
    const dockTitleEl = document.getElementById('dock-title');
    const dockSubtitleEl = document.getElementById('dock-subtitle');
    const heroTitleEl = document.getElementById('hero-title');
    const heroDescEl = document.getElementById('hero-desc');

    const brandName = activePresetData.brand?.name || 'Commerce Dock';
    if (dockTitleEl) dockTitleEl.textContent = brandName;
    if (dockSubtitleEl) dockSubtitleEl.textContent = activePresetData.subtitle || '';
    if (heroTitleEl) heroTitleEl.textContent = activePresetData.title || 'Operations Launcher';
    if (heroDescEl) heroDescEl.textContent = activePresetData.subtitle || 'Zero-Knowledge Composable Operations Matrix';

    // Update Dual-Brand Header
    if (dockClientLogo) {
      if (activePresetData.brand?.logoSvg) {
        dockClientLogo.innerHTML = activePresetData.brand.logoSvg;
      } else if (brandName !== 'Commerce Dock') {
        const initials = brandName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        dockClientLogo.textContent = initials || '⚓';
      } else {
        dockClientLogo.textContent = '⚓';
      }
    }

    if (coBrandAnchor) {
      if (brandName.toLowerCase().includes('commerce dock')) {
        coBrandAnchor.innerHTML = '<span class="anchor-sym">⚓</span> <span class="anchor-text">Sovereign Composable Operations Engine</span>';
      } else {
        coBrandAnchor.innerHTML = '<span class="anchor-sym">⚓</span> <span class="anchor-text">Powered by <strong>Commerce Dock</strong></span>';
      }
    }

    // Apply Brand Theme
    if (activePresetData.brand) {
      theme.apply(activePresetData.brand);

      // Handle Theme Customizer Visibility: never show on dedicated subdomains or when disabled
      if (themeCustomizerSection) {
        if (activePresetData.brand.allowThemeCustomizer === false || isDedicatedHost) {
          themeCustomizerSection.style.display = 'none';
        } else {
          themeCustomizerSection.style.display = 'flex';
        }
      }
    }

    // Auto-seed sandbox demo credentials for demo preset if vault empty
    if (presetName === 'demo' && !vault.hasVault()) {
      await autoSeedDemoCredentials();
    }

    // Check invite access control if configured
    if (activePresetData.accessControl?.inviteOnly && !isInviteAuthorized(activePresetData)) {
      renderInviteGate(activePresetData);
      return;
    }

    renderServices();
  }

  function isInviteAuthorized(preset) {
    if (!preset.accessControl?.inviteOnly) return true;
    const requiredCode = String(preset.accessControl.inviteCode || '').trim().toLowerCase();
    if (!requiredCode) return true;

    // Check query param
    const params = new URLSearchParams(window.location.search);
    const queryInvite = String(params.get('invite') || '').trim().toLowerCase();
    if (queryInvite === requiredCode) {
      localStorage.setItem('dock_invite_' + preset.dockId, requiredCode);
      return true;
    }

    // Check localStorage
    const saved = String(localStorage.getItem('dock_invite_' + preset.dockId) || '').trim().toLowerCase();
    return saved === requiredCode;
  }

  function renderInviteGate(preset) {
    if (!servicesContainer) return;

    if (themeCustomizerSection) themeCustomizerSection.style.display = 'none';
    const controlsBar = document.querySelector('.controls-bar');
    if (controlsBar) controlsBar.style.display = 'none';
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) headerActions.style.display = 'none';

    const brandName = preset.brand?.name || 'Enterprise';
    const title = preset.accessControl?.promptTitle || 'Restricted Executive Demo';
    const msg = preset.accessControl?.promptMessage || 'This workspace is restricted to authorized team members and invited reviewers.';

    servicesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; max-width: 520px; margin: 30px auto; padding: 36px 28px; background: var(--dock-card-bg); border: 1px solid var(--dock-border); border-radius: var(--radius-md); backdrop-filter: blur(12px); text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--dock-primary), var(--dock-secondary)); display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 18px; box-shadow: 0 4px 16px var(--dock-glow);">
          🔐
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 8px; color: var(--dock-text);">${escapeHtml(title)}</h2>
        <p style="font-size: 0.85rem; color: var(--dock-text-muted); line-height: 1.5; margin-bottom: 24px;">
          ${escapeHtml(msg)}
        </p>

        <form id="invite-gate-form" style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--dock-text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Invite Access Code</label>
            <input type="password" id="gate-invite-input" class="form-control" placeholder="Enter your invite code" required autofocus style="padding: 10px 14px;" />
          </div>
          <div id="gate-error-msg" style="display: none; color: #f87171; font-size: 0.8rem;">
            Invalid invite code. Please verify the code sent to your email.
          </div>
          <button type="submit" class="btn btn-primary" style="justify-content: center; padding: 10px; font-weight: 700;">
            Unlock Cockpit &rarr;
          </button>
        </form>

        <p style="font-size: 0.75rem; color: var(--dock-text-muted); margin-top: 20px;">
          Protected by Buildeon Sovereign Ingress · Zero Public Stack Exposure
        </p>
      </div>
    `;

    const form = document.getElementById('invite-gate-form');
    const input = document.getElementById('gate-invite-input');
    const errorEl = document.getElementById('gate-error-msg');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = input.value.trim().toLowerCase();
        const required = String(preset.accessControl?.inviteCode || '').trim().toLowerCase();

        if (code === required) {
          localStorage.setItem('dock_invite_' + preset.dockId, required);
          showToast(`Access granted: Welcome to ${brandName} Operations`);
          if (headerActions) headerActions.style.display = 'flex';
          if (controlsBar) controlsBar.style.display = 'flex';
          renderServices();
        } else {
          if (errorEl) errorEl.style.display = 'block';
          input.focus();
        }
      });
    }
  }

  async function autoSeedDemoCredentials() {
    try {
      const demoMasterPass = 'buildeon-demo';
      await vault.initialize(demoMasterPass);
      // Seed Demo presets
      await vault.setSecret('demo-opencart', 'username', 'demo');
      await vault.setSecret('demo-opencart', 'password', 'demo');
      await vault.setSecret('demo-adobe-commerce', 'username', 'magebit');
      await vault.setSecret('demo-adobe-commerce', 'password', 'Demo123');
      await vault.setSecret('demo-unopim', 'username', 'admin');
      await vault.setSecret('demo-unopim', 'password', 'admin123');
      await vault.setSecret('demo-bagisto', 'username', 'admin@example.com');
      await vault.setSecret('demo-bagisto', 'password', 'admin123');
      await vault.setSecret('demo-umami', 'username', 'admin');
      await vault.setSecret('demo-umami', 'password', 'umami');
      await vault.setSecret('demo-medusa', 'username', 'admin@medusa-test.com');
      await vault.setSecret('demo-medusa', 'password', 'supersecret');
      console.log('Demo vault automatically initialized with master password: buildeon-demo');
    } catch (e) {
      console.warn('Could not auto-seed demo vault:', e);
    }
  }

  // --- Rendering ---
  async function renderServices() {
    if (!servicesContainer || !activePresetData) return;

    // Strict security check: do not render services or expose controls if unauthorized
    if (activePresetData.accessControl?.inviteOnly && !isInviteAuthorized(activePresetData)) {
      renderInviteGate(activePresetData);
      return;
    }

    const headerActions = document.querySelector('.header-actions');
    if (headerActions) headerActions.style.display = 'flex';

    const controlsBar = document.querySelector('.controls-bar');
    if (controlsBar) controlsBar.style.display = 'flex';

    const services = activePresetData.services || [];
    const filtered = services.filter(service => {
      const matchesCategory = (currentFilter === 'all') || (service.category === currentFilter);
      const serviceEnv = (service.environment || 'production').toLowerCase();
      const matchesEnv = (currentEnvFilter === 'all') || (serviceEnv === currentEnvFilter.toLowerCase());
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        service.name.toLowerCase().includes(q) ||
        (service.description && service.description.toLowerCase().includes(q)) ||
        (service.badge && service.badge.toLowerCase().includes(q)) ||
        serviceEnv.includes(q) ||
        (service.subplatforms && service.subplatforms.some(sp => sp.name.toLowerCase().includes(q) || sp.url.toLowerCase().includes(q)));
      return matchesCategory && matchesEnv && matchesSearch;
    });

    if (filtered.length === 0) {
      servicesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--dock-text-muted);">
          <p style="font-size: 1.2rem; margin-bottom: 8px;">🔍 No stack services found</p>
          <p style="font-size: 0.85rem;">Try adjusting your search query or switching category filter.</p>
        </div>
      `;
      return;
    }

    const isUnlocked = vault.isUnlocked();
    const cardsHtml = await Promise.all(filtered.map(async service => {
      // Check credentials in vault
      let credsHtml = '';
      if (service.credentials || isUnlocked) {
        let creds = null;
        if (isUnlocked) {
          creds = await vault.getAllSecretsForService(service.id);
        }

        const usernameVal = creds?.username || service.credentials?.username || '-';
        const passwordVal = creds?.password || (isUnlocked ? '••••••••' : null);
        const hintText = service.credentials?.hint || 'Protected by Zero-Knowledge Master Password';

        credsHtml = `
          <div class="vault-inline-box">
            <div class="vault-inline-header">
              <span>🔐 Vault Credentials</span>
              <span style="font-size: 0.7rem; color: ${isUnlocked ? 'var(--dock-accent)' : 'var(--dock-text-muted)'};">
                ${isUnlocked ? '● Unlocked (In-Memory)' : '○ Encrypted'}
              </span>
            </div>
            <div class="credential-row">
              <span style="color: var(--dock-text-muted);">User:</span>
              <span class="credential-val">${escapeHtml(usernameVal)}</span>
              <button class="btn btn-outline btn-sm copy-btn" data-copy="${escapeHtml(usernameVal)}" title="Copy Username">📋</button>
            </div>
            ${passwordVal ? `
              <div class="credential-row">
                <span style="color: var(--dock-text-muted);">Pass:</span>
                <span class="credential-val font-mono">${escapeHtml(passwordVal)}</span>
                <button class="btn btn-outline btn-sm copy-btn" data-copy="${escapeHtml(passwordVal)}" title="Copy Password">📋</button>
              </div>
            ` : `
              <div style="font-size: 0.75rem; color: var(--dock-text-muted); margin-top: 4px;">
                <em>${escapeHtml(hintText)}</em>
              </div>
            `}
          </div>
        `;
      }

      // Subplatforms
      let subplatformsHtml = '';
      if (service.subplatforms && service.subplatforms.length > 0) {
        subplatformsHtml = `
          <div class="subplatforms-list">
            ${service.subplatforms.map(sp => `
              <a href="${sp.url}" target="_blank" rel="noopener noreferrer" class="subplatform-item">
                <div class="subplatform-info">
                  <span>${sp.icon || '🔗'}</span>
                  <div>
                    <div style="font-weight: 600;">${escapeHtml(sp.name)}</div>
                    ${sp.description ? `<div style="font-size: 0.72rem; color: var(--dock-text-muted);">${escapeHtml(sp.description)}</div>` : ''}
                  </div>
                </div>
                <span class="subplatform-link">↗</span>
              </a>
            `).join('')}
          </div>
        `;
      }

      const serviceEnv = (service.environment || 'production').toLowerCase();
      const envClass = `env-${serviceEnv}`;
      const envLabel = serviceEnv.toUpperCase();

      return `
        <div class="service-card" data-service-id="${service.id}">
          <div>
            <div class="card-top">
              <div class="service-meta">
                <div class="service-icon">${getServiceIcon(service, 28)}</div>
                <div class="service-title">
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <h3>${escapeHtml(service.name)}</h3>
                    <span class="service-env-pill ${envClass}">${escapeHtml(envLabel)}</span>
                  </div>
                  <span class="badge-pill">${escapeHtml(service.category || 'Service')}</span>
                </div>
              </div>
              ${service.badge ? `<span class="service-badge">${escapeHtml(service.badge)}</span>` : ''}
            </div>
            <p class="service-desc">${escapeHtml(service.description || '')}</p>
            ${credsHtml}
            ${subplatformsHtml}
          </div>

          <div class="card-actions">
            <a href="${service.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex: 1; justify-content: center;">
              Launch Service ↗
            </a>
            <button class="btn btn-outline manage-vault-btn" data-service-id="${service.id}" title="Manage Secrets in Vault">
              🔑
            </button>
            <button class="btn btn-outline edit-service-btn" data-service-id="${service.id}" title="Configure Service">
              ⚙️
            </button>
            <button class="btn btn-outline delete-service-btn" data-service-id="${service.id}" title="Remove Service from Dock" style="color: #ef4444;">
              🗑️
            </button>
          </div>
        </div>
      `;
    }));

    servicesContainer.innerHTML = cardsHtml.join('');
    attachCardListeners();
  }

  function attachCardListeners() {
    // Copy buttons with 20-second automatic clipboard scrubbing
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-copy');
        if (!text || text === '-') return;
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied to clipboard. Clipboard will be scrubbed in 20s.`);
          setTimeout(() => {
            if (navigator.clipboard && navigator.clipboard.readText) {
              navigator.clipboard.readText().then(current => {
                if (current === text) {
                  navigator.clipboard.writeText('').then(() => {
                    showToast('Clipboard scrubbed.');
                  }).catch(() => {});
                }
              }).catch(() => {
                navigator.clipboard.writeText('').then(() => {
                  showToast('Clipboard scrubbed.');
                }).catch(() => {});
              });
            } else {
              navigator.clipboard.writeText('').then(() => {
                showToast('Clipboard scrubbed.');
              }).catch(() => {});
            }
          }, 20000);
        }).catch(() => {
          showToast('Failed to copy to clipboard');
        });
      });
    });

    // Manage secret buttons
    document.querySelectorAll('.manage-vault-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const sId = btn.getAttribute('data-service-id');
        if (!vault.isUnlocked()) {
          openVaultModal();
          return;
        }
        promptEditSecret(sId);
      });
    });

    // Configure / Edit service buttons
    document.querySelectorAll('.edit-service-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.getAttribute('data-service-id');
        const s = activePresetData?.services?.find(item => item.id === sId);
        if (s) openConfigModal(s);
      });
    });

    // Delete service buttons
    document.querySelectorAll('.delete-service-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.getAttribute('data-service-id');
        handleDeleteService(sId);
      });
    });
  }

  function promptEditSecret(serviceId) {
    const userPrompt = prompt(`Store / Update credentials for [${serviceId}]:\nEnter Username:`);
    if (userPrompt === null) return;
    const passPrompt = prompt(`Enter Password for [${serviceId}]:`);
    if (passPrompt === null) return;

    vault.setSecret(serviceId, 'username', userPrompt).then(() => {
      return vault.setSecret(serviceId, 'password', passPrompt);
    }).then(() => {
      showToast(`Credentials encrypted and stored for ${serviceId}`);
      renderServices();
    }).catch(err => {
      showToast(`Error saving: ${err.message}`);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Vault UI & State Handler ---
  function updateVaultUI(isUnlocked) {
    if (vaultStatusPill) {
      if (isUnlocked) {
        vaultStatusPill.className = 'vault-pill unlocked';
        vaultStatusPill.innerHTML = `🟢 <span>Vault: Unlocked (RAM)</span>`;
        if (unlockVaultBtn) unlockVaultBtn.textContent = 'Lock Vault';
      } else {
        vaultStatusPill.className = 'vault-pill locked';
        vaultStatusPill.innerHTML = `🔒 <span>Vault: Encrypted</span>`;
        if (unlockVaultBtn) unlockVaultBtn.textContent = 'Unlock Vault';
      }
    }
  }

  function openVaultModal() {
    if (vault.isUnlocked()) {
      vault.lock();
      showToast('Vault locked. Cryptographic keys flushed from memory.');
      return;
    }
    const hasExisting = vault.hasVault();
    vaultModalTitle.textContent = hasExisting ? 'Unlock Zero-Knowledge Vault' : 'Initialize Vault Master Password';
    vaultPasswordInput.value = '';
    vaultModal.classList.add('open');
    vaultPasswordInput.focus();
  }

  function closeVaultModal() {
    vaultModal.classList.remove('open');
  }

  async function handleVaultSubmit() {
    const password = vaultPasswordInput.value;
    if (!password) {
      showToast('Please enter master password');
      return;
    }
    try {
      await vault.unlock(password);
      closeVaultModal();
      showToast('Vault unlocked successfully with AES-256-GCM');
    } catch (e) {
      showToast(`Failed: ${e.message}`);
    }
  }

  // --- Category and Filter Listeners (Dual-Axis) ---
  if (envPillsContainer) {
    envPillsContainer.querySelectorAll('.env-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        envPillsContainer.querySelectorAll('.env-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentEnvFilter = btn.getAttribute('data-env') || 'all';
        renderServices();
      });
    });
  }

  if (categoryTabs) {
    categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-category') || 'all';
        renderServices();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderServices();
    });
  }

  if (unlockVaultBtn) {
    unlockVaultBtn.addEventListener('click', openVaultModal);
  }

  if (closeVaultModalBtn) {
    closeVaultModalBtn.addEventListener('click', closeVaultModal);
  }

  if (vaultModalSubmit) {
    vaultModalSubmit.addEventListener('click', handleVaultSubmit);
  }

  if (vaultPasswordInput) {
    vaultPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleVaultSubmit();
    });
  }

  // --- Export / Import Vault & AI MCP Manifest ---
  if (exportVaultBtn) {
    exportVaultBtn.addEventListener('click', () => {
      activeIoMode = 'vault';
      const json = vault.exportEncryptedVault();
      if (ioModalTitle) ioModalTitle.textContent = 'Server-Blind Encrypted Vault Backup (.cdvault)';
      if (ioModalDesc) ioModalDesc.textContent = 'Zero-Knowledge AES-256-GCM envelope (600,000 PBKDF2 iterations). Keys and plaintext secrets are never transmitted. Safe to back up to local disk.';
      if (ioTextarea) {
        ioTextarea.value = json;
        ioTextarea.readOnly = false;
      }
      if (downloadCdvaultBtn) {
        downloadCdvaultBtn.style.display = 'inline-block';
        downloadCdvaultBtn.textContent = '⬇️ Download .cdvault';
      }
      if (importCdvaultTrigger) importCdvaultTrigger.style.display = 'inline-block';
      if (ioSubmitBtn) ioSubmitBtn.style.display = 'inline-block';
      if (ioModal) ioModal.classList.add('open');
    });
  }

  if (exportMcpBtn) {
    exportMcpBtn.addEventListener('click', () => {
      if (!activePresetData) return;
      activeIoMode = 'mcp';
      const manifest = CommerceDockPulse.exportStackContext(activePresetData, 'json');
      if (ioModalTitle) ioModalTitle.textContent = 'Sanitized AI / MCP Stack Topology Manifest';
      if (ioModalDesc) ioModalDesc.textContent = 'Topology manifest for autonomous operations agents (OpenClaw, Hermes, Claude Code, Antigravity). Strictly sanitized: zero credentials, passwords, or tokens.';
      if (ioTextarea) {
        ioTextarea.value = manifest;
        ioTextarea.readOnly = true;
      }
      if (downloadCdvaultBtn) {
        downloadCdvaultBtn.style.display = 'inline-block';
        downloadCdvaultBtn.textContent = '⬇️ Download stack-context.json';
      }
      if (importCdvaultTrigger) importCdvaultTrigger.style.display = 'none';
      if (ioSubmitBtn) ioSubmitBtn.style.display = 'none';
      if (ioModal) ioModal.classList.add('open');
    });
  }

  if (downloadCdvaultBtn) {
    downloadCdvaultBtn.addEventListener('click', () => {
      const content = ioTextarea ? ioTextarea.value : '';
      if (!content) return;
      const isMcp = activeIoMode === 'mcp';
      const filename = isMcp ? 'stack-context.json' : `commerce-dock-vault-${Date.now()}.cdvault`;
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded: ${filename}`);
    });
  }

  if (copyIoBtn && ioTextarea) {
    copyIoBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(ioTextarea.value).then(() => {
        showToast('Payload copied to clipboard');
      }).catch(() => {
        showToast('Failed to copy to clipboard');
      });
    });
  }

  if (importCdvaultTrigger && cdvaultFileInput) {
    importCdvaultTrigger.addEventListener('click', () => {
      cdvaultFileInput.click();
    });

    cdvaultFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result;
          if (typeof content === 'string') {
            vault.importEncryptedVault(content);
            showToast('Encrypted vault imported successfully. Unlock with your master password.');
            if (ioModal) ioModal.classList.remove('open');
          }
        } catch (err) {
          showToast(`Import failed: ${err.message}`);
        }
      };
      reader.readAsText(file);
      cdvaultFileInput.value = '';
    });
  }

  if (ioSubmitBtn && ioTextarea) {
    ioSubmitBtn.addEventListener('click', () => {
      try {
        vault.importEncryptedVault(ioTextarea.value);
        showToast('Encrypted vault imported successfully. Unlock with your master password.');
        if (ioModal) ioModal.classList.remove('open');
      } catch (err) {
        showToast(`Import error: ${err.message}`);
      }
    });
  }

  if (closeIoModalBtn) {
    closeIoModalBtn.addEventListener('click', () => {
      if (ioModal) ioModal.classList.remove('open');
    });
  }

  if (closeIoModalActionBtn) {
    closeIoModalActionBtn.addEventListener('click', () => {
      if (ioModal) ioModal.classList.remove('open');
    });
  }

  if (wipeVaultBtn) {
    wipeVaultBtn.addEventListener('click', () => {
      if (confirm('Warning: This will permanently wipe local encrypted secrets and stack modifications from this browser. Proceed?')) {
        const presetName = resolvePresetName();
        if (activePresetData?.accessControl?.inviteOnly) {
          localStorage.removeItem('dock_invite_' + activePresetData.dockId);
        }
        localStorage.removeItem('commerce_dock_custom_services_' + presetName);
        vault.wipe();
        showToast('Vault and stack cache wiped from local storage.');
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  }

  // --- Visual Stack Configurator Logic ---
  const SERVICE_TEMPLATES = [
    { name: 'Adobe Commerce', icon: 'adobe-commerce', category: 'commerce', environment: 'production', badge: 'Magento 2', url: 'https://commerce.yourbrand.com/admin', healthCheckUrl: '/health_check.php', description: 'Enterprise B2B/B2C storefront and catalog cluster.' },
    { name: 'Medusa v2', icon: 'medusa', category: 'commerce', environment: 'development', badge: 'Headless', url: 'http://localhost:9000/app', healthCheckUrl: 'http://localhost:9000/health', description: 'Composable commerce engine with custom workflows.' },
    { name: 'Shopify Plus', icon: 'shopify', category: 'commerce', environment: 'production', badge: 'Headless', url: 'https://admin.shopify.com', healthCheckUrl: '', description: 'Omnichannel cloud storefront with custom app extensions.' },
    { name: 'Akeneo PIM', icon: 'akeneo', category: 'commerce', environment: 'production', badge: 'PIM', url: 'https://pim.yourbrand.com', healthCheckUrl: '/api/rest/v1', description: 'Master catalog enrichment and attribute taxonomy.' },
    { name: 'Algolia Search', icon: 'algolia', category: 'analytics', environment: 'production', badge: 'Search', url: 'https://dashboard.algolia.com', healthCheckUrl: '', description: 'Fast product discovery, instant search, and AI merchandising.' },
    { name: 'Stripe Payments', icon: 'stripe', category: 'commerce', environment: 'production', badge: 'Fintech', url: 'https://dashboard.stripe.com', healthCheckUrl: '', description: 'Global payment gateway and billing reconciliation.' },
    { name: 'Strapi CMS', icon: 'strapi', category: 'infra', environment: 'staging', badge: 'Headless CMS', url: 'http://localhost:1337/admin', healthCheckUrl: 'http://localhost:1337/_health', description: 'Headless content management system for storefronts.' },
    { name: 'n8n Workflows', icon: 'n8n', category: 'automation', environment: 'production', badge: 'Workflows', url: 'http://localhost:5678', healthCheckUrl: 'http://localhost:5678/healthz', description: 'Self-hosted workflow automation for ERP and catalog sync.' },
    { name: 'Supabase Postgres', icon: 'supabase', category: 'infra', environment: 'staging', badge: 'Postgres', url: 'http://localhost:54323', healthCheckUrl: 'http://localhost:54323/health', description: 'Managed database, row-level security, and auth services.' },
    { name: 'PostHog Analytics', icon: 'posthog', category: 'analytics', environment: 'production', badge: 'Analytics', url: 'https://eu.posthog.com', healthCheckUrl: '', description: 'Product analytics, session replays, and feature flags.' },
    { name: 'OmniRoute AI', icon: 'omniroute', category: 'ai', environment: 'staging', badge: 'LLM Gateway', url: 'http://localhost:4000', healthCheckUrl: 'http://localhost:4000/health', description: 'Unified LLM routing for Claude CLI and OpenAI models.' },
    { name: 'Custom Platform', icon: '🌐', category: 'commerce', environment: 'production', badge: 'Custom', url: 'https://', healthCheckUrl: '', description: 'Custom operational endpoint or internal tool.' }
  ];

  function persistCustomServices() {
    if (!activePresetData || !activePresetData.services) return;
    try {
      const presetName = resolvePresetName();
      const customKey = `commerce_dock_custom_services_${presetName}`;
      localStorage.setItem(customKey, JSON.stringify(activePresetData.services));
    } catch (e) {
      console.warn('Failed to persist custom services:', e);
    }
  }

  function renderTemplateChips() {
    if (!templateChipsContainer) return;
    templateChipsContainer.innerHTML = SERVICE_TEMPLATES.map((tmpl, idx) => `
      <div class="template-chip" data-template-idx="${idx}">
        <span>${tmpl.icon}</span>
        <span>${escapeHtml(tmpl.name)}</span>
      </div>
    `).join('');

    templateChipsContainer.querySelectorAll('.template-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = Number(chip.getAttribute('data-template-idx'));
        const tmpl = SERVICE_TEMPLATES[idx];
        if (!tmpl) return;
        applyTemplateToForm(tmpl);
      });
    });
  }

  function applyTemplateToForm(tmpl) {
    if (cfgName) cfgName.value = tmpl.name;
    if (cfgIcon) cfgIcon.value = tmpl.icon;
    if (cfgCategory) cfgCategory.value = tmpl.category;
    if (cfgEnvironment && tmpl.environment) cfgEnvironment.value = tmpl.environment;
    if (cfgBadge) cfgBadge.value = tmpl.badge || '';
    if (cfgUrl) cfgUrl.value = tmpl.url || '';
    if (cfgHealthUrl) cfgHealthUrl.value = tmpl.healthCheckUrl || '';
    if (cfgDesc) cfgDesc.value = tmpl.description || '';
  }

  function addSubplatformRow(name = '', url = '', _icon = '🔗') {
    if (!cfgSubplatformsList) return;
    const row = document.createElement('div');
    row.className = 'cfg-subplatform-row';
    row.innerHTML = `
      <input type="text" class="form-control cfg-sp-name" style="font-size: 0.8rem; padding: 6px 8px;" placeholder="Name (e.g. Staging)" value="${escapeHtml(name)}" required />
      <input type="url" class="form-control cfg-sp-url" style="font-size: 0.8rem; padding: 6px 8px;" placeholder="https://..." value="${escapeHtml(url)}" required />
      <button type="button" class="remove-subplatform-btn" title="Remove">&times;</button>
    `;
    const removeBtn = row.querySelector('.remove-subplatform-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        row.remove();
      });
    }
    cfgSubplatformsList.appendChild(row);
  }

  function openConfigModal(service = null) {
    if (!configModal) return;
    renderTemplateChips();
    if (cfgSubplatformsList) cfgSubplatformsList.innerHTML = '';

    if (service) {
      if (configModalTitle) configModalTitle.textContent = `Configure Service: ${service.name}`;
      if (cfgServiceId) cfgServiceId.value = service.id;
      if (cfgName) cfgName.value = service.name;
      if (cfgIcon) cfgIcon.value = service.icon || '📦';
      if (cfgCategory) cfgCategory.value = service.category || 'commerce';
      if (cfgEnvironment) cfgEnvironment.value = service.environment || 'production';
      if (cfgBadge) cfgBadge.value = service.badge || '';
      if (cfgUrl) cfgUrl.value = service.url || '';
      if (cfgHealthUrl) cfgHealthUrl.value = service.healthCheckUrl || '';
      if (cfgDesc) cfgDesc.value = service.description || '';

      if (service.subplatforms && service.subplatforms.length > 0) {
        service.subplatforms.forEach(sp => addSubplatformRow(sp.name, sp.url, sp.icon));
      }
    } else {
      if (configModalTitle) configModalTitle.textContent = 'Add Platform to Stack';
      if (cfgServiceId) cfgServiceId.value = '';
      if (configServiceForm) configServiceForm.reset();
      if (cfgIcon) cfgIcon.value = '📦';
      if (cfgEnvironment) cfgEnvironment.value = 'production';
    }

    if (cfgUsername) cfgUsername.value = '';
    if (cfgPassword) cfgPassword.value = '';

    configModal.classList.add('open');
  }

  function closeConfigModal() {
    if (configModal) configModal.classList.remove('open');
  }

  async function handleConfigSubmit(e) {
    e.preventDefault();
    if (!activePresetData) return;
    if (!activePresetData.services) activePresetData.services = [];

    const isEdit = Boolean(cfgServiceId?.value);
    const serviceName = cfgName?.value?.trim();
    if (!serviceName) return;

    const serviceId = isEdit 
      ? cfgServiceId.value 
      : serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    // Collect subplatforms
    const subplatforms = [];
    if (cfgSubplatformsList) {
      cfgSubplatformsList.querySelectorAll('.cfg-subplatform-row').forEach(row => {
        const spName = row.querySelector('.cfg-sp-name')?.value?.trim();
        const spUrl = row.querySelector('.cfg-sp-url')?.value?.trim();
        if (spName && spUrl) {
          subplatforms.push({ name: spName, url: spUrl, icon: '🔗' });
        }
      });
    }

    const serviceObj = {
      id: serviceId,
      name: serviceName,
      icon: cfgIcon?.value?.trim() || '📦',
      category: cfgCategory?.value || 'commerce',
      environment: cfgEnvironment?.value || 'production',
      badge: cfgBadge?.value?.trim() || '',
      url: cfgUrl?.value?.trim() || '',
      healthCheckUrl: cfgHealthUrl?.value?.trim() || '',
      description: cfgDesc?.value?.trim() || '',
      subplatforms: subplatforms
    };

    if (isEdit) {
      const idx = activePresetData.services.findIndex(s => s.id === serviceId);
      if (idx !== -1) {
        activePresetData.services[idx] = { ...activePresetData.services[idx], ...serviceObj };
      } else {
        activePresetData.services.push(serviceObj);
      }
    } else {
      activePresetData.services.push(serviceObj);
    }

    // Save encrypted credentials if provided and vault is unlocked
    const username = cfgUsername?.value?.trim();
    const password = cfgPassword?.value?.trim();
    if ((username || password) && vault.isUnlocked()) {
      try {
        if (username) await vault.setSecret(serviceId, 'username', username);
        if (password) await vault.setSecret(serviceId, 'password', password);
        showToast(`Credentials encrypted into vault for ${serviceName}.`);
      } catch (err) {
        console.warn('Vault encryption warning:', err);
      }
    }

    persistCustomServices();
    closeConfigModal();
    renderServices();
    showToast(`Saved "${serviceName}" to active dock.`);
  }

  function handleDeleteService(serviceId) {
    if (!activePresetData?.services) return;
    const target = activePresetData.services.find(s => s.id === serviceId);
    const name = target ? target.name : serviceId;
    if (!confirm(`Remove "${name}" from your active stack?`)) return;

    activePresetData.services = activePresetData.services.filter(s => s.id !== serviceId);
    persistCustomServices();
    renderServices();
    showToast(`Removed "${name}" from dock.`);
  }

  function exportCustomPreset() {
    if (!activePresetData) return;
    const cleanPreset = JSON.parse(JSON.stringify(activePresetData));
    const jsonStr = JSON.stringify(cleanPreset, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resolvePresetName()}-stack-preset.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported stack preset JSON.');
  }

  function importCustomPresetFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') return;
        const parsed = JSON.parse(content);
        if (!parsed || !Array.isArray(parsed.services)) {
          throw new Error('Invalid stack preset file format. Missing "services" array.');
        }
        activePresetData.services = parsed.services;
        if (parsed.brand) theme.apply(parsed.brand);
        persistCustomServices();
        renderServices();
        closeConfigModal();
        showToast('Stack preset imported successfully.');
      } catch (err) {
        showToast('Failed to import preset: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // Visual Configurator Event Listeners
  if (openConfigModalBtn) {
    openConfigModalBtn.addEventListener('click', () => openConfigModal(null));
  }
  if (closeConfigModalBtn) {
    closeConfigModalBtn.addEventListener('click', closeConfigModal);
  }
  if (closeConfigModalActionBtn) {
    closeConfigModalActionBtn.addEventListener('click', closeConfigModal);
  }
  if (configServiceForm) {
    configServiceForm.addEventListener('submit', handleConfigSubmit);
  }
  if (cfgAddSubplatformBtn) {
    cfgAddSubplatformBtn.addEventListener('click', () => addSubplatformRow('', '', '🔗'));
  }
  if (cfgExportPresetBtn) {
    cfgExportPresetBtn.addEventListener('click', exportCustomPreset);
  }
  if (cfgImportPresetTrigger && cfgImportPresetFile) {
    cfgImportPresetTrigger.addEventListener('click', () => {
      cfgImportPresetFile.click();
    });
    cfgImportPresetFile.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) importCustomPresetFile(file);
      cfgImportPresetFile.value = '';
    });
  }

  // --- Auto-Themer Input ---
  if (applyUrlThemeBtn && urlThemeInput) {
    applyUrlThemeBtn.addEventListener('click', () => {
      const url = urlThemeInput.value;
      if (!url) return;
      const detected = theme.detectFromUrl(url);
      if (detected) {
        theme.apply(detected);
        showToast(`Theme extracted & applied for: ${detected.name}`);
      }
    });
  }

  // Palette dots
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const themeKey = dot.getAttribute('data-theme');
      if (themeKey) {
        theme.apply(themeKey);
        showToast(`Applied preset theme: ${themeKey}`);
      }
    });
  });

  // Vault state subscriber
  vault.onStateChange((unlocked) => {
    updateVaultUI(unlocked);
    renderServices();
  });

  // Initial Load
  const initialPreset = resolvePresetName();
  loadPreset(initialPreset);
})();
