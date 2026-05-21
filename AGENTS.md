## Output

Never ever output anything other than English and Chinese.

## Code style

String literal unions — choose by usage pattern:

- **State / mode values** (compared in multiple places): use `enum`. Avoids magic strings, gives IDE autocomplete. E.g. `PlaybackMode`, `Language`, `Theme`.
- **Discriminated union `kind` / `type` fields** (written once in object construction): use `type`. E.g. `SegmentKind`, `InterventionKind`, `ChatMessage.type`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues at github.com/nodefinity/flow. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses default label vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context repo — a CONTEXT-MAP.md at the root points to per-context CONTEXT.md files. See `docs/agents/domain.md`.
