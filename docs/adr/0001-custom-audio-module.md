# Audio layer: expo-audio for playback

Flow uses `expo-audio` as the mobile playback engine.

## Why not react-native-track-player

React Native Track Player is capable, but it is queue-first. Flow has two domain modes:

- **Radio mode**: the Host generates an opaque Programme of Segments.
- **Classic mode**: the user manages a Queue manually.

Mapping both modes directly onto RNTP would make RNTP's Queue the architectural center. That is the wrong dependency direction for Flow: the Player Store should own mode state, while the audio engine should only play the active audio source.

RNTP v5 also changed the cost profile. It is a commercial dual-license product for revenue-generating apps, while v4 is frozen. That makes it a poor default choice for this project.

## Why expo-audio

`expo-audio` now covers the playback capabilities Flow needs:

- local file URI and remote URL playback
- background playback through the Expo config plugin
- lock screen / notification controls through `setActiveForLockScreen`
- native buffering controls and source preloading
- status updates for progress and Segment completion
- audio sampling support for future visualisation work

It also fits the app's Expo Native Module baseline and avoids maintaining a custom AVPlayer / ExoPlayer bridge.

## Architecture

The audio engine is app-owned, not store-owned.

- `@flow/store` owns Player state: Classic Queue, Radio Programme, active index, play/pause state, and playback position.
- `@flow/store` also owns pure Audio Plan decisions: active source, next preload source, and finish action.
- `apps/mobile/modules/audio/ExpoAudioEngine.tsx` subscribes to Player Store and Playback Store state.
- The engine maps the Audio Plan to a music player and, during a Radio Interlude, a separate non-lock-screen Host voice player.
- The following Track starts underneath an Interlude at a ducked volume, then continues at normal volume without restarting when the Host finishes.
- When playback finishes, the engine advances the Player Store (`nextSegment()` in Radio mode, `next(false)` in Classic mode).
- The engine guards playback-finished handling so duplicate native finish events cannot advance multiple Segments.
- The engine preloads the next Segment or Track once per source key, but the Store remains the source of truth.

## Consequences

- `shaka-player` is not used for mobile playback.
- RNTP is not reintroduced.
- Lock screen metadata is generated from the active Track or Interlude.
- During an Interlude, lock screen text identifies the Host or Channel while artwork remains the previous Track's artwork for visual continuity. An opening Interlude with no previous Track uses the default Radio artwork.
- Android background playback requires the `expo-audio` config plugin, foreground-service permissions, notification permission, and the Expo Audio controls service.
- If `expo-audio` proves insufficient in device testing, the fallback is a thin custom native module behind the same app-owned engine boundary.
