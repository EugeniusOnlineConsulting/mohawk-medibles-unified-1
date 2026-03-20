'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { TenantConfig } from './tenant';

// ─── Context ─────────────────────────────────────────────────

const TenantContext = createContext<TenantConfig | null>(null);

// ─── Provider ────────────────────────────────────────────────

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantConfig;
  children: ReactNode;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function useTenant(): TenantConfig {
  const tenant = useContext(TenantContext);
  if (!tenant) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return tenant;
}

// ─── CSS Variables Helper ────────────────────────────────────

export function tenantCSSVariables(tenant: TenantConfig): Record<string, string> {
  return {
    '--tenant-primary': tenant.primaryColor,
    '--tenant-secondary': tenant.secondaryColor,
    '--tenant-accent': tenant.accentColor,
  };
}
