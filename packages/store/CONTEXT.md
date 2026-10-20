# Store Context

Zustand-based runtime state management. Holds ephemeral and persisted UI state that does not belong in the database.

## Language

**Store**:
A Zustand store slice that holds runtime state for a specific concern (settings, Player state, Chat Timeline state). Stores may persist selected fields via `zustand/persist` to async storage, but they are not the source of truth for relational data — that lives in `@flow/database`.
_Avoid_: repository, model, cache

**Setting Store**:
User preferences (appearance, language, playback behaviour). Persisted via zustand/persist.

**Player Store**:
Runtime playback state for Classic mode and Radio mode. Classic mode owns the user-managed Queue; Radio mode owns the Host-generated Programme and current Segment index.

**Audio Plan**:
Pure playback decision helpers derived from Player Store state. Chooses the active music source, the optional Host voice source, the next preload source, and the action to take when playback finishes. It does not call native audio APIs.

**Chat Timeline Store**:
In-memory session timeline for Radio mode. Holds `ChatMessage` values in append order and is cleared when a new session starts.

## Relationships

- **Store → Shared**: Stores operate on types defined in Shared
- **Store → Database**: Stores do NOT query the database directly; the app layer reads from Database as needed
- **Audio Plan → Mobile Audio**: Mobile Audio executes the source and finish decisions produced by Store, while native playback side effects stay in the app layer
