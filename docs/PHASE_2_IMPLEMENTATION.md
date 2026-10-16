# BillForge Phase 2 implementation map

Phase 2 turns the initial billing workspace into a product-grade business operating surface. It is organized around user confidence, fast daily actions, and truthful states rather than decoration alone.

## What is implemented

### Phase 2A — audit and product architecture

- Evidence-led UX audit: [`UX_AUDIT_PHASE_2A.md`](./UX_AUDIT_PHASE_2A.md)
- Core habit loop: understand the signal, take one action, verify the result
- Trust boundaries for financial data, Copilot context, destructive Khata actions, and workspace export
- Explicit loading, empty, error, success, offline/timeout, and retry states across the primary workflows

### Phase 2B — shell and interaction system

- Localized navigation registry in `components/ui/KeyboardShortcuts.tsx`
- Desktop sidebar, mobile drawer, bottom navigation, command menu, and keyboard shortcuts consume the same registry
- Skip link, focus-visible states, modal focus return, Escape handling, and outside-click recovery
- Shared confirmation dialog with localized processing labels
- Shared design tokens and semantic status colors in `app/globals.css`

### Phase 2C — command center and insights

- Dashboard attention panel with server-derived receivable, low-stock, and open-invoice signals
- First-run activation card for genuinely empty workspaces
- Reports route with active-invoice sales snapshot and seven-day trend
- Help Center route with invoice, GST, Khata, Copilot, and privacy guidance

### Phase 2D — workflow depth

- Server-backed search for invoices, customers, and products
- Stable `createdAt/id` pagination and server-derived list counts
- Invoice review step, server-authoritative calculations, stock locking, and client idempotency keys
- Full-catalog customer/product lookup during invoice creation
- Khata reset scope limited to Khata invoices and active ledger activity; direct cash/UPI invoices remain intact
- Tenant-scoped JSON workspace backup from Settings → Data and privacy
- Read-only Copilot context includes bounded sales, receivables, low-stock, recent invoice, and product-sales signals

## Acceptance gate still required

The implementation is not called production-accepted until the configured runtime is reachable and these checks pass against a real authenticated workspace:

1. `npm test`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm run db:check`
5. `npm run build`
6. Authenticated browser pass on desktop and mobile widths
7. Real OpenRouter Copilot questions and provider failure paths
8. Tenant-isolation and destructive-action regression checks

The final acceptance gate is intentionally separate from visual polish: a polished screen must not conceal an unavailable database, unverified model response, or incorrect financial state.
