import { useCmsStore } from './cms.store';
import { TENANT_DEMO_COACH } from '../../stores/tenant.store';

/** True only for the explicit, bundled demo tenant. All real tenant views must read persisted records. */
export function useIsDemoTenant(): boolean {
  const activeTenantId = useCmsStore((state) => state.activeTenantId);
  return activeTenantId === TENANT_DEMO_COACH;
}
