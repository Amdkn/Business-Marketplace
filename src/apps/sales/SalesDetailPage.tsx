/**
 * SalesDetailPage — Sales-specific detail meta (kind → icon/accent/action).
 *
 * Phase 48 refactor: render body delegated to canonical <DetailPage>.
 * This file now exports only the DETAIL_META map + types; the actual page
 * rendering lives in src/components/DetailPage.tsx.
 *
 * D4 append-only: Sales app keeps its own kind→meta table (sales-specific),
 * but the page layout is now shared with People/IT-RD/Finance/Operations.
 *
 * Won-deal invoice action: the page creates one persisted invoice only when
 * the deal already references a workspace client and a valid currency.
 * The database source_key unique index makes the action idempotent.
 */

import {
  BriefcaseBusiness,
  CalendarClock,
  CheckSquare,
  BookOpen,
  RotateCw,
  Cpu,
  FileSignature,
} from 'lucide-react';
import { DetailPage, type DetailItemBase, type DetailMeta } from '../../components/DetailPage';
import { useCmsStore } from '../../lib/cms/cms.store';
import { useShellStore } from '../../stores/shell.store';

export type DetailKind = 'deal' | 'call' | 'task' | 'doc' | 'routine' | 'tool';

interface DealDetail extends DetailItemBase { kind: 'deal'; clientId?: string; currency?: string; amount?: number }
interface CallDetail   extends DetailItemBase { kind: 'call' }
interface TaskDetail   extends DetailItemBase { kind: 'task' }
interface DocDetail    extends DetailItemBase { kind: 'doc' }
interface RoutineDetail extends DetailItemBase { kind: 'routine' }
interface ToolDetail   extends DetailItemBase { kind: 'tool' }

export type DetailItem =
  | DealDetail
  | CallDetail
  | TaskDetail
  | DocDetail
  | RoutineDetail
  | ToolDetail;

const SALES_DETAIL_META: Record<DetailKind, DetailMeta> = {
  deal: { label: 'Deal workspace', icon: BriefcaseBusiness, accent: '#ea580c' },
  call: {
    label: 'Call intelligence',
    icon: CalendarClock,
    accent: '#2563eb',
  },
  task: {
    label: 'Execution task',
    icon: CheckSquare,
    accent: '#0d9488',
    action: { label: 'Open in Tasks', appId: 'tasks' },
  },
  doc: {
    label: 'Context document',
    icon: BookOpen,
    accent: '#7c3aed',
    action: { label: 'Return to Context', appId: 'sales' },
  },
  routine: { label: 'Cognition routine', icon: RotateCw, accent: '#c2410c' },
  tool: {
    label: 'Stack connector',
    icon: Cpu,
    accent: '#475569',
    action: { label: 'Open connector settings', appId: 'settings' },
  },
};

interface SalesDetailPageProps {
  item: DetailItem;
  onBack: () => void;
  onNavigate?: (appId: string) => void;
}

function formatSalesMoney(amount: number, currency: string): string {
  if (/^[A-Z]{3}$/.test(currency)) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount); } catch { /* unknown currency code */ }
  }
  return `${amount.toLocaleString()} · currency not set`;
}

function readAmount(item: DealDetail): number | undefined {
  if (typeof item.amount === 'number' && Number.isFinite(item.amount) && item.amount > 0) return item.amount;
  const valueField = item.fields.find((field) => field.label === 'Value');
  if (!valueField) return undefined;
  const raw = valueField.value.replace(/[^\d.]/g, '');
  const amount = Number(raw);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

export function SalesDetailPage({ item, onBack, onNavigate }: SalesDetailPageProps) {
  const addItem = useCmsStore((s) => s.addItemPersisted);
  const clientsItems = useCmsStore((s) => s.items['clients']) ?? [];
  const invoicesItems = useCmsStore((s) => s.items['invoices']) ?? [];
  const addToast = useShellStore((s) => s.addToast);

  const isWonDeal = item.kind === 'deal' && /won/i.test(item.status);
  const onCreateInvoice = async (): Promise<void> => {
    if (item.kind !== 'deal') return;
    const amount = readAmount(item);
    const currency = String(item.currency ?? '').toUpperCase();
    if (amount === undefined) {
      addToast({ source: 'Sales', type: 'warning', message: 'Deal value is missing — cannot invoice.' });
      return;
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      addToast({ source: 'Sales', type: 'warning', message: 'Deal currency is missing or invalid — invoice creation refused.' });
      return;
    }
    const clientId = String(item.clientId ?? '');
    const client = clientsItems.find((candidate) => String(candidate.id) === clientId);
    if (!client) {
      addToast({ source: 'Sales', type: 'warning', message: 'This deal is not linked to an existing workspace client. Link the client before invoicing.' });
      return;
    }
    const sourceKey = `deal:${String(item.id)}:full`;
    const existingInvoice = invoicesItems.find((invoice) => String(invoice.sourceKey ?? '') === sourceKey);
    if (existingInvoice) {
      addToast({ source: 'Sales', type: 'info', message: `An invoice is already linked to this deal (${String(existingInvoice.id)}).` });
      return;
    }
    const now = new Date();
    const due = new Date(now.getTime() + 30 * 86400_000);
    const clientName = String(client.name ?? client.title ?? client.id);
    const invoiceResult = await addItem('invoices', {
      client: clientName,
      clientId,
      dealId: String(item.id),
      sourceKey,
      number: `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(item.id).slice(-4)}`,
      amount,
      currency,
      status: 'Sent',
      due: due.toISOString().slice(0, 10),
      dueAt: due.toISOString(),
      issued: now.toISOString().slice(0, 10),
      issuedAt: now.toISOString(),
      description: `Invoice line · deal ${item.id}`,
    });
    if (invoiceResult.ok) {
      addToast({ source: 'Sales', type: 'success', message: `Invoice persisted for ${clientName} (${formatSalesMoney(amount, currency)}).` });
    } else {
      addToast({ source: 'Sales', type: 'warning', message: `Invoice not created: ${invoiceResult.error ?? 'unknown error'}.` });
    }
  };

  return (
    <>
      <DetailPage
        item={item}
        backLabel="Back to Sales OS"
        onBack={onBack}
        onNavigate={onNavigate}
        meta={SALES_DETAIL_META[item.kind]}
      />
      {isWonDeal ? (
        <div className="border-t border-[var(--panel-border)] bg-[var(--theme-surface)] px-6 py-5">
          <button
            type="button"
            onClick={() => void onCreateInvoice()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:brightness-95 active:scale-[0.99]"
            style={{ background: SALES_DETAIL_META.deal.accent }}
            aria-label="Create invoice from won deal"
          >
            <FileSignature className="h-4 w-4" />
            Create invoice
          </button>
          <p className="mt-2 text-[11px] text-[var(--theme-text-dim)] text-center">
            Crée une facture envoyée pour le client déjà lié au deal. Aucun paiement n'est capturé ici.
          </p>
        </div>
      ) : null}
    </>
  );
}
