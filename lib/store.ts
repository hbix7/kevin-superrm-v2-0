'use client'

import { create } from 'zustand'
import type { CaseData, WorkflowStage, Prospect, ScreeningResult, UnderwritingResult, CreditNarrative } from './types'
import { mockCaseData, mockScreeningResult, mockUnderwritingResult, mockCreditNarrative } from './mock-data'

interface Settings {
  user: {
    fullName: string
    email: string
    phone: string
    department: string
    branch: string
  }
  notifications: {
    email: boolean
    caseUpdates: boolean
    aiComplete: boolean
    approvalRequests: boolean
  }
  ai: {
    autoSuggest: boolean
    showExplanations: boolean
    detailLevel: 'brief' | 'standard' | 'detailed'
    riskAppetite: 'conservative' | 'moderate' | 'aggressive'
    autoRunScreening: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    currency: string
    dateFormat: string
    compactMode: boolean
    showRiskIndicators: boolean
  }
}

const defaultSettings: Settings = {
  user: {
    fullName: 'Sarah Tan',
    email: 'sarah.tan@superbank.com',
    phone: '+60 12-345 6789',
    department: 'SME Banking',
    branch: 'Kuala Lumpur HQ',
  },
  notifications: {
    email: true,
    caseUpdates: true,
    aiComplete: true,
    approvalRequests: true,
  },
  ai: {
    autoSuggest: true,
    showExplanations: true,
    detailLevel: 'standard',
    riskAppetite: 'moderate',
    autoRunScreening: false,
  },
  preferences: {
    theme: 'light',
    currency: 'MYR',
    dateFormat: 'DD/MM/YYYY',
    compactMode: false,
    showRiskIndicators: true,
  },
}

interface DashboardState {
  caseData: CaseData | null
  currentStage: WorkflowStage
  isLoading: boolean
  aiCopilotOpen: boolean
  settingsOpen: boolean
  settings: Settings
  setCaseData: (data: CaseData) => void
  setCurrentStage: (stage: WorkflowStage) => void
  setLoading: (loading: boolean) => void
  toggleAiCopilot: () => void
  toggleSettings: () => void
  updateSettings: (newSettings: Partial<Settings>) => void
  initializeNewCase: (prospect: Prospect) => void
  runScreening: () => Promise<void>
  runUnderwriting: () => Promise<void>
  generateNarrative: () => Promise<void>
  updateNarrative: (narrative: CreditNarrative) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  caseData: mockCaseData,
  currentStage: 'screening',
  isLoading: false,
  aiCopilotOpen: false,
  settingsOpen: false,
  settings: defaultSettings,

  setCaseData: (data) => set({ caseData: data }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleAiCopilot: () => set((state) => ({ aiCopilotOpen: !state.aiCopilotOpen })),
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  updateSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),

  initializeNewCase: (prospect) => {
    const newCase: CaseData = {
      id: `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      prospect,
      currentStage: 'screening',
      documents: [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          action: 'Case created - Prospect information entered',
          timestamp: new Date(),
          user: 'Current RM',
        },
      ],
    }
    set({ caseData: newCase, currentStage: 'screening' })
  },

  runScreening: async () => {
    set({ isLoading: true })
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const currentCase = get().caseData
    if (currentCase) {
      set({
        caseData: {
          ...currentCase,
          screeningResult: mockScreeningResult,
          timeline: [
            ...currentCase.timeline,
            {
              id: `TL-${Date.now()}`,
              action: 'AI Rapid Screening completed',
              timestamp: new Date(),
              user: 'System',
            },
          ],
        },
        isLoading: false,
      })
    }
  },

  runUnderwriting: async () => {
    set({ isLoading: true })
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2500))
    
    const currentCase = get().caseData
    if (currentCase) {
      set({
        caseData: {
          ...currentCase,
          underwritingResult: mockUnderwritingResult,
          currentStage: 'underwriting',
          timeline: [
            ...currentCase.timeline,
            {
              id: `TL-${Date.now()}`,
              action: 'AI Financial Analysis completed',
              timestamp: new Date(),
              user: 'System',
            },
          ],
        },
        currentStage: 'underwriting',
        isLoading: false,
      })
    }
  },

  generateNarrative: async () => {
    set({ isLoading: true })
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))
    
    const currentCase = get().caseData
    if (currentCase) {
      set({
        caseData: {
          ...currentCase,
          creditNarrative: mockCreditNarrative,
          currentStage: 'narrative',
          overallRiskScore: 75,
          timeline: [
            ...currentCase.timeline,
            {
              id: `TL-${Date.now()}`,
              action: 'AI Credit Narrative generated',
              timestamp: new Date(),
              user: 'System',
            },
          ],
        },
        currentStage: 'narrative',
        isLoading: false,
      })
    }
  },

  updateNarrative: (narrative) => {
    const currentCase = get().caseData
    if (currentCase) {
      set({
        caseData: {
          ...currentCase,
          creditNarrative: narrative,
          timeline: [
            ...currentCase.timeline,
            {
              id: `TL-${Date.now()}`,
              action: 'Credit Narrative updated by RM',
              timestamp: new Date(),
              user: 'Current RM',
            },
          ],
        },
      })
    }
  },
}))
