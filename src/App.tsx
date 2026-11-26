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
import { useTenantStore } from './stores/tenant.store';
import { useShellStore } from './stores/shell.store';

type AuthMode = 'pending' | 'supabase' | 'demo';
type ProductSurface = 'control-plane' | 'business-office';

const AUTH_BOOT_KEY = 'aspace-marketplace:auth:v1';

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

async function ensureTenantProvisioned(): Promise<void> {
  const { data: organizationResult, error: organizationError } = await supabase.functions.invoke<{
    data?: Array<{ id: string; name: string }>;
  }>('marketplace-api', { body: { action: 'list_organizations' } });
  if (organizationError) throw new Error(`Unable to resolve organization memberships: ${organizationError.message}`);

  const organizations = organizationResult?.data ?? [];
  if (organizations.length > 1) {
    throw new Error('Multiple organizations are available; organization selection must be completed before opening a workspace.');
  }

  if (organizations.length === 0) {
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult.user) throw new Error('Authenticated user could not be resolved for tenant onboarding.');
    const metadata = userResult.user.user_metadata ?? {};
    const fullName = [metadata.first_name, metadata.last_name]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' ')
      .trim();
    const emailPrefix = userResult.user.email?.split('@')[0] ?? 'My';
    const organizationName = typeof metadata.organization_name === 'string' && metadata.organization_name.trim()
      ? metadata.organization_name.trim()
      : `${fullName || emailPrefix} Workspace`;

    const { data: provisioned, error: provisionError } = await supabase.functions.invoke<{
      data?: { organization?: { id?: string }; workspace?: { id?: string } };
    }>('marketplace-api', {
      body: { action: 'create_tenant', organization_name: organizationName },
    });
    if (provisionError) throw new Error(`Tenant onboarding failed: ${provisionError.message}`);
    if (!provisioned?.data?.organization?.id || !provisioned?.data?.workspace?.id) {
      throw new Error('Tenant onboarding did not return both an organization and a workspace.');
    }
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error(`Tenant was created but the session could not be refreshed: ${refreshError.message}`);
    return;
  }

  const organization = organizations[0];
  const { data: workspaceResult, error: workspaceError } = await supabase.functions.invoke<{
    data?: Array<{ id: string; workspace_status: string }>;
  }>('marketplace-api', {
    body: { action: 'list_workspaces', organization_id: organization.id },
  });
  if (workspaceError) throw new Error(`Unable to resolve workspace memberships: ${workspaceError.message}`);
  const workspaces = workspaceResult?.data ?? [];
  if (workspaces.length === 0) {
    const { data: created, error: createError } = await supabase.functions.invoke<{
      data?: { id?: string };
    }>('marketplace-api', {
      body: {
        action: 'create_workspace',
        organization_id: organization.id,
        workspace_key: 'main',
        name: 'Main Workspace',
        description: 'Default workspace provisioned during account onboarding.',
      },
    });
    if (createError) throw new Error(`Default workspace provisioning failed: ${createError.message}`);
    if (!created?.data?.id) throw new Error('Default workspace provisioning returned no workspace identifier.');
  } else {
    const activeWorkspaces = workspaces.filter((workspace) => workspace.workspace_status === 'ACTIVE');
    if (activeWorkspaces.length !== 1) {
      throw new Error('The account has multiple or no active workspaces; explicit workspace selection is not yet connected to this entry point.');
    }
  }
}

export default function App() {
  const [boot, setBoot] = useState<AuthBootState>(() => readBootState());
  const [surface, setSurface] = useState<ProductSurface>('control-plane');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled || !data.session) return;
        // A real Supabase session always wins over a stale local demo marker.
        await ensureTenantProvisioned();
        await useTenantStore.getState().bootstrap();
        if (cancelled) return;
        setBoot({ mode: 'supabase', level: 'architect', email: data.session.user.email ?? undefined });
      } catch {
        // Keep the explicit demo state or the sign-in gate; never fabricate a session.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAuthenticated = async (session: { mode: 'supabase' | 'demo'; level: TenantLevel; email?: string }): Promise<void> => {
    const next: AuthBootState = {
      mode: session.mode === 'demo' ? 'demo' : 'supabase',
      level: session.level,
      email: session.email,
    };
    writeBootState(next);
    if (next.mode === 'supabase') {
      try {
        await ensureTenantProvisioned();
        await useTenantStore.getState().bootstrap();
        setSurface('control-plane');
        setBoot(next);
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : 'Tenant onboarding failed.';
        useShellStore.getState().addToast({ source: 'auth', type: 'error', message });
        setBoot({ mode: 'pending', level: 'architect' });
      }
      return;
    }
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
