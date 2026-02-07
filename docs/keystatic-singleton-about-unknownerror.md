# Debugging: Keystatic “Internal error (Runtime UnknownError)” on `/keystatic/singleton/about`

## Summary

The Keystatic About singleton UI can show a generic “Internal error (Runtime UnknownError)” when:

1. The underlying stored JSON does not match the Keystatic schema (missing required nested fields), and/or
2. The Keystatic UI requests the singleton data via `/api/keystatic/singleton/<name>` but the project does not expose a matching API route.

This repository now addresses both:

- `src/content/about.json` includes `calendar.link` and the schema provides a default for it.
- A dedicated API route exists at `/api/keystatic/singleton/[singleton]` and returns the singleton JSON.

## How to reproduce (pre-fix)

1. Start dev server with Turbopack:
   - `npm run dev`
2. Make the stored content inconsistent with the schema:
   - Remove `calendar.link` from `src/content/about.json` (leave only `calendar.display`).
3. Open:
   - `http://localhost:3000/keystatic/singleton/about`
4. Observe a generic Keystatic “Internal error / UnknownError”.

In logs, you may also see:

- `GET /api/keystatic/singleton/about 404`

## Root cause analysis

### 1) Schema/data mismatch (missing required field)

- Keystatic schema for About defines:
  - `calendar.link` as `fields.text(...)` without a default
- Stored JSON previously had:
  - `calendar: { display: false }`

That mismatch can cause Keystatic’s editor to fail when building the form state for the singleton.

### 2) Missing singleton API endpoint (404)

While loading the About singleton, the UI can request:

- `/api/keystatic/singleton/about`

The standard Keystatic generic API handler does not implement `singleton/<name>` in local storage mode, so it returns `404 Not Found`. In some cases this results in a generic internal error UI.

## Fix implemented

1. Data repair:
   - Add `calendar.link` to `src/content/about.json` (empty string is safe).
2. Schema hardening:
   - Add `defaultValue: ''` for `calendar.link` in `keystatic.config.tsx`.
3. API support:
   - Implement `/api/keystatic/singleton/[singleton]` returning the singleton JSON via Keystatic reader.
   - The handler supports Next’s `params` being either an object or a Promise.

## Validation steps

- Open:
  - `/api/keystatic/singleton/about` should return `200` JSON.
  - `/keystatic/singleton/about` should render without the internal error UI.

## Regression tests

Node-environment tests were added:

- `src/keystatic/__tests__/keystaticAbout.node.test.ts`
  - Asserts the reader can load About and `calendar.link` exists.
  - Asserts the API route returns JSON with `calendar.link`.

Run:

- `npm test`
