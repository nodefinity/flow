# Shared Context

Cross-cutting types shared across all contexts. Contains the canonical Track and TrackMetadata definitions. No business logic lives here.

## Language

**Track**:
The minimal representation of an audio file needed to play it and display it to the user: `id`, `title`, `artist`, `album`, `artwork`, `url`, `duration`, `source`. Used by both the Player (to play) and the Library (to store).
_Avoid_: song, audio, media item

**TrackMetadata**:
The full set of audio tags and codec properties for a Track: bitrate, sampleRate, channels, format, year, genre, composer, lyrics, etc. A superset of Track. Used during Scan to populate the Library. Not needed at playback time.
_Avoid_: audio info, file metadata, tags

## Relationships

- **TrackMetadata** extends **Track** — every TrackMetadata is a Track, but not every Track has full metadata
