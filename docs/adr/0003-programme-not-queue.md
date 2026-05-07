# Host pre-generates Programmes; AI does not run in real-time during playback

The Host generates a complete Programme (a batch of Segments) before playback begins. The Player consumes it sequentially. The Host only runs again when a Programme is nearly exhausted or an Intervention occurs.

We considered real-time AI generation (deciding the next Segment as each one ends) but rejected it: network latency would cause gaps between Segments, and it provides no benefit since the Host has no new information mid-Programme that would change its decisions.

## Consequences

- Interludes must be TTS-synthesised during Programme generation, not on-demand. The Host must pre-request all TTS audio and receive URLs before handing the Programme to the Player.
- The Player has no write access to the Programme. Interventions go to the Host, which produces a replacement Programme.
- "Queue" as a user-visible or user-manipulable concept does not exist. The only user-facing playback concept is Now Playing.
