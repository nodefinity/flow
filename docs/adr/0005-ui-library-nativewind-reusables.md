# UI library: NativeWind v4 + React Native Reusables, replacing react-native-paper

Flow is dropping react-native-paper and rebuilding the UI layer on NativeWind v4 (Tailwind utility classes for React Native) + React Native Reusables (shadcn/ui-style copy-paste components). This is a full rewrite — existing Paper components are not being migrated, they are being discarded alongside the interaction model they supported.

## Considered options

- **react-native-paper** (current): Material Design 3, full component library, Callstack-maintained. Dropped because it no longer actively maintained and its MD3 aesthetic and component model (Appbar, Drawer, Paper theme system) conflict with Flow's new AI-radio interaction paradigm. The old interaction model is being replaced entirely, so migrating Paper components one-for-one would preserve the wrong UI.
- **Tamagui**: most powerful theme system but requires a babel compiler plugin, still in RC (v2), and adds build complexity to a monorepo already using Expo.
- **NativeWind v4 + React Native Reusables** (chosen): Tailwind utility classes for styling; Reusables provides shadcn/ui-style copy-paste primitives (Dialog, RadioGroup, etc.) that we own and modify freely. Zero vendor lock-in on component internals.

## Consequences

- Font scale: Paper's MD3 font token system (`displayLarge` → `bodySmall`) is removed entirely. Tailwind's native scale (`text-sm`, `text-base`, `text-lg`) is used directly — the app's component set is small enough that semantic font tokens add no value.
- Color system: defined as CSS variables in `global.css` (light + dark), mapped to Tailwind tokens in `tailwind.config.js`. `useTheme()` from Paper is replaced by `useColorScheme()` + Tailwind classes. The few places that need runtime color values (e.g. third-party component props) use a small static color map keyed by color scheme.
- Brand color: amber/warm-orange (`--primary`) as the accent, replacing MD3 defaults. Easy to change — one variable in `global.css`.
- Full light + dark dual theme is supported from the start.
- `PaperProvider`, `adaptNavigationTheme`, `configureFonts`, and `Themes.ts` are all removed.
