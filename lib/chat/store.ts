'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  ChatSession, 
  ChatMessage, 
  JourneyStage, 
  CollectedProspectData,
  QuickAction
} from './types'

interface ChatStore {
  // Session management
  sessions: Record<string, ChatSession>
  activeSessionId: string | null
  
  // Actions
  createSession: (caseId?: string) => string
  setActiveSession: (sessionId: string) => void
  getActiveSession: () => ChatSession | null
  
  // Message management
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateLastAssistantMessage: (updates: Partial<ChatMessage>) => void
  clearMessages: (sessionId?: string) => void
  
  // Journey management
  setStage: (stage: JourneyStage) => void
  updateCollectedData: (data: Partial<CollectedProspectData>) => void
  getCollectedData: () => CollectedProspectData
  resetCollectedData: () => void
  
  // Case linking
  linkCaseToSession: (caseId: string) => void
  getSessionByCaseId: (caseId: string) => ChatSession | undefined
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,

      createSession: (caseId?: string) => {
        const sessionId = generateId()
        const newSession: ChatSession = {
          id: sessionId,
          caseId,
          messages: [],
          currentStage: 'welcome',
          collectedData: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          sessions: { ...state.sessions, [sessionId]: newSession },
          activeSessionId: sessionId,
        }))
        
        return sessionId
      },

      setActiveSession: (sessionId: string) => {
        set({ activeSessionId: sessionId })
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get()
        if (!activeSessionId) return null
        return sessions[activeSessionId] || null
      },

      addMessage: (message) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return

        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        }

        set((state) => {
          const session = state.sessions[activeSessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                messages: [...session.messages, newMessage],
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      updateLastAssistantMessage: (updates) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return

        set((state) => {
          const session = state.sessions[activeSessionId]
          if (!session || session.messages.length === 0) return state

          const messages = [...session.messages]
          const lastIndex = messages.length - 1
          
          if (messages[lastIndex].role === 'assistant') {
            messages[lastIndex] = { ...messages[lastIndex], ...updates }
          }

          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                messages,
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      clearMessages: (sessionId?: string) => {
        const targetId = sessionId || get().activeSessionId
        if (!targetId) return

        set((state) => {
          const session = state.sessions[targetId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [targetId]: {
                ...session,
                messages: [],
                currentStage: 'welcome',
                collectedData: {},
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      setStage: (stage: JourneyStage) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return

        set((state) => {
          const session = state.sessions[activeSessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                currentStage: stage,
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      updateCollectedData: (data) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return

        set((state) => {
          const session = state.sessions[activeSessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                collectedData: { ...session.collectedData, ...data },
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      getCollectedData: () => {
        const session = get().getActiveSession()
        return session?.collectedData || {}
      },

      resetCollectedData: () => {
        const { activeSessionId } = get()
        if (!activeSessionId) return

        set((state) => {
          const session = state.sessions[activeSessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                collectedData: {},
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      linkCaseToSession: (caseId: string) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return

        set((state) => {
          const session = state.sessions[activeSessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                caseId,
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      getSessionByCaseId: (caseId: string) => {
        const { sessions } = get()
        return Object.values(sessions).find(s => s.caseId === caseId)
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
      // Handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          // Revive Date objects in sessions
          if (parsed.state?.sessions) {
            Object.keys(parsed.state.sessions).forEach((key) => {
              const session = parsed.state.sessions[key]
              if (session) {
                session.createdAt = new Date(session.createdAt)
                session.updatedAt = new Date(session.updatedAt)
                if (session.messages) {
                  session.messages = session.messages.map((m: ChatMessage) => ({
                    ...m,
                    timestamp: new Date(m.timestamp),
                  }))
                }
              }
            })
          }
          return parsed
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)
