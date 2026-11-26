import { useEffect, useState } from 'react';
import { Wallet, PiggyBank, Receipt, BarChart3, FileText, CheckCircle2, Scale, LineChart, Coins, CircleDollarSign, Plus, Check } from 'lucide-react';
import { AppFrame, SectionHead, type AppSection } from '../../components/AppFrame';
import { Card, StatCard } from '../_ui/kit';
import { useCollectionDrill } from '../../hooks/useCollectionDrill';
import { useCmsStore } from '../../lib/cms/cms.store';
import type { CmsItem } from '../../lib/cms/types';
import { useWindowPage } from '../../contexts/WindowContext';
import { AppDetailOverlay } from '../../components/cms/AppDetailOverlay';
import { DynamicPageView } from '../../components/cms/DynamicPageView';
import { FinanceDetailPage, type FinanceDetailItem } from './FinanceDetailPage';
import { registerItemDetail } from '../../components/cms/itemDetailRegistry';
import { FinanceItemDetail } from './FinanceItemDetail';
import { FleetItemGrid } from '../_ui/FleetItemCard';
import { CollectionRepeater } from '../../components/cms/CollectionRepeater';
import { seedFinanceCms } from './seed';
import { useShellStore } from '../../stores/shell.store';
import { useIsDemoTenant } from '../../lib/cms/useIsDemoTenant';

registerItemDetail('finance', FinanceItemDetail);
seedFinanceCms();

const ACCENT = '#0d9488';

// Pixel height (instead of %) — in a flex-col child the parent has no fixed
// height, so percentage heights of the bars resolve to 0 against the parent's
// auto height and the chart came out empty. A constant BAR_HEIGHT leaves room
// for the month label (~14px) + the gap-2 (8px) below it.
const RUNWAY_BAR_PX = 160;

function formatInvoiceAmount(amount: number, currency: string | null | undefined): string {
  const code = String(currency ?? '').toUpperCase();
  if (/^[A-Z]{3}$/.test(code)) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount); } catch { /* use explicit unset label */ }
  }
  return `${amount.toLocaleString()} · currency not set`;
}

