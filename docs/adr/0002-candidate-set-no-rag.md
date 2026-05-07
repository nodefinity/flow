# Track selection uses rule filtering + LLM ranking, not RAG/embeddings

The Host selects tracks via two steps: (1) rule-based filtering of the Library into a CandidateSet (~30–50 tracks), (2) LLM ranks and sequences the CandidateSet.

We considered adding embedding-based vector search (RAG) as a retrieval layer but rejected it for V1.

## Why RAG is not needed now

Local libraries are typically 500–3000 tracks. The CandidateSet after rule filtering fits comfortably in an LLM context window with no retrieval step needed. Track metadata is already structured (title, artist, album, genre) — there is no unstructured text that needs semantic search to navigate.

## When to revisit

Add embeddings if: (a) libraries regularly exceed ~5000 tracks and context costs become significant, or (b) audio feature extraction (tempo, energy, danceability) is added and similarity search on audio vectors becomes valuable.
