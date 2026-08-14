# White-Label Schema (v1)

Engine-owned documentation and presets for the White-Label Engine. This directory is **not** a tenant-config input contract.

Tenant branding input remains:

`schemas/tenant-config/v1/branding.schema.json` (`Branding` / `brandingSchema` in `@ai-commerce/config-schema`).

## Layout

| Path                                                         | Purpose                          |
| ------------------------------------------------------------ | -------------------------------- |
| [resolved-brand.schema.json](./resolved-brand.schema.json)   | Documents `BrandResolver` output |
| [presets/default.json](./presets/default.json)               | Platform brand defaults          |
| [presets/vertical/](./presets/vertical/)                     | Vertical brand defaults          |
| [examples/brand.example.json](./examples/brand.example.json) | Example resolved-brand document  |

## Resolution precedence

```
Platform defaults → Vertical defaults → Tenant branding → Environment branding override
```

## Version

Current schema version: **v1**
