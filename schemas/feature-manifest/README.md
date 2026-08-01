# Feature Manifest Schema

JSON Schema definitions for module and feature activation declarations.

## Scope

Defines how core modules and vertical packs declare:

- Required and optional config keys
- Hook registration points
- Feature flag defaults
- Inter-module dependencies

## Usage

Module `manifest.json` files validate against these schemas. The module registry composes the effective API surface and UI screen map from validated manifests.

## Status

Schema files will be added in a future sprint.