function Overview() {
  const invoices = useCmsStore((state) => state.items.invoices ?? []);
  const paid = invoices.filter((invoice) => /paid/i.test(String(invoice.status ?? ''))).length;
  const open = invoices.length - paid;
  const outstandingByCurrency = new Map<string, number>();
  for (const invoice of invoices) {
    if (/paid/i.test(String(invoice.status ?? ''))) continue;
    const currency = String(invoice.currency ?? '').toUpperCase() || 'UNSET';
    outstandingByCurrency.set(currency, (outstandingByCurrency.get(currency) ?? 0) + Number(invoice.amount ?? 0));
  }
  const currencyLines = [...outstandingByCurrency.entries()].map(([currency, amount]) =>
    currency === 'UNSET' ? `${amount.toLocaleString()} · currency not set` : formatInvoiceAmount(amount, currency));

  return (
    <div className="p-7">
      <SectionHead title="Finance overview" subtitle="Persisted workspace invoices · no synthetic MRR, burn or cash runway." />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Invoices" value={String(invoices.length)} tone="accent" hint="Workspace records" />
        <StatCard label="Paid" value={String(paid)} tone="ok" hint="Status recorded as paid" />
        <StatCard label="Open" value={String(open)} tone={open ? 'warn' : 'ok'} hint="Not marked paid" />
        <StatCard label="Currencies" value={String(outstandingByCurrency.size)} tone="accent" hint="Outstanding balances kept separate" />
      </div>
      <div className="mt-4 rounded-xl border p-4" style={{ background: 'var(--theme-surface)', borderColor: 'var(--panel-border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Outstanding by currency</h3>
        {currencyLines.length === 0 ? <p className="mt-2 text-sm" style={{ color: 'var(--theme-text-dim)' }}>No open invoices in this workspace.</p> :
          <ul className="mt-3 space-y-2">{currencyLines.map((line) => <li key={line} className="text-sm font-semibold tabular-nums" style={{ color: 'var(--theme-text)' }}>{line}</li>)}</ul>}
      </div>
    </div>
  );
}

function FinanceUnavailable({ title, description }: { title: string; description: string }) {
  return <div className="p-7">
    <SectionHead title={title} subtitle="Finance source not connected" />
    <Card className="p-6">
      <p className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>No verified records available</p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>{description}</p>
    </Card>
  </div>;
}

function DemoRunway() {
  const items = useCmsStore(s => s.items['finance_overview']) ?? [];
  const projection = items.find(i => i.id === 'overview-projection');
  const rawProjection = projection?.projection;
  // Stored as a JSON-stringified number[] so the longtext CMS field can carry
  // it without inventing a new field type. Empty store → empty chart with a
  // clear fallback message instead of a hard crash.
  const series: number[] = (() => {
    if (typeof rawProjection !== 'string' || rawProjection.length === 0) return [];
    try {
      const parsed = JSON.parse(rawProjection);
      return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
    } catch {
      return [];
    }
  })();

  if (series.length === 0) {
    return (
      <div className="p-7">
        <SectionHead title="Runway" subtitle="Projected cash, next 12 months (k$)" />
        <Card className="p-6">
          <p className="text-sm text-[var(--theme-text-dim)]">
            Aucune projection de cash enregistrée. Ajouter une collection <code>finance_overview</code> avec un item <code>overview-projection</code> pour afficher la courbe.
          </p>
        </Card>
      </div>
    );
  }

  const max = Math.max(...series);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return (
    <div className="p-7">
      <SectionHead title="Runway" subtitle="Projected cash, next 12 months (k$)" />
      <Card className="p-6">
        <div className="flex items-end gap-2 h-52">
          {series.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-md transition-all" style={{ height: `${(v / max) * RUNWAY_BAR_PX}px`, background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT}88)` }} />
              <span className="text-[10px] text-[var(--theme-text-dim)]">{months[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--theme-text-dim)]">
          <span className="w-3 h-3 rounded-sm" style={{ background: ACCENT }} /> Cash on hand · burn holds runway above 24 months of safety
        </div>
      </Card>
    </div>
  );
}

export function FinanceApp() {
  const invoices = useCmsStore(s => s.items['invoices']) ?? [];
  const plancherItems = useCmsStore(s => s.items['plancher_marges']) ?? [];
  const budgetItems = useCmsStore(s => s.items['budget_tokens']) ?? [];
  const invoicesDrill = useCollectionDrill('invoices', 'Invoices');
  const plancherDrill = useCollectionDrill('plancher_marges', 'Planchers');
  const courbeDrill = useCollectionDrill('courbe_demande', 'Courbes');
  const budgetDrill = useCollectionDrill('budget_tokens', 'Tokens');
  const formesDrill = useCollectionDrill('formes_prix', 'Formes');
  const updateItem = useCmsStore(s => s.updateItem);
  const addItem = useCmsStore(s => s.addItem);
  const addToast = useShellStore(s => s.addToast);
  const [detail, setDetail] = useState<FinanceDetailItem | null>(null);
  const { setDetail: setWindowDetail } = useWindowPage();

  useEffect(() => {
    if (detail) {
      setWindowDetail({ label: detail.title, onBack: () => setDetail(null) });
    } else {
      setWindowDetail(null);
    }
  }, [detail, setWindowDetail]);

  const openInvoice = (id: string): void => {
    const item = invoices.find(c => c.id === id);
    if (!item) { invoicesDrill.open(id); return; }
    setDetail({
      id: String(item.id),
      title: String(item.client ?? item.title ?? 'Invoice'),
      subtitle: String(item.number ?? item.id),
      status: String(item.status ?? 'open'),
      kpis: [
        { label: 'Amount', value: `$${Number(item.amount ?? 0).toLocaleString()}` },
        { label: 'Status', value: String(item.status ?? 'open') },
        { label: 'Due', value: String(item.dueDate ?? '—') },
        { label: 'Issued', value: String(item.issued ?? '—') },
      ],
      rows: [
        { label: 'Description', value: String(item.description ?? item.memo ?? '') },
        { label: 'Client', value: String(item.client ?? '—') },
      ],
      fields: [],
    });
    invoicesDrill.open(id);
  };

  /** Mark an invoice as paid. The mutation is two-step: (1) flip the `status`
   *  field to 'Paid', (2) emit a success toast so the coach can see the change
   *  hit the store. The store's `updateItem` is fire-and-forget here — there
   *  is no batch to revert if it fails, which is fine for a one-shot status. */
  const markPaid = (id: string): void => {
    const item = invoices.find((c) => c.id === id);
    if (!item) return;
    if (String(item.status) === 'paid' || String(item.status) === 'Paid') {
      addToast({ source: 'Finance', type: 'warning', message: 'Already paid.' });
      return;
    }
    updateItem('invoices', id, { status: 'Paid' });
    addToast({ source: 'Finance', type: 'success', message: `Marked ${String(item.client ?? id)} as paid.` });
  };

  /** Compose a new invoice. The coach enters a client name and an amount; the
   *  rest of the fields are defaulted to canonical Civadelle values. The
   *  number is derived from the current ISO month, and the due date is set
   *  30 days out. The mutation flows through `addItem` so the seed kanban
   *  sees the new row immediately. */
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerClient, setComposerClient] = useState('');
  const [composerAmount, setComposerAmount] = useState('');

  const submitNewInvoice = (): void => {
    const client = composerClient.trim();
    const amountNum = Number(composerAmount);
    if (client.length === 0) {
      addToast({ source: 'Finance', type: 'warning', message: 'Client name is required.' });
      return;
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      addToast({ source: 'Finance', type: 'warning', message: 'Amount must be a positive number.' });
      return;
    }
    const now = new Date();
    const due = new Date(now.getTime() + 30 * 86400_000);
    const labelMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const result = addItem('invoices', {
      client,
      number: `INV-${labelMonth}-${String(invoices.length + 1).padStart(3, '0')}`,
      amount: amountNum,
      status: 'Sent',
      due: due.toISOString().slice(0, 10),
      issued: now.toISOString().slice(0, 10),
      description: 'Invoice line · Citadelle monthly',
    });
    if (result.ok) {
      addToast({ source: 'Finance', type: 'success', message: `Invoice created for ${client}.` });
      setComposerClient('');
      setComposerAmount('');
      setComposerOpen(false);
    } else {
      addToast({ source: 'Finance', type: 'warning', message: result.error ?? 'Could not create invoice.' });
    }
  };

  const cancelComposer = (): void => {
    setComposerClient('');
    setComposerAmount('');
    setComposerOpen(false);
  };

  const Planchers = () => {
    const belowFloor = plancherItems.filter((p) => String(p.status ?? '').toLowerCase() === 'danger').length;
    const tangential = plancherItems.filter((p) => String(p.status ?? '').toLowerCase() === 'warn').length;
    return (
      <div className="p-7">
        <SectionHead
          title="Planchers de marge"
          subtitle="Le seuil sous lequel une prestation ne se vend pas — pas une marge cible, un plancher"
        />
        {(belowFloor > 0 || tangential > 0) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {belowFloor > 0 && (
              <span
                className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] px-2.5 py-1 rounded-full"
                style={{ background: '#fee2e2', color: '#b91c1c' }}
              >
                {belowFloor} sous le plancher
              </span>
            )}
            {tangential > 0 && (
              <span
                className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] px-2.5 py-1 rounded-full"
                style={{ background: '#fef3c7', color: '#b45309' }}
              >
                {tangential} tangente
              </span>
            )}
          </div>
        )}
        <CollectionRepeater
          collectionId="plancher_marges"
          onOpen={plancherDrill.open}
        />
      </div>
    );
  };

  const Courbes = () => {
    return (
      <div className="p-7">
        <SectionHead
          title="Courbes de demande"
          subtitle="Scénarios de prix et volume estimé · la pente plutôt qu'un chiffre isolé"
        />
        <CollectionRepeater
          collectionId="courbe_demande"
          onOpen={courbeDrill.open}
        />
      </div>
    );
  };

  const Budgets = () => {
    const totalModel = budgetItems.reduce((s, b) => s + Number(b.modelCost ?? 0), 0);
    const totalSaving = budgetItems.reduce((s, b) => s + Number(b.monthlySaving ?? 0), 0);
    return (
      <div className="p-7">
        <SectionHead
          title="Budget de tokens"
          subtitle="Coût modèle vs ETP remplacé · la métrique qui justifie l'automatisation"
        />
        <div className="mb-4 grid grid-cols-2 gap-3">
          <StatCard label="Dépense modèle / mois" value={`$${totalModel.toLocaleString('en-US')}`} hint={`${budgetItems.length} usages suivis`} />
          <StatCard label="Économie nette / mois" value={`$${totalSaving.toLocaleString('en-US')}`} tone="ok" hint="vs ETP remplacés" />
        </div>
        <CollectionRepeater
          collectionId="budget_tokens"
          onOpen={budgetDrill.open}
        />
      </div>
    );
  };

  const Formes = () => {
    return (
      <div className="p-7">
        <SectionHead
          title="Formes de prix"
          subtitle="Comment facturer une même prestation · cashflow, engagement client, risque"
        />
        <CollectionRepeater
          collectionId="formes_prix"
          onOpen={formesDrill.open}
        />
      </div>
    );
  };

  const Invoices = () => {
    const paid = invoices.filter((inv) => /paid/i.test(String(inv.status))).length;
    const open = invoices.length - paid;
    return (
      <div className="p-7">
        <SectionHead
          title="Invoices"
          subtitle="Reconciled nightly via Stripe"
          action={
            !composerOpen ? (
              <button
                onClick={() => setComposerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'var(--theme-surface)',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--theme-text)',
                }}
                aria-label="Create a new invoice"
              >
                <Plus className="w-4 h-4" />
                New invoice
              </button>
            ) : null
          }
        />
        <div className="mb-4 flex items-center gap-2 text-[12px]" style={{ color: 'var(--theme-text-dim)' }}>
          <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{paid}</span> paid · <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{open}</span> open
        </div>
        {composerOpen ? (
          <div
            className="mb-4 rounded-xl border p-4"
            style={{ background: 'var(--theme-surface)', borderColor: 'var(--panel-border)' }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-1.5"
                  style={{ color: 'var(--theme-text-dim)' }}
                  htmlFor="invoice-composer-client"
                >
                  Client
                </label>
                <input
                  id="invoice-composer-client"
                  autoFocus
                  value={composerClient}
                  onChange={(e) => setComposerClient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitNewInvoice();
                    if (e.key === 'Escape') cancelComposer();
                  }}
                  placeholder="Ava Chen"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{
                    background: 'var(--theme-bg)',
                    border: '1px solid var(--panel-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-1.5"
                  style={{ color: 'var(--theme-text-dim)' }}
                  htmlFor="invoice-composer-amount"
                >
                  Amount (USD)
                </label>
                <input
                  id="invoice-composer-amount"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={composerAmount}
                  onChange={(e) => setComposerAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitNewInvoice();
                    if (e.key === 'Escape') cancelComposer();
                  }}
                  placeholder="1200"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{
                    background: 'var(--theme-bg)',
                    border: '1px solid var(--panel-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={cancelComposer}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'transparent',
                  color: 'var(--theme-text-dim)',
                  border: '1px solid var(--panel-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitNewInvoice}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: ACCENT,
                  color: '#ffffff',
                }}
              >
                Create invoice
              </button>
            </div>
          </div>
        ) : null}
        <FleetItemGrid cols={2}>
          {invoices.map((inv) => {
            const status = String(inv.status ?? 'open');
            const isPaid = /paid/i.test(status);
            const isOverdue = /overdue/i.test(status);
            const tone = isPaid ? 'ok' : isOverdue ? 'danger' : 'warn';
            const accent = isPaid ? '#16a34a' : isOverdue ? '#dc2626' : ACCENT;
            const clientName = String(inv.client ?? inv.title ?? 'Invoice');
            const invNumber = String(inv.number ?? inv.id);
            const invDesc = String(inv.description ?? inv.memo ?? '');
            const dueDate = String(inv.dueDate ?? inv.due ?? '');
            const amount = Number(inv.amount ?? 0);
            return (
              <div
                key={String(inv.id)}
                className="relative rounded-2xl border shadow-sm"
                style={{ background: 'var(--theme-surface)', borderColor: 'var(--panel-border)' }}
              >
                <button
                  type="button"
                  onClick={() => openInvoice(String(inv.id))}
                  className="flex w-full items-start gap-4 p-4 text-left"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ background: accent }}
                  >
                    {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="min-w-[9rem] flex-1">
                        <div className="text-[14px] font-bold" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {clientName}
                        </div>
                        <div className="text-[11.5px] truncate mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                          {invNumber}
                        </div>
                      </div>
                      <span
                        className="shrink-0 text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          color: tone === 'ok' ? '#15803d' : tone === 'danger' ? '#b91c1c' : '#b45309',
                          background: tone === 'ok' ? '#dcfce7' : tone === 'danger' ? '#fee2e2' : '#fef3c7',
                        }}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-[12px] leading-snug line-clamp-2 mt-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                      {invDesc}
                    </p>
                    <div
                      className="flex items-center gap-3 text-[10.5px] font-mono mt-2.5 pt-2 border-t"
                      style={{ color: 'var(--theme-text-dim)', borderColor: 'var(--panel-border-subtle)' }}
                    >
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--theme-text)' }}>
                        <span className="mr-1" style={{ color: 'var(--theme-text-dim)' }}>amount</span>
                        ${amount.toLocaleString('en-US')}
                      </span>
                      <span className="truncate flex-1">{dueDate ? `due ${dueDate}` : 'no due date'}</span>
                    </div>
                  </div>
                </button>
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border-t"
                  style={{ borderColor: 'var(--panel-border-subtle)' }}
                >
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); markPaid(String(inv.id)); }}
                    disabled={isPaid}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: isPaid ? 'var(--theme-surface-hover)' : '#16a34a',
                      color: isPaid ? 'var(--theme-text-dim)' : '#ffffff',
                      border: '1px solid var(--panel-border)',
                    }}
                    aria-label={`Mark ${clientName} paid`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isPaid ? 'Paid' : 'Mark paid'}
                  </button>
                </div>
              </div>
            );
          })}
        </FleetItemGrid>
      </div>
    );
  };

  const sections: AppSection[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3, render: Overview },
    { id: 'runway', label: 'Runway', icon: PiggyBank, render: Runway },
    { id: 'planchers', label: 'Planchers', icon: Scale, render: Planchers },
    { id: 'courbes', label: 'Courbes', icon: LineChart, render: Courbes },
    { id: 'tokens', label: 'Tokens', icon: Coins, render: Budgets },
    { id: 'formes', label: 'Formes', icon: CircleDollarSign, render: Formes },
    { id: 'invoices', label: 'Invoices', icon: Receipt, render: Invoices },
  ];

  // Picked drill (if any) — one of the 4 CMS collections exposed via
  // useCollectionDrill. The DynamicPageView is rendered in the overlay
  // (sibling of AppFrame) so it inherits the global topbar theme instead
  // of the per-app theme that AppFrame writes on its content.
  const drillViews: ReadonlyArray<{
    drill: { openId: string | null; open: (id: string) => void; close: () => void };
    collectionId: string;
  }> = [
    { drill: plancherDrill, collectionId: 'plancher_marges' },
    { drill: courbeDrill,   collectionId: 'courbe_demande' },
    { drill: budgetDrill,   collectionId: 'budget_tokens' },
    { drill: formesDrill,   collectionId: 'formes_prix' },
  ];
  const activeDrill = drillViews.find((d) => d.drill.openId) ?? null;

  return (
    <>
      <AppFrame title="Finance" subtitle="Wonder Woman domain" icon={Wallet} accent={ACCENT} sections={sections} />
      {detail ? (
        <AppDetailOverlay
          appId="finance"
          accent={ACCENT}
          onBack={() => setDetail(null)}
          motion={{ kind: 'fade-up', durationMs: 240 }}
        >
          <FinanceDetailPage item={detail} onBack={() => setDetail(null)} />
        </AppDetailOverlay>
      ) : activeDrill && activeDrill.drill.openId ? (
        <AppDetailOverlay
          appId="finance"
          accent={ACCENT}
          onBack={() => activeDrill.drill.close()}
          motion={{ kind: 'fade-up', durationMs: 240 }}
        >
          <DynamicPageView
            collectionId={activeDrill.collectionId}
            itemId={activeDrill.drill.openId}
            onBack={() => activeDrill.drill.close()}
            onNavigate={activeDrill.drill.open}
          />
        </AppDetailOverlay>
      ) : null}
    </>
  );
}
