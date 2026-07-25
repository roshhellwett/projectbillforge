# Full Polish Sweep — All Pages, All Devices

Goal: raise every screen (landing → auth → dashboard → settings) to a cohesive, premium bar. No new features, no logic changes — visual, interaction, and responsive quality only. All work stays in frontend / presentation code.

## Approach

For each page I will:
1. Screenshot current state at **mobile (375)**, **tablet (768)**, **desktop (1440)** via Playwright.
2. Audit against a fixed checklist (below).
3. Refine JSX + classes to hit the checklist.
4. Re-screenshot all three viewports to verify.

## Per-page checklist (applied to every screen)

- **Tokens only** — no hardcoded `text-white` / `bg-[#...]`; everything routed through the existing design tokens in `globals.css`.
- **Typography rhythm** — clear H1/H2/body scale, consistent line-height, `text-balance` on headings, `tabular-nums` on numeric columns (amounts, invoice #s).
- **Spacing rhythm** — 4/8 grid, consistent section padding, container max-widths.
- **States** — empty, loading (skeletons), error, success — visible on every list/form.
- **Micro-interactions** — hover, focus-visible ring, active press, disabled state, tasteful `animate-fade-in` / `hover-scale` where it earns its place.
- **Responsive** — mobile-first, `grid-cols-[minmax(0,1fr)_auto]` header rows, `min-w-0` + `truncate`, `shrink-0` on icons, ≥44px tap targets, `h-dvh` where full-height is used.
- **A11y** — icon-only buttons get `aria-label`, form inputs get labels, single `<main>` per route, correct heading order.
- **Print / share polish** on invoice-print modal.

## Pages in scope (order of work)

**Auth surface (fast wins, highest first-impression weight)**
1. `login/page.tsx`
2. `register/page.tsx`
3. `forgot-password/page.tsx`
4. `reset-password/page.tsx`
5. `verify-email/page.tsx`
6. Error fallback + `not-found.tsx` (visual match to auth polish)

**Marketing**
7. `LandingPage.tsx` (hero, features, pricing, footer — pass over each section)

**Dashboard shell**
8. `DashboardSidebar`, `MobileHeader`, `MobileDrawer`, `BottomNavigation` — unify spacing, active state, icon sizing, safe-area padding on mobile.

**Dashboard pages**
9. `dashboard/page.tsx` (overview / KPI cards)
10. `dashboard/invoices/page.tsx` + `NewInvoiceModal` + `InvoicePrintModal`
11. `dashboard/customers/page.tsx`
12. `dashboard/khata/page.tsx`
13. `dashboard/products/page.tsx`
14. `dashboard/settings/page.tsx`

## Cross-cutting refinements

- Extract 2–3 tiny presentational primitives if repeated markup appears (e.g. `PageHeader`, `StatCard`, `EmptyState`) — only when it removes real duplication, not speculatively.
- Add missing skeletons / `loading.tsx` where a route currently flashes blank.
- Verify dark mode contrast on every page.
- Ensure Hindi / Hinglish locale strings don't break line-height or truncation.

## Out of scope (explicit)

- No changes to server actions, DB schema, validation, auth flow, or business logic.
- No new pages or new features.
- No swap of icon library, font, or color palette — polish within the existing system.

## Deliverable

Before/after screenshots per page at mobile/tablet/desktop, plus a short summary of what changed on each. Estimated ~13 page passes; I'll ship in batches (auth → landing → dashboard shell → dashboard pages) so you can review as it lands rather than at the end.
