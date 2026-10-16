# BillForge Phase 2A — UX Heuristic Audit

**Date:** 2026-10-15  
**Artifact mode:** Codebase evaluation  
**Scope:** Authenticated product shell, dashboard, assistant, invoices, Khata, customers, products, settings, and cross-cutting interaction primitives.

## Executive summary

BillForge already has a useful functional foundation: the dashboard exposes real business signals, invoice creation has a review step, and the product includes responsive layouts, localization files, keyboard shortcuts, loading states, and error boundaries.

It is not yet at flagship SaaS quality. The largest risks are not missing gradients; they are trust, consistency, safe control of destructive actions, and truthful system status. Several parts currently present marketing/demo language as if it were live account state, the global command shortcuts disagree with their visible hints, and the shared confirmation dialog is not yet a production-grade accessible modal.

This audit is intentionally evidence-led. It does not treat a component existing as proof that its user outcome works. Findings below cite the inspected source locations. A live authenticated visual pass remains blocked until the configured database connection is healthy (`/api/health` currently returns 503 in the development runtime), so visual spacing and real-data behavior are not scored beyond what the source makes observable.

## Status after the first implementation slices

This document is the Phase 2A baseline, not a claim that every finding remains open. The first Phase 2B/2C slices have since addressed several findings:

- Shared modal accessibility is now centralized in `components/ui/ui.tsx` with initial focus, Escape handling, focus trapping/restoration, and body-scroll locking.
- The shell uses a typed localized navigation/shortcut registry in `components/ui/KeyboardShortcuts.tsx`.
- Mobile and desktop navigation now share translated labels, and the command-menu shortcut is rendered from the same registry.
- Copilot readiness, bounded tenant context, provider/data error states, and retry behavior are now explicit; its illustration contains no financial sample data.
- Global Khata reset requires a loaded impact summary, consent, and the exact confirmation phrase. Its copy describes archive/cancel retention rather than deletion.
- Public/auth surfaces no longer present simulated business metrics or unsupported security/enterprise claims.
- Customers, products, invoices, and Khata lookup now use bounded server-backed search rather than pretending a first page is the whole workspace; invoice lookup also searches the full catalog for billing.
- Settings now provides a tenant-scoped JSON workspace backup instead of a decorative “coming soon” export card.

The remaining open items are primarily runtime verification, visual validation at real breakpoints, and deeper workflow polish. Contextual help and a truthful reports surface are now implemented, but they must still be checked against a healthy database and authenticated session before the product can be called flagship-ready.

## Inventory examined

### Screens

- Public landing and authentication: localized landing, login, register, forgot password, reset password, and email verification.
- Authenticated dashboard shell: desktop sidebar, mobile header, mobile drawer, bottom navigation, command menu, keyboard shortcut help, theme toggle, language switcher, and sign-out.
- Dashboard command center: welcome banner, attention panel, quick actions, overview cards, sales trend, business snapshot, recent invoices, top receivables, low-stock alerts, loading skeletons, and partial-data states.
- Invoices: paginated invoice list, search/filter bar, responsive table/cards, new-invoice two-step modal, invoice preview/print, WhatsApp share, cancellation confirmation, and load-more state.
- Khata: customer search, balance cards, transaction table, add transaction, record payment, fine collection, delete transaction, and reset Khata flows.
- Customers: search, grid, add/edit modal, delete confirmation, balance sync, and pagination.
- Products: search, inventory table, add/edit modal, delete confirmation, and pagination.
- Settings: business profile, invoice terms, Udhaar/fine settings, account/security, danger zone, preferences, password, and about/support.
- Business Copilot: read-only assistant hero, context/privacy explanation, transcript, suggestions, input, loading/error state, and new-chat action.
- Reports and help center: workspace-scoped sales trend view, explicit metric definitions, recovery state, and contextual workflow guidance.

### Key flows

1. Sign in → dashboard → understand attention signals.
2. Dashboard quick action → create invoice → review tax/payment/stock → submit.
3. Invoice list → search/filter → view/share/cancel.
4. Khata → select customer → inspect ledger → record payment or reset.
5. Customers/products → create/edit/delete → return to populated list.
6. Settings → edit profile/fines → save or enter the destructive reset flow.
7. Assistant → ask a question → receive a scoped answer or recover from failure.
8. Mobile navigation, theme, language, keyboard shortcuts, and command menu.

