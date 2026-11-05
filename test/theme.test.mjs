import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import CommerceDockTheme from '../src/js/theme.js';

describe('CommerceDockTheme (WCAG 2.1 Luminance & Contrast Engine)', () => {
  const theme = new CommerceDockTheme();

  it('calculates relative luminance accurately for dark and bright colors', () => {
    // Pure black
    assert.equal(theme.calculateLuminance('#000000'), 0);
    // Pure white
    assert.ok(Math.abs(theme.calculateLuminance('#ffffff') - 1.0) < 0.001);
    // Sharaf DG Yellow (#ffcc00) is very bright (> 0.6)
    const yellowLum = theme.calculateLuminance('#ffcc00');
    assert.ok(yellowLum > 0.55, `Expected yellowLum > 0.55, got ${yellowLum}`);
    // Buildeon Indigo (#6366f1) is medium-dark (< 0.25)
    const indigoLum = theme.calculateLuminance('#6366f1');
    assert.ok(indigoLum < 0.25, `Expected indigoLum < 0.25, got ${indigoLum}`);
  });

  it('returns deep dark text (#090d16) for high-luminance brand backgrounds (WCAG AA)', () => {
    // Sharaf DG yellow
    assert.equal(theme.getContrastColor('#ffcc00'), '#090d16');
    // White background
    assert.equal(theme.getContrastColor('#ffffff'), '#090d16');
    // Cyber yellow
    assert.equal(theme.getContrastColor('#ffff00'), '#090d16');
  });

  it('returns white text (#ffffff) for low-luminance brand backgrounds (WCAG AA)', () => {
    // Buildeon Indigo
    assert.equal(theme.getContrastColor('#6366f1'), '#ffffff');
    // Black background
    assert.equal(theme.getContrastColor('#000000'), '#ffffff');
    // Deep Navy
    assert.equal(theme.getContrastColor('#002f6c'), '#ffffff');
  });

  it('resolves zero-telemetry curated system font stacks', () => {
    assert.ok(theme.getFontStack('modern-sans').includes('-apple-system'));
    assert.ok(theme.getFontStack('tech-mono').includes('monospace'));
    assert.ok(theme.getFontStack('geometric').includes('Inter'));
    assert.ok(theme.getFontStack('editorial').includes('serif'));
    assert.ok(theme.getFontStack('unknown-stack').includes('-apple-system'));
  });
});
