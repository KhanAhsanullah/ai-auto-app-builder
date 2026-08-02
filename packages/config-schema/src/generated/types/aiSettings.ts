/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * AI orchestration settings, generation policies, and locked-field governance.
 */
export interface AiSettings {
  /**
   * Master switch for AI features on this tenant.
   */
  enabled: boolean;
  provider: {
    name: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
    /**
     * Model identifier (e.g. gpt-4o, claude-3-5-sonnet).
     */
    model?: string;
    /**
     * Reference to API credentials in secrets store.
     */
    credentialsRef?: string;
  };
  generation: {
    /**
     * @minItems 1
     */
    allowedTargets: [
      'config' | 'theme' | 'catalog' | 'navigation' | 'copy' | 'menu_import',
      ...('config' | 'theme' | 'catalog' | 'navigation' | 'copy' | 'menu_import')[],
    ];
    /**
     * If false, AI output requires human review before publish.
     */
    autoApply?: boolean;
    maxTokensPerRequest?: number;
  };
  guardrails: {
    /**
     * JSON Pointer paths AI cannot modify after publish (e.g. payments.checkout.captureStrategy).
     */
    lockedFields: string[];
    requireSchemaValidation: boolean;
    blockDirectDbWrites?: boolean;
    auditAllSuggestions?: boolean;
  };
  copilot?: {
    adminEnabled?: boolean;
    customerSupportEnabled?: boolean;
    allowedActions?: (
      'read_orders' | 'read_catalog' | 'update_catalog_draft' | 'generate_reports' | 'answer_faq'
    )[];
  };
}
