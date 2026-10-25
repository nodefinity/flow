# Context Map

Flow is an AI-driven local music radio. The user tunes into a Channel; the AI Host pre-generates a Programme of Tracks and Interludes — like an FM DJ preparing a show. V1 Interventions (点歌, mood change, text instructions) cause the Host to regenerate the Programme.

## Contexts

- [Radio](./apps/mobile/CONTEXT.md) — the AI radio experience: Channels, the Host, Programmes, and Interludes
- [Website](./apps/www/CONTEXT.md) — public marketing, download, legal, and launch-readiness pages
- [API](./apps/api/CONTEXT.md) — public Worker endpoints for launch and marketing operations
- [Store](./packages/store/CONTEXT.md) — runtime stores for Player state, Chat Timeline state, and settings
- [Library](./packages/database/CONTEXT.md) — the local track catalogue, schema, and CandidateSet queries
- [Shared](./packages/shared/CONTEXT.md) — cross-cutting types: Track, TrackMetadata

## Relationships

- **Radio → Store**: the Programme Manager delivers a Programme to the Player Store; the Player Store reports Playback State and Segment events back so Radio knows when to prepare the next Programme
- **Radio → Library**: Radio sends a CandidateSet Query with Channel Style rules; Library returns matching Tracks for the Host to sequence
- **Player Store → Audio**: Player state produces a layered Audio Plan for the Audio module: one music source and, during an Interlude, an optional Host voice source. Audio reports position, state changes, and remote control commands (lock screen / headphone buttons) back to Player state
- **Library → Shared**: Library stores and returns `Track` values as defined in Shared
- **Store → Shared**: Store slices operate on `Track`, `Programme`, `Segment`, and `ChatMessage` values as defined in Shared
