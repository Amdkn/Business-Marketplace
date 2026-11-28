// src/auth/AuthProvider.tsx
// Phase C + F — JWT-aware auth context + Edge Function signUp onboarding.
// Reads 'org_id' + 'role' claims from Supabase session JWT (Phase A: custom_access_token_hook).
// In saas mode, missing org_id → RLS will silently return 0 rows (warn per ADR-SUPABASE-001).
// signUp() invokes `marketplace-api.create_tenant` to atomically
// create auth.users + identity.organizations + identity.organization_memberships in one request.

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { supabase, SUPABASE_READY } from '../lib/supabase';
import { APP_MODE } from '../config/mode';
import { setActiveOrgIdCache, setActiveWorkspaceIdCache } from '../lib/tenant';
import type { AuthUser, Organization } from '../lib/types';

export interface AuthContextValue {
  user: AuthUser | null;
  organization: Organization | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, orgName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtClaims(token: string): { org_id?: string; role?: string; sub?: string; email?: string } {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    return {
      org_id: payload.org_id ?? payload.app_metadata?.org_id,
      // Phase II v3 (D6 #94 fix, 2026-06-20): the JWT top-level `role` claim is
      // hardcoded to 'authenticated' in public.custom_access_token_hook so that
      // PostgREST uses a real Postgres role (Supabase Cloud doesn't have an
      // 'owner' / 'admin' / 'member' / 'viewer' role). The actual membership
      // role string now lives in app_metadata.role — read that first for UI
      // display, fall back to top-level (legacy) only if app_metadata is absent.
      role: payload.app_metadata?.role ?? payload.role,
      sub: payload.sub,
      email: payload.email ?? payload.app_metadata?.email,
    };
  } catch {
    return {};
  }
}

async function fetchUserOrg(orgId: string): Promise<Organization | null> {
  if (!SUPABASE_READY) return null;
  const { data, error } = await supabase.schema('identity').from('organizations').select('*').eq('id', orgId).maybeSingle();
  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[auth] failed to fetch organization', error.message);
    }
    return null;
  }
  return data as Organization | null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    if (!SUPABASE_READY) {
      setActiveOrgIdCache(null);
      setActiveWorkspaceIdCache(null);
      setIsLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUser(null);
      setOrganization(null);
      setActiveOrgIdCache(null);
      setActiveWorkspaceIdCache(null);
      setIsLoading(false);
      return;
    }
    const claims = decodeJwtClaims(session.access_token);
    const userId = claims.sub ?? session.user.id;

    // enterprise remains private. The identity RPC returns only this caller's
    // unique active org/workspace and role, without exposing private tables.
    const { data: contexts, error: contextError } = await supabase
      .schema('identity')
      .rpc('get_current_workspace_context');
    if (contextError) throw contextError;
    const context = Array.isArray(contexts) ? contexts[0] : contexts;
    const orgId = context?.organization_id as string | undefined;
    const workspaceId = context?.workspace_id as string | undefined;
    const role = (context?.role_code as string | undefined)
      ?? (claims.role && claims.role !== 'authenticated' ? claims.role : 'authenticated');

    const authUser: AuthUser = {
      id: userId,
      email: claims.email ?? session.user.email ?? '',
      orgId: orgId ?? null,
      role,
      isAuthenticated: true,
    };
    setUser(authUser);
    setActiveOrgIdCache(authUser.orgId);
    setActiveWorkspaceIdCache(workspaceId ?? null);

    if (authUser.orgId) {
      const org = await fetchUserOrg(authUser.orgId);
      setOrganization(org);
      if (!workspaceId && APP_MODE === 'saas') {
        throw new Error('No unique active workspace context is available for this organization.');
      }
    } else {
      setOrganization(null);
      setActiveWorkspaceIdCache(null);
      if (APP_MODE === 'saas' && import.meta.env.DEV) {
        console.warn('[marketplace] no unique active organization/workspace context — tenant repositories remain closed');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void hydrate().catch((err: unknown) => {
      setActiveWorkspaceIdCache(null);
      setIsLoading(false);
      if (import.meta.env.DEV) {
        console.error('[auth] tenant hydration failed; Garden repositories remain closed', err);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void hydrate().catch((err: unknown) => {
        setActiveWorkspaceIdCache(null);
        setIsLoading(false);
        if (import.meta.env.DEV) {
          console.error('[auth] tenant re-hydration failed; Garden repositories remain closed', err);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [hydrate]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!SUPABASE_READY) return { error: 'Supabase not configured (set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, orgName: string) => {
    if (!SUPABASE_READY) {
      return { error: 'Supabase not configured (set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)' };
    }

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { org_name: orgName } },
    });
    if (signUpErr) return { error: signUpErr.message };
    if (!signUpData.user) return { error: 'Sign-up succeeded but no user was returned.' };

    // Obtain the authenticated bearer session before provisioning the tenant.
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) return { error: `User created but sign-in failed: ${signInErr.message}` };

    // One server-side transaction creates the organization, B1 owner binding,
    // default workspace, and workspace OWNER membership. No client-supplied
    // user ID or service-role credential is trusted.
    const { data: provisioned, error: provisionError } = await supabase.functions.invoke<{
      data?: {
        organization?: { id?: string; name?: string };
        workspace?: { id?: string; name?: string };
      };
      error?: string;
    }>('marketplace-api', {
      body: { action: 'create_tenant', organization_name: orgName },
    });
    if (provisionError) {
      return { error: `Organization/workspace provisioning failed: ${provisionError.message}` };
    }
    if (!provisioned?.data?.organization?.id || !provisioned?.data?.workspace?.id) {
      return { error: provisioned?.error ?? 'Tenant provisioning returned an incomplete organization/workspace.' };
    }

    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) return { error: `Tenant created but session refresh failed: ${refreshError.message}` };
    try {
      await hydrate();
    } catch (reason) {
      return { error: reason instanceof Error ? `Tenant created but context hydration failed: ${reason.message}` : 'Tenant created but context hydration failed.' };
    }
    return { error: null };
  }, [hydrate]);

  const signOut = useCallback(async () => {
    if (SUPABASE_READY) await supabase.auth.signOut();
    setUser(null);
    setOrganization(null);
    setActiveOrgIdCache(null);
    setActiveWorkspaceIdCache(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, organization, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
