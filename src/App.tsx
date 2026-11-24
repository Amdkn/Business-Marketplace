/**
 * App — Marketplace product entry point.
 *
 * Auth remains the inherited Supabase gate for this foundation pass.
 * After authentication, the Marketplace Control Plane is the primary
 * experience. The inherited Business Office 3-surface runtime remains
 * available as a separate workspace surface.
 */
import { useEffect, useState } from 'react';
import { Desktop } from './components/Desktop';
import { ThemeApplier } from './lib/themes/ThemeApplier';
import { AuthPage } from './apps/auth/AuthPage';
import { OAuthCallback } from './apps/auth/OAuthCallback';
import { supabase } from './lib/supabase';
import type { TenantLevel } from './lib/authProviders';
import { MarketplaceControlPlane } from './apps/control-plane/MarketplaceControlPlane';

type AuthMode = 'pending' | 'supabase' | 'demo';
type ProductSurface = 'control-plane' | 'business-office';

const AUTH_BOOT_KEY = 'coach-os:auth:v1';

interface AuthBootState {
  mode: AuthMode;
  level: TenantLevel;
  email?: string;
}

function isOAuthCallbackPath(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.toLowerCase().startsWith('/auth/callback');
}

function demandeLaPorte(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('auth');
}

function readBootState(): AuthBootState {
  if (typeof window === 'undefined') return { mode: 'pending', level: 'architect' };
  if (demandeLaPorte()) {
    try { window.localStorage.removeItem(AUTH_BOOT_KEY); } catch { /* navigation privee */ }
    return { mode: 'pending', level: 'architect' };
  }
  try {
    const brut = window.localStorage.getItem(AUTH_BOOT_KEY);
    if (!brut) return { mode: 'pending', level: 'architect' };
    const parsed = JSON.parse(brut) as Partial<AuthBootState>;
    if (parsed.mode === 'demo') return { mode: 'demo', level: 'demo' };
    return { mode: 'pending', level: 'architect' };
  } catch {
    return { mode: 'pending', level: 'architect' };
  }
}

function writeBootState(state: AuthBootState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(AUTH_BOOT_KEY, JSON.stringify(state)); } catch { /* quota / private mode */ }
}

export default function App() {
  const [boot, setBoot] = useState<AuthBootState>(() => readBootState());
  const [surface, setSurface] = useState<ProductSurface>('control-plane');

  useEffect(() => {
    if (boot.mode !== 'pending') return;
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          setBoot({ mode: 'supabase', level: 'architect', email: data.session.user.email ?? undefined });
        }
      } catch {
        // No active session — keep the sign-in gate visible.
      }
    })();
    return () => { cancelled = true; };
  }, [boot.mode]);

  const handleAuthenticated = (session: { mode: 'supabase' | 'demo'; level: TenantLevel; email?: string }): void => {
    const next: AuthBootState = {
      mode: session.mode === 'demo' ? 'demo' : 'supabase',
      level: session.level,
      email: session.email,
    };
    writeBootState(next);
    setSurface('control-plane');
    setBoot(next);
  };

  return (
    <>
      <ThemeApplier />
      {isOAuthCallbackPath() ? (
        <OAuthCallback />
      ) : boot.mode === 'pending' ? (
        <AuthPage onAuthenticated={handleAuthenticated} />
      ) : surface === 'business-office' ? (
        <>
          <Desktop />
          <button
            type="button"
            onClick={() => setSurface('control-plane')}
            style={{ position: 'fixed', zIndex: 100000, top: 12, right: 16, padding: '9px 13px', borderRadius: 8, border: '1px solid #526354', background: '#17231d', color: '#eaf2e3', fontSize: 11, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px #0003' }}
          >
            ← Business Marketplace
          </button>
        </>
      ) : (
        <MarketplaceControlPlane onOpenOffice={() => setSurface('business-office')} />
      )}
    </>
  );
}
