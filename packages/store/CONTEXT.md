# Library Context

The local track catalogue. Responsible for storing Track and TrackMetadata, scanning the device file system, and answering CandidateSet queries from the Radio context.

## Language

**Library**:
The complete set of Tracks available on the device. Persisted in SQLite via Drizzle. The Library is the source of truth for what can be played.
_Avoid_: collection, catalogue, music database

**Scan**:
The operation of reading audio files from the device file system into the Library. Produces Track records. Scan is user-initiated (from Settings) or triggered on first launch. It is one-way: device → Library.
_Avoid_: import, sync, refresh

**Local Track**:
A Track whose `source` is `'local'` — it exists as a file on the device. Its `url` is a file URI.
_Avoid_: offline track, device track, file track

**Remote Track**:
A Track whose `source` is `'remote'` — it streams from a URL. Not yet fully supported; reserved for future remote service integration.
_Avoid_: stream, online track

**CandidateSet Query**:
A request from the Radio context for tracks matching a Channel Style. The Library answers with a filtered subset. Query parameters are rule-based (genre, mood tags, source). The Library does not rank or sequence — that is the Host's responsibility.
_Avoid_: search, recommendation query, filter

## Relationships

- The **Library** contains zero or more **Local Tracks** and zero or more **Remote Tracks**
- A **Scan** populates the **Library** with **Local Tracks**
- A **CandidateSet Query** returns a subset of the **Library** matching the given Channel Style rules

## Example dialogue

> **Dev:** "When the Host needs songs for the '深夜电台' channel, does it query the Library directly?"
> **Domain expert:** "The Host sends a CandidateSet Query with the Channel Style rules. The Library returns matching tracks. The Host then decides which ones to play and in what order — the Library just filters, it doesn't rank."
