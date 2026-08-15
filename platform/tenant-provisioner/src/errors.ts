/** Base error for tenant provisioning failures. */
export class TenantProvisioningException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantProvisioningException';
  }
}

/** Thrown when provisioning request identity fields fail validation. */
export class TenantIdentityValidationException extends TenantProvisioningException {
  constructor(message: string) {
    super(message);
    this.name = 'TenantIdentityValidationException';
  }
}

/** Thrown when a tenant with the same ID or slug already exists. */
export class TenantAlreadyExistsException extends TenantProvisioningException {
  readonly tenantId?: string;
  readonly slug?: string;

  constructor(message: string, options?: { tenantId?: string; slug?: string }) {
    super(message);
    this.name = 'TenantAlreadyExistsException';
    this.tenantId = options?.tenantId;
    this.slug = options?.slug;
  }
}
