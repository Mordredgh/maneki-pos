# Maneki POS — Web App (Coolify)

## Runtime Environment

This is a **web application** deployed on Coolify (VPS: 195.26.247.101).
URL: https://pos.manekistore.com.mx
Protected by nginx Basic Auth.

- No Electron, no desktop app, no SQLite local.
- Do NOT reference electron, ipcRenderer, preload.js, or SQLite.
- Verification is done by reading source files, not by launching a server.

## Stack

- Vanilla JavaScript, no bundler/framework
- Supabase (remote) — primary data store
- localStorage — local cache only
- CSS via `css/styles.css`, `css/ui-redesign.css`, `css/responsive.css`
- Deploy: `git push github fresh-start:master` → Coolify auto-deploy

## Project Layout

```
index.html          — Main SPA page (~3300 lines)
js/
  config.js         — App init, store config, helpers (_fechaHoy, calcSaldoPendiente, getStockEfectivo)
  db.js             — Supabase client + localStorage cache + Realtime setup
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
  ui-redesign.css
  responsive.css
```

## Key Conventions

- **UTC date bug**: Always use `window._fechaHoy()` (defined in config.js) instead of `new Date().toISOString().split('T')[0]`.
- **CxC source of truth**: `calcSaldoPendiente(p)` — never use `p.resta` directly.
- **Stock source of truth**: `getStockEfectivo(p)` — handles variants correctly.
- **Product lookup**: `_getProductById(id)` — O(1) via productMap.
- **UUID**: `mkId()` — single unified generator.
- **Error handling**: `mkHandleError(err, context)` — centralized.
- **Sales history**: `_getAllVentas()` in reportes.js is memoized — don't bypass it.
- **Realtime guard**: `window._mkRTSetupDone` prevents duplicate Supabase channels.
