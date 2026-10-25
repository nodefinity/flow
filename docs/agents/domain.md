# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- Existing files in **`docs/adr/`** are optional background for the relevant area, not a required workflow. Check them against the current code and the user's latest direction.

If any of these files don't exist, **proceed silently**. Don't flag their absence or suggest creating them. Do not create ADRs unless the user explicitly asks for them.

## File structure

Multi-context repo (this repo):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← optional existing decision notes
├── apps/
│   └── mobile/
│       └── CONTEXT.md
└── packages/
    ├── store/
    │   └── CONTEXT.md
    ├── database/
    │   └── CONTEXT.md
    └── ...                            ← other packages follow the same pattern
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If a concept isn't in the glossary, check current code and the user's intent before introducing a new term. Keep documentation changes proportional to the task.

## Conflicting documentation

If a note contradicts current code or the user's latest direction, briefly identify the mismatch. Do not treat old ADRs as a reason to block requested changes or start a separate documentation process.
