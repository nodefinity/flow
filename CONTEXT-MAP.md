# Context Map

Flow is an AI-driven local music radio. The user tunes into a Channel; the AI Host pre-generates a Programme of Tracks and Interludes — like an FM DJ preparing a show. Interventions (点歌, mood change, voice/text instructions) cause the Host to regenerate the Programme.

## Contexts

- [Radio](./apps/mobile/CONTEXT.md) — the AI radio experience: Channels, the Host, Programmes, and Interludes
- [Player](./packages/player/CONTEXT.md) — playback engine: Programme, Segments, Now Playing, system controls
- [Library](./packages/store/CONTEXT.md) — the local track catalogue and CandidateSet queries
- [Shared](./packages/shared/CONTEXT.md) — cross-cutting types: Track, TrackMetadata

## Relationships

- **Radio → Player**: Radio delivers a Programme to the Player; Player reports Playback State and Segment-end events back so Radio knows when to prepare the next Programme
- **Radio → Library**: Radio sends a CandidateSet Query with Channel Style rules; Library returns matching Tracks for the Host to sequence
- **Player → Audio**: Player drives the Audio module one Segment at a time; Audio reports position, state changes, and remote control commands (lock screen / headphone buttons) back to Player
- **Library → Shared**: Library stores and returns `Track` values as defined in Shared
- **Player → Shared**: Player operates on `Track` values as defined in Shared
