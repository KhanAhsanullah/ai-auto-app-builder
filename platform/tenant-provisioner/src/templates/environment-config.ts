/** Development API base URL for newly provisioned tenants. */
export function buildDevelopmentApiUrl(): string {
  return 'http://localhost:3000';
}

/** Staging API base URL derived from tenant slug. */
export function buildStagingApiUrl(slug: string): string {
  return `https://api-staging.${slug}.platform.local`;
}

/** Production API base URL derived from tenant slug. */
export function buildProductionApiUrl(slug: string): string {
  return `https://api.${slug}.platform.local`;
}

/** Default promotion policy applied during tenant provisioning. */
export const ENVIRONMENT_PROMOTION_POLICY = {
  requireApproval: true,
  runValidationOnPromote: true,
} as const;
