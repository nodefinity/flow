# AI Radio paradigm: Host-driven, not user-driven

Flow is being refactored from a user-managed player (playlists, queue manipulation, manual search) into an AI-driven radio. The user chooses a Channel; the AI Host selects tracks, controls pacing, and inserts spoken Interludes via TTS — like an FM DJ.

## Considered options

- **User-managed player** (current): user builds playlists, manages queue, searches. Familiar but requires effort.
- **AI radio with Host** (chosen): user picks a Channel, AI does everything else. Lower cognitive load; the product's core differentiator.

## Consequences

- The Queue is write-only for the Host. UI must not expose direct queue manipulation (except Track Requests, which go through the Host).
- Interludes are first-class audio Segments in the Queue, not UI overlays. The Player must handle heterogeneous segment types (Track + Interlude).
- The Library's primary read path is CandidateSet queries (filtered by Channel Style), not full-library browsing. Browse UX is secondary or removed.
- TTS is a hard runtime dependency for Interludes. Network is required for the AI Host to function. Offline mode = no Host, no Interludes (music-only fallback).
