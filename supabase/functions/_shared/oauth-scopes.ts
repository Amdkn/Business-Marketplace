export function parseOAuthScopes(value: unknown, fallback: readonly string[]): string[] {
  if (typeof value !== 'string' || value.trim().length === 0) return [...fallback];
  return value.trim().split(/\s+/);
}

export function assertOAuthScopesAllowed(granted: readonly string[], allowed: readonly string[]): void {
  if (granted.some((scope) => !allowed.includes(scope))) {
    throw new Error('OAUTH_SCOPE_ESCALATION_REJECTED');
  }
}
