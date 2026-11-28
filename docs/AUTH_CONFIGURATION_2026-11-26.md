# Marketplace Auth configuration — 2026-11-26

**Supabase project:** `swegnrvaxxgfrnshdpxx`  
**Auth service status before update:** `ACTIVE_HEALTHY`  
**Auth implementation route:** `/auth/callback` (confirmed in `src/App.tsx`, `src/apps/auth/OAuthCallback.tsx`, and `src/lib/authProviders.ts`).

## Applied URL configuration

- Site URL: `https://business-marketplace-amd-lab.vercel.app`
- Redirect allowlist:
  - `https://business-marketplace-amd-lab.vercel.app/**`
  - `https://business-marketplace-*-amd-lab.vercel.app/**`
  - `http://localhost:5173/**`
  - `http://localhost:3000/**`

This scopes preview redirects to the Business Marketplace project name rather than allowing every Vercel project in the team. The production site URL is exact; previews and local development use separate allowlist patterns.

## Provider status

- Email/password: enabled.
- Email confirmation: enabled (`mailer_autoconfirm=false`).
- Google, Apple and Azure OAuth: currently disabled/unconfigured.
- No SMTP provider is configured in this project at the time of inspection; delivery behavior must be validated before relying on signup confirmation email in production.

## Validation boundary

The Management API update returned the new `site_url` and `uri_allow_list` values. A real signup/confirmation/sign-in flow has not yet been executed from a browser session. Do not interpret the redirect configuration update as proof that email delivery or OAuth providers are operational.