## Findings by Nielsen heuristic

Severity scale: **0** not a usability problem, **1** cosmetic, **2** minor, **3** major, **4** catastrophic.

### H1 — Visibility of system status

**Max severity: 3 (major)**

#### H1.1 Copilot presents “Ready” before the data/provider path is known to be ready — severity 3

**Evidence:** `components/assistant/AssistantPage.tsx:297-300` renders a green pulsing status and the localized `online` label unconditionally. The actual assistant request depends on an authenticated session, a working database context, rate limiting, and the OpenRouter provider.

**Impact:** A user can reasonably interpret the page as operational, submit a question, and only then discover that business data is unavailable. This is especially damaging in a financial product because “ready” implies data freshness and availability.

**Fix direction:** Model the assistant state explicitly: `checking`, `ready`, `data-unavailable`, `provider-unavailable`, and `rate-limited`. Do not show a green online indicator unless the app has a verified health signal; otherwise use “Ask when ready”/“Status unavailable” and explain the next action.

#### H1.2 Destructive reset progress is not guaranteed to settle — severity 3

**Evidence:** `app/[locale]/(dashboard)/dashboard/settings/components/DangerZoneSection.tsx:29-41` sets `loading` before awaiting the reset action but has no `try/catch/finally`. If the action rejects rather than returning an error object, the dialog can remain in a loading state without a recoverable message.

**Fix direction:** Wrap the action in `try/catch/finally`, preserve the dialog on failure, show a translated error, and make the current operation/status explicit.

### H2 — Match between system and the real world

**Max severity: 3 (major)**

#### H2.1 Reset copy contradicts the actual retention behavior — severity 3

**Evidence:** The danger-zone dialog says active invoices will be “permanently deleted” at `DangerZoneSection.tsx:92-101`. The server action actually sets invoices to `status = 'archived'` and Khata transactions to `status = 'cancelled'` at `lib/actions/business.ts:128-141`.

**Impact:** Users cannot form a correct mental model of what “reset” does. Invoices that remain in the database must not be described as permanently deleted, especially in an open-source financial product.

**Fix direction:** Use one canonical domain term (“archive”, “cancel”, or the exact retention policy), state what remains recoverable, and make the confirmation summary match the transaction semantics.

#### H2.2 Account labels use unexplained or unverified product language — severity 2

**Evidence:** `DashboardSidebar.tsx:65-66` labels the product “PRO LEDGER”; `MobileDrawer.tsx:116-128` presents “GST & Khata Ready”, “Enterprise Cloud Sync”, and “Active”; `MobileDrawer.tsx:95-100` supplies fallback identity text such as “Verified Merchant”.

**Impact:** These labels describe plan, sync, or verification states that are not visibly derived from account state. They read like a mock SaaS shell rather than an honest business workspace.

**Fix direction:** Show the actual business name and data status. Reserve plan/verification/sync labels for real backend-backed states; otherwise remove them.

### H3 — User control and freedom

**Max severity: 3 (major)**

#### H3.1 Shared confirmation dialogs do not provide complete modal escape behavior — severity 3

**Evidence:** `components/ui/ui.tsx:38-71` renders `ConfirmDialog` without `role="dialog"`, `aria-modal`, a labelled heading relationship, Escape handling, backdrop dismissal policy, focus capture, focus trapping, or focus restoration.

**Impact:** Keyboard and assistive-technology users can lose context; users can be trapped in or unable to quickly exit a destructive confirmation. This shared primitive is used across invoice, customer, product, and Khata flows.

**Fix direction:** Harden the primitive once: semantic dialog attributes, initial focus, Escape, explicit backdrop policy, a focus trap, restored trigger focus, and localized action labels.

#### H3.2 Mobile drawer focuses itself but does not trap focus — severity 2

**Evidence:** `components/layout/MobileDrawer.tsx:44-59` locks body scroll and focuses the drawer, but it does not cycle Tab focus within the dialog or restore focus itself; only Escape is handled.

**Fix direction:** Reuse a tested dialog/focus-trap primitive for the drawer and all overlays.

### H4 — Consistency and standards

**Max severity: 3 (major)**

#### H4.1 Search shortcut hints disagree with the implementation — severity 3

