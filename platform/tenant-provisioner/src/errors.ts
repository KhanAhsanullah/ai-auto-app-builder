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

/** Thrown when a tenant lookup by ID fails. */
export class TenantNotFoundException extends TenantProvisioningException {
  readonly tenantId: string;

  constructor(tenantId: string) {
    super(`Tenant not found with id '${tenantId}'.`);
    this.name = 'TenantNotFoundException';
    this.tenantId = tenantId;
  }
}

/** Thrown when a tenant lifecycle transition is not allowed. */
export class InvalidLifecycleTransitionException extends TenantProvisioningException {
  readonly tenantId: string;
  readonly fromStatus: string;
  readonly toStatus: string;

  constructor(tenantId: string, fromStatus: string, toStatus: string) {
    super(`Invalid lifecycle transition for tenant '${tenantId}': ${fromStatus} -> ${toStatus}.`);
    this.name = 'InvalidLifecycleTransitionException';
    this.tenantId = tenantId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}
