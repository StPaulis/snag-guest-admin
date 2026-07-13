/**
 * Tenant (partner company) configuration.
 *
 * In production each partner gets a subdomain (team-a.snagsublets.com) and tenant
 * config should be resolved server-side. Until the guest-admin backend exists,
 * we resolve from env (and fall back to the subdomain for the display name).
 */
export interface Tenant {
  name: string;
  initials: string;
  subdomain: string;
  /** snag-api user id that owns this partner's posts — used for client-side scoping */
  hostUserId?: string;
}

export const tenant: Tenant = {
  name: import.meta.env.VITE_TENANT_NAME || 'Loft Collective',
  initials: import.meta.env.VITE_TENANT_INITIALS || 'LC',
  subdomain:
    import.meta.env.VITE_TENANT_SUBDOMAIN || window.location.hostname.split('.')[0] || 'team-a',
  hostUserId: import.meta.env.VITE_TENANT_HOST_USER_ID || undefined,
};
