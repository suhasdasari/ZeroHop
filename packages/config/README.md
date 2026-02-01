# Shared Configuration

This directory is intended for configuration files that are shared across multiple apps or packages in the monorepo.

## Future Usage Plans:

1.  **Shared TypeScript Config (`tsconfig.json`)**:
    *   Instead of each app having its own isolated `tsconfig.json`, they can extend a base configuration from here.
    *   *Benefit*: consistent strictness and compiler options across the entire project.

2.  **Shared Tailwind Config**:
    *   Define your color palette, spacing, and design tokens once here.
    *   Import this preset in `apps/web/tailwind.config.ts`.
    *   *Benefit*: ensures the UI stays consistent even if you add a marketing site or admin dashboard later.

3.  **Shared ESLint Config**:
    *   Enforce the same coding style (e.g., no unused variables, sorting imports) across the project.
