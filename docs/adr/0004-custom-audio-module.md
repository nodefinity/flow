# Audio layer: @nodefinity/react-native-audio for playback, react-native-audio-api for visualisation

We use two complementary libraries for audio, each doing what it is designed for.

## Why not react-native-track-player (RNTP)

RNTP's queue abstraction is the wrong model for Flow: Flow's playback unit is a single Segment at a time (driven by the Host's Programme), not a user-managed track list. RNTP's queue layer adds bugs and complexity we do not need.

## Why not react-native-audio-api for playback

`react-native-audio-api` (Software Mansion) implements the Web Audio API — it is designed for audio graph processing, DSP, and synthesis. It has no OS media integration (no lock screen, no notification bar, no headphone buttons, no background playback). Using it as a music player would require rebuilding all of that from scratch.

## Two libraries, two responsibilities

**`@nodefinity/react-native-audio`** — purpose-built Expo Native Module for music playback:

- Single-segment playback — local file URI, remote HTTPS URL, or HTTP audio stream (HLS `.m3u8`, progressive). Both `AVPlayer` and `ExoPlayer` handle buffering natively; no JS-layer buffering logic needed.
- OS integration: lock screen, notification bar, headphone buttons, audio ducking
- Background playback

```typescript
// url accepts: file:// URI | https:// static file | https:// HLS stream (.m3u8) | progressive HTTP stream
play(url: string, metadata: NowPlayingMetadata): Promise<void>
pause() / resume() / stop() / seekTo(seconds: number)
setVolume(volume: number)   // 0–1
setRate(rate: number)       // 0.5–2.0

onPositionChange: (seconds: number) => void
onStateChange: (state: 'playing' | 'paused' | 'ended' | 'error') => void
onRemoteCommand: (command: 'play' | 'pause' | 'next' | 'prev' | 'seekTo', position?: number) => void
```

iOS: `AVPlayer` + `AVAudioSession` + `MPRemoteCommandCenter` + `MPNowPlayingInfoCenter`.
Android: `ExoPlayer (Media3)` + `MediaSession` + foreground `Service` + `AudioFocusRequest`.

**`react-native-audio-api`** — Web Audio API implementation for visualisation only:

- `AnalyserNode` provides real-time frequency/waveform data (FFT)
- Drives spectrum and waveform UI animations in the player screen
- Not used for actual audio output

## Consequences

- RNTP and its patch (`patches/react-native-track-player.patch`) are removed.
- `@nodefinity/react-native-audio` is extracted as a standalone public package — its API contains no Flow-specific concepts.
- `@flow/audio` inside the monorepo becomes a thin adapter: consumes `@nodefinity/react-native-audio` events and translates them into Flow domain language (e.g. routes `onRemoteCommand('next')` to the Host as an Intervention).
- Lookahead (pre-loading the next Segment for gapless playback) is managed by the Player context layer, not by `@nodefinity/react-native-audio`.
- `react-native-audio-api` receives the same audio source as `@nodefinity/react-native-audio` — it taps the stream for analysis only, does not produce audio output.