**Evidence:** `DashboardSidebar.tsx:72-86` titles the control “Cmd+K” but visibly shows “Shift+K”. `CommandMenu.tsx:31-45` listens for Ctrl/Meta+K, while `KeyboardShortcuts.tsx:49-55` lists Shift+K as the command-menu shortcut and dispatches a synthetic Ctrl+Meta+K event.

**Impact:** Users cannot build a reliable muscle memory for the primary global navigation affordance.

**Fix direction:** Define one shortcut registry and render its platform-aware hint everywhere. Test the actual event path on macOS, Windows, and keyboard-only flows.

#### H4.2 Core authenticated navigation is not consistently localized — severity 3

**Evidence:** `components/layout/BottomNavigation.tsx:15-20` hardcodes Home/Invoices/Customers/Products/Khata; `app/[locale]/(dashboard)/dashboard/settings/page.tsx:34-38` hardcodes tab labels/descriptions; `components/ui/CommandMenu.tsx:56-126` hardcodes command names and keywords; `MobileDrawer.tsx:131-187` hardcodes section labels, support text, and status copy.

**Impact:** Hindi and Hinglish users receive a mixed-language product, and copy changes cannot be managed through the existing translation system.

**Fix direction:** Move all user-facing shell copy into locale messages. Use the same nav/action definition for desktop, mobile, command menu, and shortcuts.

### H5 — Error prevention

**Max severity: 3 (major)**

#### H5.1 A global reset needs stronger confirmation than a checkbox alone — severity 3

**Evidence:** `DangerZoneSection.tsx:104-126` enables “Reset All Khata Data” after a generic checkbox. The operation affects all customers and archives all active invoices for the business, but does not require typed confirmation, a second explicit summary acknowledgement, or a clearly differentiated destructive action label.

**Fix direction:** Show the exact affected counts, use an explicit destructive verb, require typing a confirmation phrase for the global operation, and disable submission until the summary has loaded successfully.

#### H5.2 Positive existing pattern: invoice prevention is strong

**Checked:** `components/invoices/NewInvoiceModal.tsx:431-445` validates before review; `:590-610` makes payment semantics visible; `:612-724` communicates GST, stock, and totals; the server rechecks authoritative values. No additional H5 finding was raised for this flow in this static pass.

### H6 — Recognition rather than recall

**Max severity: 2 (minor)**

#### H6.1 Shortcut/action vocabulary is split across multiple surfaces — severity 2

**Evidence:** The sidebar search hint (`DashboardSidebar.tsx:72-86`), command menu action list (`CommandMenu.tsx:56-126`), and shortcut help (`KeyboardShortcuts.tsx:49-55`) each define overlapping actions independently.

**Impact:** Users must remember which surface is authoritative and may see different names or keys for the same action.

**Fix direction:** Generate visible action labels, shortcut hints, and command-menu entries from one typed registry.

### H7 — Flexibility and efficiency of use

**Max severity: 3 (major)**

#### H7.1 Command menu advertises shortcuts it does not implement — severity 3

**Evidence:** `CommandMenu.tsx:56-126` declares shortcuts such as `G+D`, `G+K`, and `G+I`, but `CommandMenu.tsx:31-45` only handles Ctrl/Meta+K and Escape. There is no two-key sequence listener in the component.

**Impact:** Power users are promised an efficiency path that silently does nothing.

**Fix direction:** Either implement a tested sequence handler with editable-field guards or remove the shortcut metadata until it works.

#### H7.2 Mobile primary navigation omits Assistant and Settings — severity 2

**Evidence:** `BottomNavigation.tsx:15-20` includes five destinations, while `DashboardSidebar.tsx:36-43` includes Assistant and Settings. The mobile drawer contains them only one level deeper.

**Impact:** Important destinations are less discoverable on the primary mobile surface, and the assistant page has no active mobile navigation representation.

**Fix direction:** Preserve a focused five-item bottom nav but add a deliberate “More”/workspace action, or make the assistant available as a contextual dashboard action with correct current-page state.

### H8 — Aesthetic and minimalist design

**Max severity: 3 (major)**

#### H8.1 Authenticated Copilot hero contains unlabelled demo business numbers

**Evidence:** `components/assistant/AssistantPage.tsx:65-103` displays `₹48.2k`, `+18.4%`, “3 items to restock”, and named products such as “USB-C Cable” and “Power Adapter” inside the authenticated product experience.

