import { create } from 'zustand'

interface State {
  firstName: string
  lastName: string
}

interface Action {
  updateFirstName: (firstName: State['firstName']) => void
  updateLastName: (lastName: State['lastName']) => void
}

// Create your store, which includes both state and (optionally) actions
export const usePersonStore = create<State & Action>(set => ({
  firstName: '',
  lastName: '',
  updateFirstName: firstName => set(() => ({ firstName })),
  updateLastName: lastName => set(() => ({ lastName })),
}))
