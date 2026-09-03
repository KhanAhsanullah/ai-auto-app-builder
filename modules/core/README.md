# Core Modules

Always-loaded domain modules that define universal commerce capabilities.

## Modules

| Module                         | Package                            | Domain                                  |
| ------------------------------ | ---------------------------------- | --------------------------------------- |
| [tenant](./tenant)             | `@ai-commerce/module-tenant`       | Organizations, stores, locales, domains |
| [catalog](./catalog)           | `@ai-commerce/module-catalog`      | Products, variants, categories          |
| [cart](./cart)                 | `@ai-commerce/module-cart`         | Shopping cart and promotions            |
| [checkout](./checkout)         | `@ai-commerce/module-checkout`     | Checkout pipeline                       |
| [order](./order)               | `@ai-commerce/module-order`        | Order lifecycle and refunds             |
| [payment](./payment)           | `@ai-commerce/module-payment`      | Payment gateways and reconciliation     |
| [customer](./customer)         | `@ai-commerce/module-customer`     | Customer profiles and consent           |
| [inventory](./inventory)       | `@ai-commerce/module-inventory`    | Stock and reservations                  |
| [notification](./notification) | `@ai-commerce/module-notification` | Email, SMS, push delivery               |
| [media](./media)               | `@ai-commerce/module-media`        | File upload and CDN                     |

## Why Core

These modules represent the **80% shared behavior** across e-commerce, grocery, restaurant, pharmacy, fashion, and electronics verticals. Vertical modules extend — never replace — core functionality.

## Status

Sprint 18 Task 1 — payment intents in `@ai-commerce/module-payment` (`PaymentService`).
