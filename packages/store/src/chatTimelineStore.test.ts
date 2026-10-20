import type { ChatMessage, Track } from '@flow/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { useChatTimelineStore } from './chatTimelineStore'

const track: Track = {
  id: 'track-a',
  source: 'local',
  title: 'Track A',
  artist: 'Artist A',
  album: 'Album A',
  artwork: '',
  url: 'file:///track-a.mp3',
  duration: 180,
  createdAt: 1,
  modifiedAt: 1,
  fileSize: 100,
}

const messages: ChatMessage[] = [
  { type: 'user-turn', text: 'Play something lighter', timestamp: 1 },
  { type: 'host-turn', text: 'Sure.', timestamp: 2 },
  { type: 'now-playing', track, timestamp: 3 },
  { type: 'interlude', script: 'Coming up next.', timestamp: 4 },
]

describe('chatTimelineStore', () => {
  beforeEach(() => {
    useChatTimelineStore.setState({ messages: [] })
  })

  it('appends messages in order', () => {
    for (const message of messages) {
      useChatTimelineStore.getState().appendMessage(message)
    }

    expect(useChatTimelineStore.getState().messages).toEqual(messages)
  })

  it('clears the timeline', () => {
    useChatTimelineStore.getState().appendMessage(messages[0]!)

    useChatTimelineStore.getState().clearTimeline()

    expect(useChatTimelineStore.getState().messages).toEqual([])
  })
})
