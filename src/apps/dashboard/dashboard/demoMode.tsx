import { useIsDemoTenant } from '../../../lib/cms/useIsDemoTenant';

export function useDashboardDemoMode(): boolean {
  return useIsDemoTenant();
}

export function RuntimeUnavailable({ title, description }: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-5 p-7">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--theme-text-muted)' }}>
          Marketplace · runtime integration
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight" style={{ color: 'var(--theme-text)' }}>{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>{description}</p>
      </div>
      <div className="rounded-2xl border border-dashed p-6" style={{ borderColor: 'var(--panel-border)', background: 'var(--theme-surface)' }}>
        <div className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>No verified runtime records</div>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
          This workspace will show values only after the corresponding provider, event source or ledger is connected and records are ingested. Demo fixtures are confined to the demo tenant.
        </p>
      </div>
    </div>
  );
}
