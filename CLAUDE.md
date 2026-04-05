# Maneki POS — Electron App

## Runtime Environment

This is a **desktop Electron application** — not a web app and not a dev server project.

- **No dev server** exists or is needed. Do NOT call `preview_start`, `preview_stop`, or any `preview_*` tools.
- **No browser preview** — the app runs via `electron .` in a native window.
- The `[Preview Required]` stop hook does not apply here. Skip the verification_workflow entirely.
- Verification is done by reading source files, not by launching a server.

## Stack

- Electron (main + preload + renderer)
- Vanilla JavaScript, no bundler/framework
- SQLite (local) + Supabase (remote) dual persistence
- CSS via `css/styles.css` and `css/design-system.css`

## Project Layout

```
index.html          — Main renderer (single-page app, ~3300 lines)
main.js             — Electron main process
preload.js          — contextBridge / IPC surface
js/
  config.js         — App init, store config, helpers (_fechaHoy, calcSaldoPendiente, getStockEfectivo)
  db.js             — Supabase client + SQLite IPC + Realtime setup
  dashboard.js      — Home dashboard widgets
  pedidos-1.js      — Order modal open/close/save
  pedidos-2.js      — Kanban board, status transitions, inventory discount
  pedidos-3.js      — Print, duplicate, WhatsApp helpers
  inventory-1..5.js — Product CRUD, variants, stock alerts
  balance.js        — CxC / CxP / movements
  reportes.js       — Charts and monthly stats
  whatsapp.js       — WA message builder
  design-system.js  — Theme, dark mode, lazy section loader
css/
  styles.css
  design-system.css
```

## Key Conventions

- **UTC date bug**: Always use `window._fechaHoy()` (defined in config.js) instead of `new Date().toISOString().split('T')[0]`.
- **CxC source of truth**: `calcSaldoPendiente(p)` — never use `p.resta` directly.
- **Stock source of truth**: `getStockEfectivo(p)` — handles variants correctly.
- **Sales history**: `_getAllVentas()` in reportes.js is memoized — don't bypass it.
- **Realtime guard**: `window._mkRTSetupDone` prevents duplicate Supabase channels.
