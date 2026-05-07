# Audio Context

The native audio module (`@flow/audio`). Wraps platform audio APIs to play a single URL, integrate with OS media controls, and handle audio session events. No business logic, no Programme awareness — pure audio execution.

## Language

**Now Playing Metadata**:
The title, artist, artwork URL, and duration passed to the OS for display on the lock screen and in the notification bar. Supplied by the Player context when calling `play()`.
_Avoid_: track info, media info, media metadata

**Remote Command**:
An instruction originating from outside the app — lock screen controls, notification bar buttons, headphone buttons (play/pause, next, prev, seek). Delivered to the Player via the `onRemoteCommand` callback. The Audio module does not act on Remote Commands itself; it only forwards them.
_Avoid_: media button, system event, hardware button

**Audio Focus** (Android only):
The OS grant that allows an app to produce audio. Audio Focus can be lost (another app requests it) or ducked (another app requests transient focus at lower priority). `@flow/audio` handles focus automatically: duck on transient loss, pause on full loss, resume on regain.
_Avoid_: audio session (iOS term), volume priority

**Audio Session** (iOS only):
The `AVAudioSession` configuration that determines how Flow's audio interacts with other apps — whether it mixes, ducks, or interrupts. Configured once at app start as `.playback` category.
_Avoid_: audio focus (Android term)

**Playback State**:
The current status reported by the native layer: `playing`, `paused`, `ended`, or `error`. Delivered via `onStateChange` callback.
_Avoid_: player status, audio status

## API surface

```typescript
play(url: string, metadata: NowPlayingMetadata): Promise<void>
pause(): void
resume(): void
stop(): void
seekTo(seconds: number): void
setVolume(volume: number): void   // 0–1
setRate(rate: number): void       // 0.5–2.0

onPositionChange: (seconds: number) => void
onStateChange: (state: PlaybackState) => void
onRemoteCommand: (command: RemoteCommand, seekPosition?: number) => void
```

## Two underlying libraries

This context is implemented by two libraries with distinct responsibilities:

- **`@nodefinity/react-native-audio`** — playback, OS integration, background audio. The source of all audio output.
- **`react-native-audio-api`** — Web Audio API `AnalyserNode` for real-time frequency/waveform data. Taps the audio stream for analysis only; produces no audio output. Used exclusively to drive visualisation UI.

## Relationships

- **Audio** is driven by **Player** — Player calls `play()` with a Segment URL and Now Playing Metadata
- **Audio** forwards **Remote Commands** to **Player**, which decides whether they are Interventions (routed to Host) or simple play/pause toggles
- **Audio** exposes visualisation data (frequency arrays) to the player screen UI via `AnalyserNode`
- **Audio** has no knowledge of **Programme**, **Channel**, or **Host**
