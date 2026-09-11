# tokens — design tokens

The Figma equivalent is Variables and Styles. Here they are CSS custom properties: values only, no
components and no logic. Written for agents; the designer-facing explanation is in `README.md`.

| File | Contents |
| --- | --- |
| `colors.css` | the raw GitHub Dark palette plus semantic tokens: `--color-action`, `--color-text`, … |
| `spacing.css` | spacing scale and radii |
| `typography.css` | font families and text styles |
| `index.css` | imports all of the above; included once from `src/main.tsx` |

## Rules

1. Components and screens never write raw values (`#238636`, `14px`) — only `var(--…)`.
2. Changing a token changes the whole product, like editing a Variable in Figma. So: a separate
   `ds/tokens-<what>` branch, a small PR, review by both people, and a check of the `#/ui-kit` screen.
3. Adding a token is free. Renaming or deleting one happens only in a PR that also updates every usage.
4. The palette section at the top of `colors.css` exists for the semantic tokens below it. Components
   reference semantic tokens, never palette entries.
