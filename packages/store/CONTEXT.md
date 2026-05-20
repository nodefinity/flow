# Store Context

Zustand-based runtime state management. Holds ephemeral and persisted UI state that does not belong in the database.

## Language

**Store**:
A Zustand store slice that holds runtime state for a specific concern (tracks in memory, settings, future radio session state). Stores may persist selected fields via `zustand/persist` to async storage, but they are not the source of truth for relational data — that lives in `@flow/database`.
_Avoid_: repository, model, cache

**Setting Store**:
User preferences (appearance, language, playback behaviour). Persisted via zustand/persist.

**Track Store**:
Runtime track lists — local tracks loaded from the last Scan, and remote tracks added during the session. Local tracks are refreshed on each Scan; only remote tracks are persisted.

## Relationships

- **Store → Shared**: Stores operate on `Track` values defined in Shared
- **Store → Database**: Stores do NOT query the database directly; the app layer reads from Database and pushes data into Stores
