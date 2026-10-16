# BillForge product design system

This is the shared visual and interaction contract for the authenticated BillForge workspace. It is intentionally small: a billing product earns trust through consistent behavior and readable data, not through a large catalogue of decorative components.

## Product posture

- **Calm, precise, operational.** The interface should feel capable of handling money and customer history.
- **Signal before decoration.** Use color, motion, and illustration to explain state or guide the next action; never to manufacture activity.
- **Indian business context first.** Currency is INR, dates follow the user's locale, and GST/Khata language must remain explicit.
- **Every state is designed.** Loading, empty, error, partial-data, success, disabled, destructive, and mobile states are part of the feature contract.

## Tokens

The source of truth is `app/globals.css`:

- surfaces: `--background`, `--surface`, `--surface-elevated`, `--surface-hover`
- content: `--foreground`, `--muted-foreground`
- structure: `--border`, `--border-strong`, `--shadow-*`, `--radius-card`
- semantic state: `--success-*`, `--warning-*`, `--danger-*`, `--info-*`
- focus: `--focus-ring`, `--focus-ring-shadow`

Use semantic tokens instead of hard-coded state colors. Every state must remain legible in both light and dark themes.

## Layout rules

- Authenticated pages render inside the shared dashboard shell and content width.
- Desktop uses the sidebar; mobile uses the fixed header and bottom navigation.
- Primary actions remain visible in the page header or the first workflow section.
- Data-heavy surfaces use a table at desktop and an equivalent information-complete card at mobile; never hide the status or amount on small screens.
- Touch targets are at least 44px. Inputs remain 16px or larger on mobile to avoid browser zoom.

## Workflow rules

1. State what the user is looking at.
2. Explain the next useful action.
3. Show authoritative values and their source/boundary.
4. Confirm destructive actions with scope, consequence, and recoverability.
5. On failure, keep the user's input and provide a retry path.
6. After a successful mutation, show the persisted result and the next relevant action.

## Navigation and shortcuts

`components/ui/KeyboardShortcuts.tsx` is the registry for shell navigation and implemented shortcuts. Desktop sidebar, mobile bottom navigation/drawer, command menu, and shortcut help must consume that registry rather than maintain parallel labels or routes.

## AI boundary

The Copilot is read-only. It receives a bounded, tenant-scoped summary from the server and must not imply that it can mutate records. Provider readiness is distinct from a confirmed provider response; the UI must not label an untested provider “online”.

## Quality gate

Before calling a workflow complete, verify:

- keyboard and screen-reader path
- light and dark theme
- English, Hindi, and Hinglish copy
- narrow mobile and wide desktop layouts
- real loading/error/empty/success states
- tenant-scoped server query and mutation behavior
- `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run db:check`, and `npm run build`
