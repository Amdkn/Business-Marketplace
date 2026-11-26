import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { ViewShell } from '../components/ViewShell';
import { CreditCard, Package } from 'lucide-react';
import { supabase, SUPABASE_READY } from '../lib/supabase';

interface PublishedListing {
  id: string;
  listing_key: string;
  title: string;
  description: string | null;
  price_amount: string | number | null;
  currency: string | null;
  seller_name: string;
  capability_key: string;
  capability_name: string;
  capability_version: string;
}

function formatListingPrice(amount: string | number | null, currency: string | null): string {
  if (amount === null || amount === undefined || currency === null || !/^[A-Z]{3}$/.test(currency)) {
    return 'Price not listed';
  }
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric < 0) return 'Price not listed';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(numeric);
  } catch {
    return 'Price not listed';
  }
}

export const MarketplaceView: React.FC = () => {
  const [listings, setListings] = useState<PublishedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!SUPABASE_READY) {
      setError('Marketplace Supabase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', {
        body: { action: 'browse_listings' },
      });
      if (invokeError) throw invokeError;
      const rows = Array.isArray(data?.data) ? data.data : [];
      setListings(rows.map((row: Record<string, unknown>) => ({
        id: String(row.id ?? ''),
        listing_key: String(row.listing_key ?? ''),
        title: String(row.title ?? 'Untitled listing'),
        description: typeof row.description === 'string' ? row.description : null,
        price_amount: typeof row.price_amount === 'string' || typeof row.price_amount === 'number' ? row.price_amount : null,
        currency: typeof row.currency === 'string' ? row.currency.toUpperCase() : null,
        seller_name: String(row.seller_name ?? 'Marketplace seller'),
        capability_key: String(row.capability_key ?? ''),
        capability_name: String(row.capability_name ?? ''),
        capability_version: String(row.capability_version ?? ''),
      })));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load published Marketplace listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ViewShell
      title="Marketplace Catalog"
      subtitle="Published offers from the canonical Marketplace catalog"
      loading={loading}
      error={error}
      isEmpty={!loading && !error && listings.length === 0}
      emptyTitle="No published offers"
      emptyDescription="The live catalog currently contains no published listings. Draft blueprints and planned providers are not presented as purchasable products."
      onRetry={() => void load()}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {listings.map((item) => (
          <Card key={item.id} className="p-8 flex flex-col border border-stone-200">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <Package className="w-6 h-6 text-slate-600" />
              </div>
              <span className="px-3 py-1 bg-stone-50 rounded-full text-xs font-bold text-slate-500 border border-stone-200 uppercase tracking-wide">
                {item.capability_name || item.capability_key || 'Published offer'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-slate-500 text-sm mb-5 flex-1 leading-relaxed">{item.description || 'No description supplied by the seller.'}</p>
            <div className="text-xs text-slate-500 mb-4">
              Seller: <span className="font-semibold text-slate-700">{item.seller_name}</span>
              {item.capability_version && <span> · Version {item.capability_version}</span>}
            </div>
            <div className="flex items-center justify-between pt-5 border-t border-stone-100 mt-auto gap-3">
              <span className="text-xl font-bold text-slate-900">{formatListingPrice(item.price_amount, item.currency)}</span>
              <button
                type="button"
                disabled
                title="Checkout and payment-provider confirmation are not connected; no order or activation can be submitted."
                className="flex items-center bg-stone-100 text-slate-400 px-5 py-2.5 rounded-xl font-medium text-sm cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase unavailable
              </button>
            </div>
          </Card>
        ))}
      </div>
    </ViewShell>
  );
};

export default MarketplaceView;
