import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { useToast } from '../contexts/ToastContext';
import { useOrg } from '../lib/tenant';
import { supabase, SUPABASE_READY } from '../lib/supabase';

type SettingsTab = 'Profile' | 'Company' | 'Security' | 'Integrations';
interface SettingsForm {
  displayName: string;
  organizationName: string;
  email: string;
}

const MANAGER_ROLES = new Set(['S0_SOVEREIGN', 'B1_CEO', 'A3_PICARD', 'B2_MANAGER']);

export const SettingsView: React.FC = () => {
  const { isAuthenticated, orgId, orgName, role } = useOrg();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('Profile');
  const [form, setForm] = useState<SettingsForm>({ displayName: '', organizationName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManageOrganization = MANAGER_ROLES.has(role.toUpperCase());

  const load = useCallback(async (): Promise<void> => {
    if (!SUPABASE_READY) {
      setError('Marketplace Supabase is not configured.');
      setLoading(false);
      return;
    }
    if (!isAuthenticated || !orgId) {
      setError('An authenticated organization membership is required to load settings.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', {
        body: { action: 'get_settings', organization_id: orgId },
      });
      if (invokeError) throw invokeError;
      const payload = data?.data as Record<string, unknown> | undefined;
      if (!payload) throw new Error('Settings API returned no profile data.');
      setForm({
        displayName: String(payload.display_name ?? ''),
        organizationName: String(payload.organization_name ?? orgName ?? ''),
        email: String(payload.email ?? ''),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load settings.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, orgId, orgName]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (): Promise<void> => {
    if (!orgId) {
      setError('An active organization is required.');
      return;
    }
    const isProfile = activeSubTab === 'Profile';
    const value = isProfile ? form.displayName.trim() : form.organizationName.trim();
    if (!value) {
      setError(isProfile ? 'Display name is required.' : 'Organization name is required.');
      return;
    }
    if (!isProfile && !canManageOrganization) {
      setError('An organization manager role is required to rename this organization.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const body = isProfile
        ? { action: 'update_settings', organization_id: orgId, display_name: value }
        : { action: 'update_settings', organization_id: orgId, organization_name: value };
      const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', { body });
      if (invokeError) throw invokeError;
      const payload = data?.data as Record<string, unknown> | undefined;
      if (!payload) throw new Error('Settings API returned no saved profile.');
      setForm((current) => ({
        ...current,
        displayName: String(payload.display_name ?? current.displayName),
        organizationName: String(payload.organization_name ?? current.organizationName),
        email: String(payload.email ?? current.email),
      }));
      showToast(isProfile ? 'Profile saved.' : 'Organization name saved.', 'success');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to save settings.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const canSave = activeSubTab === 'Profile' || activeSubTab === 'Company';
  const saveDisabled =
    loading ||
    saving ||
    (activeSubTab === 'Profile' && !form.displayName.trim()) ||
    (activeSubTab === 'Company' && (!canManageOrganization || !form.organizationName.trim()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <BackButton />
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Roots (Settings)</h1>
        <p className="text-slate-500 text-sm mt-1">
          Profile and organization settings
          {isAuthenticated ? <> · Org <span className="font-mono text-xs">{orgId?.slice(0, 8) ?? '—'}</span></> : null}
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-stone-200 p-1 flex flex-wrap bg-stone-50">
          {(['Profile', 'Company', 'Security', 'Integrations'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeSubTab === tab
                  ? 'bg-white shadow-sm text-slate-900 border border-stone-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-8">
          {loading && <p className="text-sm text-slate-500" role="status">Loading persisted settings…</p>}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm" role="alert">
              {error}
              {!loading && <button type="button" onClick={() => void load()} className="ml-3 underline font-semibold">Retry</button>}
            </div>
          )}

          {!loading && activeSubTab === 'Profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Personal Information</h3>
                <p className="text-sm text-slate-500">The display name is stored in the canonical identity profile.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="profile-display-name" className="text-sm font-medium text-slate-700">Display name</label>
                  <input
                    id="profile-display-name"
                    type="text"
                    maxLength={120}
                    value={form.displayName}
                    onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="profile-email" className="text-sm font-medium text-slate-700">Authentication email</label>
                  <input id="profile-email" type="email" value={form.email} readOnly className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-lg text-sm text-slate-500" />
                  <p className="text-xs text-slate-400">Email changes are managed by Supabase Auth and require verification.</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">Profile photo</p>
                  <p className="text-xs text-slate-500">Avatar storage is not configured yet.</p>
                </div>
                <button type="button" disabled title="Profile avatar storage is not configured." className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-slate-400 cursor-not-allowed">Change Photo</button>
              </div>
            </div>
          )}

          {!loading && activeSubTab === 'Company' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Organization Information</h3>
                <p className="text-sm text-slate-500">The organization name is stored in the canonical identity registry.</p>
              </div>
              <div className="space-y-1.5 max-w-xl">
                <label htmlFor="organization-name" className="text-sm font-medium text-slate-700">Organization name</label>
                <input
                  id="organization-name"
                  type="text"
                  maxLength={120}
                  value={form.organizationName}
                  disabled={!canManageOrganization}
                  onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-slate-400"
                />
                {orgId && <p className="text-xs text-slate-400 font-mono">Organization ID: {orgId}</p>}
                {!canManageOrganization && <p className="text-xs text-amber-700">Only an organization manager can rename this organization.</p>}
              </div>
            </div>
          )}

          {!loading && activeSubTab === 'Security' && (
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Security</h3>
              <p className="text-sm text-slate-500 mt-2">Authentication and session security are governed by the Supabase Auth configuration.</p>
              <p className="text-sm text-slate-500 mt-2">This screen does not claim to change MFA, password policy or session lifetime.</p>
            </div>
          )}

          {!loading && activeSubTab === 'Integrations' && (
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Integrations</h3>
              <p className="text-sm text-slate-500 mt-2">Provider connections are managed through the Marketplace Adapter Registry.</p>
              <p className="text-sm text-slate-500 mt-2">Secrets are never displayed in this settings screen.</p>
            </div>
          )}

          {canSave && !loading && (
            <div className="pt-6 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saveDisabled}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;
