# screens — product screens

The Figma equivalent is pages. One folder is one screen and usually one `feat/<screen>-<what>` branch.
Written for agents; the designer-facing explanation is in `README.md`.

```
screens/
├── dashboard/
│   ├── Dashboard.tsx
│   ├── Dashboard.module.css
│   └── components/           local components, this screen only
│       └── StatCard.tsx
├── settings/
│   ├── Settings.tsx
│   └── components/
│       └── SettingRow.tsx
└── ui-kit/
    ├── UiKit.tsx             gallery of every shared component in every state
    └── components/           local building blocks of the gallery
```

## Rules

1. A screen imports `@/components` and `@/tokens`. Never another screen.
2. A component needed only here stays in this screen's `components/`. Once a second screen needs it,
   move it to `src/components` in its own `ds/…` PR.
3. Two people working on different screens work in different branches: the files never overlap, so there
   are no conflicts.
4. `#/ui-kit` is not a client-facing screen. It is the review screen: after every change in
   `src/components` or `src/tokens`, open it and confirm nothing broke, and attach a screenshot to the PR.
