# components — shared components

The Figma equivalent is main components in a library, and props are component properties:
`<Button variant="secondary" size="sm">` is an instance with chosen properties. Written for agents; the
designer-facing explanation is in `README.md`.

A component moves here once two or more screens use it (the "rule of two"). Before that it lives in
`src/screens/<screen>/components/`.

## Rules

1. Uses tokens from `src/tokens` only. Imports nothing from `src/screens`.
2. The public API is props. Every new prop has a default that preserves the current look.
3. **Add a variant, never change a default.** Need a smaller button? `size="sm"`, not a smaller `padding`
   in `.button`. In Figma terms: add a variant, do not edit the main component.
4. Every component and every variant is shown on the `#/ui-kit` screen. That screen is the proof that
   nothing broke.
5. Changes here go in their own `ds/<component>-<what>` branch, as a small PR reviewed by both people
   (CODEOWNERS assigns them automatically).
6. Changing a default, renaming or removing a prop is a breaking change: tell the user first, then update
   every usage in the same PR (search the project for `<Button`).

## Structure

```
components/
├── Button/
│   ├── Button.tsx          props and markup
│   ├── Button.module.css   styles, var(--…) only
│   └── index.ts            export { Button }
├── Card/  Badge/  Toggle/  CodeHint/  Logo/
└── index.ts                re-export → import { Button, Card } from '@/components'
```
