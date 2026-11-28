import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Users } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { membersRepo } from '../data/members.repo';
import type { Agent } from '../lib/types';

const roleLabel = (role: Agent['role']): string => ({
  owner: 'Owner',
  manager: 'Manager',
  operator: 'Operator',
  viewer: 'Viewer',
}[role]);

export const PeopleView: React.FC = () => {
  const [members, setMembers] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    membersRepo.list()
      .then(setMembers)
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load workspace members'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4 animate-pulse" role="status" aria-label="Loading">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-32 bg-stone-100 rounded" />
    </div>;
  }

  if (error) {
    return <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700" role="alert">
      <p className="font-semibold">Unable to load workspace members</p>
      <p className="text-sm mt-1">{error}</p>
    </div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <BackButton />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">People & Team</h1>
          <p className="text-slate-500 text-sm mt-1">Active human memberships in this workspace.</p>
        </div>
        <Badge variant="default">{members.length} members</Badge>
      </div>
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Workspace members
        </h2>
        {members.length === 0 ? (
          <EmptyState title="No other workspace members" description="This workspace currently has no additional active human memberships." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{member.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Member since {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <Badge variant={member.role === 'owner' ? 'success' : 'default'}>{roleLabel(member.role)}</Badge>
                </div>
                <div className="mt-4 text-xs text-slate-500">Membership: {member.status}</div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PeopleView;
