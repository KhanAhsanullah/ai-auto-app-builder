# Vertical Modules

Optional business-type packs that extend core modules for specific industries.

## Supported Verticals

| Vertical                     | Package                             | Key Capabilities                        |
| ---------------------------- | ----------------------------------- | --------------------------------------- |
| [ecommerce](./ecommerce)     | `@ai-commerce/vertical-ecommerce`   | Standard retail, wishlist, reviews      |
| [grocery](./grocery)         | `@ai-commerce/vertical-grocery`     | Weighted items, slots, substitutions    |
| [restaurant](./restaurant)   | `@ai-commerce/vertical-restaurant`  | Menus, modifiers, kitchen routing       |
| [pharmacy](./pharmacy)       | `@ai-commerce/vertical-pharmacy`    | Prescriptions, compliance, restrictions |
| [fashion](./fashion)         | `@ai-commerce/vertical-fashion`     | Size charts, lookbooks, fit attributes  |
| [electronics](./electronics) | `@ai-commerce/vertical-electronics` | Spec sheets, warranties, compatibility  |

## Activation

Verticals are activated per tenant via configuration:

```
tenant.config → vertical manifest → enabled hooks + schema extensions
```

## Extension Mechanism

Each vertical provides:

- **Config extensions** — additional configuration keys
- **Navigation manifest** — admin and consumer nav entries
- **Screen map** — route definitions for generated apps
- **Hooks** — extension points in checkout, catalog, pricing
- **Seed templates** — demo data for onboarding

## Status

Foundation scaffold — vertical logic in future sprints.
