## Description
<!-- Provide a concise summary of the changes and motivation. -->

## Linked Issue
<!-- Every PR must reference an existing issue. Example: Closes #12 or Fixes #45 -->
Closes #

## Type of Change
- [ ] `sec(...)`: Security or cryptographic hardening
- [ ] `feat(...)`: New feature, stack preset, or operational capability
- [ ] `fix(...)`: Bug fix
- [ ] `chore(...)`: Tooling, compliance, or dependency update
- [ ] `docs(...)`: Documentation enhancement

## Security & Verification Checklist
- [ ] **Tests**: `npm test` passes with zero failures (18+ tests covering crypto & SSRF).
- [ ] **Lint**: `npm run lint` passes with 0 GDPR violations and 0 insecure external anchors.
- [ ] **Types**: `npm run typecheck` passes with zero TypeScript diagnostic errors.
- [ ] **Build**: `npm run build` succeeds and validates preset JSON integrity.
- [ ] **Zero Telemetry**: No third-party scripts, analytics, fonts, or CDNs introduced.
- [ ] **Cryptographic Integrity**: Non-extractable keys (`extractable: false`), fresh 12-byte IVs, and 600k PBKDF2 iterations preserved.
- [ ] **No Em Dashes**: Documentation and copy avoid em dashes per company styleguide.