**Impact:** Users can mistake decorative values for their own business data. This weakens trust and makes the product feel “vibe coded” even when the real assistant is data-scoped.

**Fix direction:** Replace the hero art with abstract, clearly labelled illustration, or bind it to live data and explicitly label it as an example. Never show plausible fake financial figures in a business workspace.

### H9 — Help users recognize, diagnose, and recover from errors

**Max severity: 3 (major)**

#### H9.1 Copilot failure offers dismiss but not retry — severity 2

**Evidence:** `AssistantPage.tsx:347-355` renders the error message with only a Dismiss button. The failed user question remains in the transcript, but there is no retry action or indication that retrying will reuse the same question.

**Fix direction:** Add “Try again”, preserve the failed prompt, distinguish data/provider/rate-limit failures, and keep the input available for correction.

#### H9.2 Global reset lacks a robust rejected-promise recovery path — severity 3

**Evidence:** `DangerZoneSection.tsx:29-41` has no rejection handler/finally block around `resetAllKhataData(true)`.

**Impact:** A network or unexpected server failure can leave the user with no actionable explanation and a permanently busy control until navigation.

**Fix direction:** Add a catch/finally path and a stable, localized recovery message; do not close the modal on failure.

### H10 — Help and documentation

**Max severity: 2 (minor)**

#### H10.1 Help is an external email escape hatch, not contextual product help — severity 2

**Evidence:** `DashboardSidebar.tsx:125-143` and `MobileDrawer.tsx:177-186` provide a mailto support link, but the inspected authenticated flows have no contextual help for GST treatment, Khata reset semantics, invoice status, or Copilot data boundaries.

**Fix direction:** Add concise inline explanations and a searchable help center/knowledge base entry point. Keep email support as a fallback, not the only help system.

## Prioritized fix queue

### P0 — Trust and safety foundation

1. ~~Correct reset terminology and align copy with archive/cancel behavior.~~ Resolved in the first Phase 2B slice.
2. ~~Harden all destructive dialogs: focus, Escape, labels, focus restoration, rejection handling, and typed confirmation for global reset.~~ Shared primitive and global reset path hardened; runtime verification remains.
3. ~~Remove fake/unsupported account status and plan claims.~~ Resolved in public/auth and authenticated shell surfaces; continue auditing new copy.

### P1 — Coherent product shell

4. ~~Create a single localized navigation/action/shortcut registry.~~ Registry implemented; new routes must continue using it.
5. ~~Fix Cmd/Ctrl/Shift shortcut contradictions and implement or remove advertised sequences.~~ Implemented for registered shortcuts; runtime keyboard QA remains.
6. ~~Make mobile current-page state and Assistant/More navigation intentional.~~ More navigation now includes Assistant, Reports, and Settings; runtime QA remains.

### P1 — Truthful Copilot experience

7. ~~Replace fake financial figures in the Copilot illustration.~~ Resolved with an abstract, labelled illustration.
8. ~~Make readiness/data/provider status truthful and add retryable error states.~~ Implemented; real provider/database request still needs authenticated smoke testing.

### P2 — Enterprise polish

9. ~~Add contextual help for GST, Khata, invoice lifecycle, and data privacy.~~ Help Center and workflow explanations are implemented; authenticated/runtime verification remains.
10. Run a real authenticated visual pass at 360px, 768px, 1280px, and 1440px after the database connection is healthy.

## Verdict

**Major issues present.** This codebase evaluation found multiple severity-3 issues, but no severity-4 catastrophe. The highest leverage work is trust and interaction infrastructure, not adding more decorative content. A single evaluator typically finds only a fraction of usability problems; this report should be followed by an authenticated visual walkthrough and user testing with Indian vendors before calling the product flagship-ready.

## Phase 2B handoff (historical baseline)

The next implementation slice was intended to address the P0 foundation in shared primitives and the shell before further page-specific decoration. Those implementation slices are now present; keep the list as a traceable baseline for runtime acceptance:

1. Replace `ConfirmDialog` with an accessible, localized dialog primitive.
2. Repair global shortcut/navigation consistency.
3. Remove unverified status/demo claims and make Copilot state truthful.
4. Add recovery paths for reset and Copilot errors.
