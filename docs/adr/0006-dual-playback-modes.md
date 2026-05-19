# Dual Playback Modes: Radio and Classic coexist

The Player supports two playback modes that coexist — only one is active at a time.

- **Radio mode** (Programme-driven): the AI Host generates a Programme of Segments. No user queue manipulation. Used when a Channel is active.
- **Classic mode** (Queue-driven): the traditional playback experience with full user control (add to queue, insert next, shuffle, reorder, play modes). Used when the user manually selects a track from the Library.

## Why

1. **Offline agency**: when the AI Host is unavailable (no network), users need full manual control to pick specific tracks — random shuffle is not always enough.
2. **User expectations**: some users will want to play a specific song immediately without entering radio mode. Removing queue control entirely would be a regression.
3. **Incremental migration**: preserving the existing queue logic means Radio mode is purely additive. No risk of breaking current functionality while building the new experience.

## Considered alternatives

- **Radio-only, no classic mode**: simpler architecture but degrades offline experience and removes user agency.
- **Unified model with user overrides**: a single Programme that accepts user insertions. Rejected because it blurs the Host's control boundary and complicates Programme coherence (the Host sequences for flow; user insertions break that).

## Consequences

- `playerStore` retains all existing queue-mutation APIs (`addToQueue`, `insertNext`, `removeFromQueue`, `clearQueue`, `playQueue`, `setMode`, shuffle).
- A `playbackMode: 'radio' | 'classic'` discriminator is added to the player state.
- `loadProgramme()` switches to radio mode and stops any classic playback.
- `playTrack()` / `playQueue()` switches to classic mode and stops any radio playback.
- The Player Controller layer is mode-agnostic — it plays an ordered list of audio items regardless of source.
- UI must reflect the active mode (e.g. hide queue controls in radio mode, hide chat timeline in classic mode).
- Domain language: "Queue" is scoped to Classic mode; "Programme" is scoped to Radio mode. Neither term replaces the other.
