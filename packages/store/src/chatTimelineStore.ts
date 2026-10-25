import type { ChatMessage } from '@flow/shared'
import type { StateCreator } from 'zustand'
import { create } from 'zustand'

interface ChatTimelineStore {
  messages: ChatMessage[]
  appendMessage: (message: ChatMessage) => void
  clearTimeline: () => void
}

const storeCreator: StateCreator<ChatTimelineStore> = set => ({
  messages: [],

  appendMessage: (message) => {
    set(state => ({ messages: [...state.messages, message] }))
  },

  clearTimeline: () => {
    set({ messages: [] })
  },
})

export const useChatTimelineStore = create<ChatTimelineStore>()(storeCreator)
