import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import CommerceDockVault from '../src/js/vault.js';

// In-memory mock localStorage for test environment
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MockLocalStorage();

describe('CommerceDockVault (OWASP ASVS Level 2 Hardening)', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('initializes vault with PBKDF2 (600,000 iterations) and 16-byte salt', async () => {
    const vault = new CommerceDockVault();
    const masterPass = 'SovereignMasterPassword123!';

    const initialized = await vault.initialize(masterPass);
    assert.equal(initialized, true);
    assert.equal(vault.isUnlocked(), true);

    const storage = vault.getStorage();
    assert.equal(storage.version, 2);
    assert.equal(storage.kdf, 'PBKDF2-SHA256');
    assert.equal(storage.iterations, 600000);
    assert.ok(storage.salt);

    const saltBytes = CommerceDockVault.base64ToUint8(storage.salt);
    assert.equal(saltBytes.length, 16);
    assert.ok(storage.check.iv);
    assert.ok(storage.check.ciphertext);
  });

  it('enforces strict IV uniqueness across multiple encryptions of identical plaintext', async () => {
    const vault = new CommerceDockVault();
    await vault.initialize('MasterPassword123!');

    const plaintext = 'sk_live_super_secret_token_abcdef123456';
    await vault.setSecret('test-service', 'token1', plaintext);
    await vault.setSecret('test-service', 'token2', plaintext);

    const storage = vault.getStorage();
    const secret1 = storage.secrets['test-service']['token1'];
    const secret2 = storage.secrets['test-service']['token2'];

    // IVs must be strictly unique
    assert.notEqual(secret1.iv, secret2.iv, 'IVs must never be reused across encryptions');
    // Ciphertexts must differ due to distinct IVs despite identical plaintext
    assert.notEqual(secret1.ciphertext, secret2.ciphertext, 'Ciphertexts must differ due to distinct IVs');

    // Both must decrypt cleanly back to the original plaintext
    const dec1 = await vault.getSecret('test-service', 'token1');
    const dec2 = await vault.getSecret('test-service', 'token2');
    assert.equal(dec1, plaintext);
    assert.equal(dec2, plaintext);
  });

  it('rejects incorrect master passwords and protects ciphertext integrity', async () => {
    const vault = new CommerceDockVault();
    await vault.initialize('CorrectPassword123!');
    await vault.setSecret('service-a', 'api_key', 'super-secret-key');
    vault.lock();

    assert.equal(vault.isUnlocked(), false);

    // Attempt unlock with wrong password
    await assert.rejects(
      async () => {
        await vault.unlock('WrongPasswordBadGuess!');
      },
      /Invalid master password/
    );

    assert.equal(vault.isUnlocked(), false);

    // Correct password unlocks successfully
    await vault.unlock('CorrectPassword123!');
    assert.equal(vault.isUnlocked(), true);
    const secret = await vault.getSecret('service-a', 'api_key');
    assert.equal(secret, 'super-secret-key');
  });

  it('automatically migrates legacy v1 vaults to v2 (600,000 iterations) upon unlock', async () => {
    // Manually construct a legacy v1 vault in localStorage
    const legacyVault = new CommerceDockVault('legacy_test_v2', 'legacy_test_v1');
    const enc = new TextEncoder();
    const cryptoObj = CommerceDockVault.getCrypto();

    const legacyPass = 'LegacyMaster123!';
    const legacySalt = cryptoObj.getRandomValues(new Uint8Array(16));
    const legacyKey = await legacyVault.deriveKey(legacyPass, legacySalt, 100000);

    const iv = cryptoObj.getRandomValues(new Uint8Array(12));
    const cipherBuf = await cryptoObj.subtle.encrypt(
      { name: 'AES-GCM', iv },
      legacyKey,
      enc.encode('COMMERCE_DOCK_VERIFIED')
    );

    const secretIv = cryptoObj.getRandomValues(new Uint8Array(12));
    const secretBuf = await cryptoObj.subtle.encrypt(
      { name: 'AES-GCM', iv: secretIv },
      legacyKey,
      enc.encode('legacy-secret-password-xyz')
    );

    // Save under legacy v1 structure
    const v1Payload = {
      salt: Array.from(legacySalt),
      check: {
        iv: Array.from(iv),
        cipher: Array.from(new Uint8Array(cipherBuf))
      },
      secrets: {
        'old-service': {
          password: {
            iv: Array.from(secretIv),
            cipher: Array.from(new Uint8Array(secretBuf))
          }
        }
      }
    };

    globalThis.localStorage.setItem('legacy_test_v1', JSON.stringify(v1Payload));

    // Unlock using our new vault engine
    const upgradedVault = new CommerceDockVault('legacy_test_v2', 'legacy_test_v1');
    assert.equal(upgradedVault.hasVault(), true);

    const unlocked = await upgradedVault.unlock(legacyPass);
    assert.equal(unlocked, true);

    // Verify migration to v2 envelope with 600,000 iterations
    const storageV2 = upgradedVault.getStorage();
    assert.equal(storageV2.version, 2);
    assert.equal(storageV2.iterations, 600000);
    assert.equal(storageV2.migratedFrom, 1);
    assert.ok(typeof storageV2.salt === 'string'); // now base64 encoded

    // Verify secret was preserved and re-encrypted
    const preservedSecret = await upgradedVault.getSecret('old-service', 'password');
    assert.equal(preservedSecret, 'legacy-secret-password-xyz');

    // Verify legacy storage was purged
    assert.equal(globalThis.localStorage.getItem('legacy_test_v1'), null);
  });

  it('exports and imports server-blind encrypted vault payloads (.cdvault)', async () => {
    const vaultA = new CommerceDockVault('vault_a');
    await vaultA.initialize('ExportTestPass123!');
    await vaultA.setSecret('medusa-store', 'admin_token', 'medusa_jwt_xyz');

    const cdvaultPayload = vaultA.exportEncryptedVault();
    assert.ok(cdvaultPayload.includes('CommerceDockVaultBackup.v2'));
    assert.ok(!cdvaultPayload.includes('medusa_jwt_xyz'), 'Plaintext secret must never appear in export');

    // Import into fresh vault instance
    const vaultB = new CommerceDockVault('vault_b');
    assert.equal(vaultB.hasVault(), false);

    vaultB.importEncryptedVault(cdvaultPayload);
    assert.equal(vaultB.hasVault(), true);
    assert.equal(vaultB.isUnlocked(), false);

    // Unlock with same password
    await vaultB.unlock('ExportTestPass123!');
    const importedSecret = await vaultB.getSecret('medusa-store', 'admin_token');
    assert.equal(importedSecret, 'medusa_jwt_xyz');
  });

  it('wipes memory keys on lock()', async () => {
    const vault = new CommerceDockVault();
    await vault.initialize('WipeTestPass123!');
    assert.equal(vault.isUnlocked(), true);

    vault.lock();
    assert.equal(vault.isUnlocked(), false);
    assert.equal(vault.activeKey, null);
    assert.equal(vault.activePassword, null);

    // Retrieving secrets while locked returns null
    const val = await vault.getSecret('any', 'field');
    assert.equal(val, null);
  });
});
