/**
 * Commerce Dock — Main Orchestrator & UI Controller
 */

(() => {
  const vault = new CommerceDockVault();
  const theme = new CommerceDockTheme();

  let activePresetData = null;
  let currentFilter = 'all';
  let searchQuery = '';

  // DOM Elements
  const servicesContainer = document.getElementById('services-grid');
  const searchInput = document.getElementById('search-input');
  const categoryTabs = document.getElementById('category-tabs');
  const vaultStatusPill = document.getElementById('vault-status-pill');
  const unlockVaultBtn = document.getElementById('unlock-vault-btn');
  const exportVaultBtn = document.getElementById('export-vault-btn');
  const wipeVaultBtn = document.getElementById('wipe-vault-btn');
  const themeCustomizerSection = document.getElementById('theme-customizer');
  const urlThemeInput = document.getElementById('url-theme-input');
  const applyUrlThemeBtn = document.getElementById('apply-url-theme-btn');
  const presetSelector = document.getElementById('preset-selector');

  // Modal Elements
  const vaultModal = document.getElementById('vault-modal');
  const vaultModalTitle = document.getElementById('vault-modal-title');
  const vaultPasswordInput = document.getElementById('vault-password-input');
  const vaultModalSubmit = document.getElementById('vault-modal-submit');
  const closeVaultModalBtn = document.getElementById('close-vault-modal');

  const ioModal = document.getElementById('io-modal');
  const ioTextarea = document.getElementById('io-textarea');
  const ioModalTitle = document.getElementById('io-modal-title');
  const ioSubmitBtn = document.getElementById('io-submit-btn');
  const closeIoModalBtn = document.getElementById('close-io-modal');

  const toastEl = document.getElementById('toast');

  // --- Helpers ---
  function showToast(message, duration = 3000) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  function resolvePresetName() {
    const host = window.location.hostname.toLowerCase();
    // Strictly bind dedicated subdomains to prevent preset switching or leaks
    if (host.includes('sharafdg')) return 'sharafdg';
    if (host.includes('tools')) return 'buildeon-fleet';

    const params = new URLSearchParams(window.location.search);
    const queryPreset = params.get('preset');
    if (queryPreset) return queryPreset;

    return 'demo';
  }

  async function loadPreset(presetName) {
    const host = window.location.hostname.toLowerCase();
    const isDedicatedHost = host.includes('sharafdg') || host.includes('tools');

    // On dedicated subdomains, completely remove preset selector
    if (presetSelector) {
      if (isDedicatedHost) {
        presetSelector.style.display = 'none';
      } else {
        presetSelector.style.display = 'inline-block';
        presetSelector.value = presetName;
      }
    }

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

    // Set page titles and metadata
    document.title = activePresetData.title || 'Commerce Dock';
    const dockTitleEl = document.getElementById('dock-title');
    const dockSubtitleEl = document.getElementById('dock-subtitle');
    const heroTitleEl = document.getElementById('hero-title');
    const heroDescEl = document.getElementById('hero-desc');

    if (dockTitleEl) dockTitleEl.textContent = activePresetData.brand?.name || 'Commerce Dock';
    if (dockSubtitleEl) dockSubtitleEl.textContent = activePresetData.subtitle || '';
    if (heroTitleEl) heroTitleEl.textContent = activePresetData.title || 'Operations Launcher';
    if (heroDescEl) heroDescEl.textContent = activePresetData.subtitle || 'Zero-Knowledge Composable Operations Matrix';

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
          const host = window.location.hostname.toLowerCase();
          const isDedicatedHost = host.includes('sharafdg') || host.includes('tools');
          if (presetSelector) {
            presetSelector.style.display = isDedicatedHost ? 'none' : 'inline-block';
          }
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

    const host = window.location.hostname.toLowerCase();
    const isDedicatedHost = host.includes('sharafdg') || host.includes('tools');
    if (presetSelector) {
      presetSelector.style.display = isDedicatedHost ? 'none' : 'inline-block';
    }

    const controlsBar = document.querySelector('.controls-bar');
    if (controlsBar) controlsBar.style.display = 'flex';

    const services = activePresetData.services || [];
    const filtered = services.filter(service => {
      const matchesCategory = (currentFilter === 'all') || (service.category === currentFilter);
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        service.name.toLowerCase().includes(q) ||
        (service.description && service.description.toLowerCase().includes(q)) ||
        (service.badge && service.badge.toLowerCase().includes(q)) ||
        (service.subplatforms && service.subplatforms.some(sp => sp.name.toLowerCase().includes(q) || sp.url.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
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

        const usernameVal = creds?.username || service.credentials?.username || '—';
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

      return `
        <div class="service-card" data-service-id="${service.id}">
          <div>
            <div class="card-top">
              <div class="service-meta">
                <div class="service-icon">${service.icon || '📦'}</div>
                <div class="service-title">
                  <h3>${escapeHtml(service.name)}</h3>
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
          </div>
        </div>
      `;
    }));

    servicesContainer.innerHTML = cardsHtml.join('');
    attachCardListeners();
  }

  function attachCardListeners() {
    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-copy');
        if (!text || text === '—') return;
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied to clipboard: ${text}`);
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

  // --- Category and Filter Listeners ---
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

  // --- Export / Import Vault ---
  if (exportVaultBtn) {
    exportVaultBtn.addEventListener('click', () => {
      const json = vault.exportEncryptedVault();
      ioModalTitle.textContent = 'Encrypted Vault Backup (Zero-Knowledge)';
      ioTextarea.value = json;
      ioSubmitBtn.style.display = 'none';
      ioModal.classList.add('open');
    });
  }

  if (closeIoModalBtn) {
    closeIoModalBtn.addEventListener('click', () => ioModal.classList.remove('open'));
  }

  if (wipeVaultBtn) {
    wipeVaultBtn.addEventListener('click', () => {
      if (confirm('Warning: This will permanently wipe local encrypted secrets from this browser. Proceed?')) {
        if (activePresetData?.accessControl?.inviteOnly) {
          localStorage.removeItem('dock_invite_' + activePresetData.dockId);
        }
        vault.wipe();
        showToast('Vault wiped from local storage.');
      }
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

  // Preset Selector
  if (presetSelector) {
    const host = window.location.hostname.toLowerCase();
    const isDedicatedHost = host.includes('sharafdg') || host.includes('tools');
    if (isDedicatedHost) {
      presetSelector.style.display = 'none';
    } else {
      presetSelector.value = resolvePresetName();
      presetSelector.addEventListener('change', (e) => {
        const chosen = e.target.value;
        const url = new URL(window.location);
        url.searchParams.set('preset', chosen);
        window.history.pushState({}, '', url);
        loadPreset(chosen);
      });
    }
  }

  // Vault state subscriber
  vault.onStateChange((unlocked) => {
    updateVaultUI(unlocked);
    renderServices();
  });

  // Initial Load
  const initialPreset = resolvePresetName();
  loadPreset(initialPreset);
})();
