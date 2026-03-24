'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CaseData, WorkflowStage, Prospect, ScreeningResult, UnderwritingResult, CreditNarrative } from './types'
import { mockCaseData, mockScreeningResult, mockUnderwritingResult, mockCreditNarrative } from './mock-data'

// Extended case type with status for the cases list
export interface CaseListItem {
  id: string
  companyName: string
  registrationNumber: string
  industry: string
  loanAmount: number
  stage: WorkflowStage
  riskScore: number | null
  status: 'in_progress' | 'pending_approval' | 'approved' | 'declined'
  rmName: string
  createdAt: Date
  lastUpdated: Date
  caseData: CaseData
}

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

// Initial mock cases list
const initialCases: CaseListItem[] = [
  {
    id: 'CASE-2024-00142',
    companyName: 'Precision Manufacturing Sdn Bhd',
    registrationNumber: '201801012345',
    industry: 'Manufacturing - Metal Components',
    loanAmount: 2500000,
    stage: 'narrative',
    riskScore: 75,
    status: 'pending_approval',
    rmName: 'Sarah Tan',
    createdAt: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-18'),
    caseData: mockCaseData,
  },
  {
    id: 'CASE-2026-00142',
    companyName: 'TechVenture Solutions Sdn Bhd',
    registrationNumber: '201901045678',
    industry: 'Services - IT',
    loanAmount: 2500000,
    stage: 'screening',
    riskScore: null,
    status: 'in_progress',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-03-10'),
    lastUpdated: new Date('2026-03-13'),
    caseData: {
      id: 'CASE-2026-00142',
      prospect: {
        id: 'PROS-002',
        companyName: 'TechVenture Solutions Sdn Bhd',
        registrationNumber: '201901045678',
        industry: 'Services - IT',
        yearsOfOperation: 7,
        estimatedTurnover: 5500000,
        financingPurpose: 'Business Expansion',
        requestedLoanAmount: 2500000,
        directorName: 'Lee Wei Ming',
        createdAt: new Date('2026-03-10'),
      },
      currentStage: 'screening',
      documents: [],
      timeline: [
        { id: 'TL-001', action: 'Case created', timestamp: new Date('2026-03-10'), user: 'Ahmad Razif (RM)' },
      ],
    },
  },
  {
    id: 'CASE-2026-00138',
    companyName: 'Golden Harvest Trading',
    registrationNumber: '200801023456',
    industry: 'Trading - Import/Export',
    loanAmount: 5000000,
    stage: 'underwriting',
    riskScore: 68,
    status: 'in_progress',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-03-05'),
    lastUpdated: new Date('2026-03-12'),
    caseData: {
      id: 'CASE-2026-00138',
      prospect: {
        id: 'PROS-003',
        companyName: 'Golden Harvest Trading',
        registrationNumber: '200801023456',
        industry: 'Trading - Import/Export',
        yearsOfOperation: 18,
        estimatedTurnover: 12000000,
        financingPurpose: 'Trade Financing',
        requestedLoanAmount: 5000000,
        directorName: 'Tan Ah Kow',
        createdAt: new Date('2026-03-05'),
      },
      currentStage: 'underwriting',
      screeningResult: mockScreeningResult,
      documents: [],
      timeline: [
        { id: 'TL-001', action: 'Case created', timestamp: new Date('2026-03-05'), user: 'Ahmad Razif (RM)' },
        { id: 'TL-002', action: 'AI Rapid Screening completed', timestamp: new Date('2026-03-06'), user: 'System' },
      ],
      overallRiskScore: 68,
    },
  },
  {
    id: 'CASE-2026-00135',
    companyName: 'Precision Electronics Sdn Bhd',
    registrationNumber: '201501087654',
    industry: 'Manufacturing - Electronics',
    loanAmount: 8000000,
    stage: 'narrative',
    riskScore: 82,
    status: 'pending_approval',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-02-28'),
    lastUpdated: new Date('2026-03-11'),
    caseData: {
      id: 'CASE-2026-00135',
      prospect: {
        id: 'PROS-004',
        companyName: 'Precision Electronics Sdn Bhd',
        registrationNumber: '201501087654',
        industry: 'Manufacturing - Electronics',
        yearsOfOperation: 11,
        estimatedTurnover: 25000000,
        financingPurpose: 'Equipment Purchase',
        requestedLoanAmount: 8000000,
        directorName: 'Lim Chee Keong',
        createdAt: new Date('2026-02-28'),
      },
      currentStage: 'narrative',
      screeningResult: mockScreeningResult,
      underwritingResult: mockUnderwritingResult,
      creditNarrative: mockCreditNarrative,
      documents: [],
      timeline: [
        { id: 'TL-001', action: 'Case created', timestamp: new Date('2026-02-28'), user: 'Ahmad Razif (RM)' },
        { id: 'TL-002', action: 'AI Rapid Screening completed', timestamp: new Date('2026-03-01'), user: 'System' },
        { id: 'TL-003', action: 'AI Financial Analysis completed', timestamp: new Date('2026-03-05'), user: 'System' },
        { id: 'TL-004', action: 'AI Credit Narrative generated', timestamp: new Date('2026-03-11'), user: 'System' },
      ],
      overallRiskScore: 82,
    },
  },
  {
    id: 'CASE-2026-00129',
    companyName: 'Fresh Foods Distribution',
    registrationNumber: '201201034567',
    industry: 'Trading - Wholesale',
    loanAmount: 3500000,
    stage: 'narrative',
    riskScore: 45,
    status: 'declined',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-02-20'),
    lastUpdated: new Date('2026-03-08'),
    caseData: {
      id: 'CASE-2026-00129',
      prospect: {
        id: 'PROS-005',
        companyName: 'Fresh Foods Distribution',
        registrationNumber: '201201034567',
        industry: 'Trading - Wholesale',
        yearsOfOperation: 14,
        estimatedTurnover: 8000000,
        financingPurpose: 'Working Capital',
        requestedLoanAmount: 3500000,
        directorName: 'Wong Siew Lan',
        createdAt: new Date('2026-02-20'),
      },
      currentStage: 'narrative',
      screeningResult: mockScreeningResult,
      underwritingResult: mockUnderwritingResult,
      creditNarrative: mockCreditNarrative,
      documents: [],
      timeline: [
        { id: 'TL-001', action: 'Case created', timestamp: new Date('2026-02-20'), user: 'Ahmad Razif (RM)' },
        { id: 'TL-002', action: 'Case declined - High risk profile', timestamp: new Date('2026-03-08'), user: 'Credit Committee' },
      ],
      overallRiskScore: 45,
    },
  },
  {
    id: 'CASE-2026-00122',
    companyName: 'BuildRight Construction',
    registrationNumber: '200901056789',
    industry: 'Construction',
    loanAmount: 12000000,
    stage: 'narrative',
    riskScore: 75,
    status: 'approved',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-02-15'),
    lastUpdated: new Date('2026-03-05'),
    caseData: {
      id: 'CASE-2026-00122',
      prospect: {
        id: 'PROS-006',
        companyName: 'BuildRight Construction',
        registrationNumber: '200901056789',
        industry: 'Construction',
        yearsOfOperation: 17,
        estimatedTurnover: 35000000,
        financingPurpose: 'Project Financing',
        requestedLoanAmount: 12000000,
        directorName: 'Mohd Faizal',
        createdAt: new Date('2026-02-15'),
      },
      currentStage: 'narrative',
      screeningResult: mockScreeningResult,
      underwritingResult: mockUnderwritingResult,
      creditNarrative: mockCreditNarrative,
      documents: [],
      timeline: [
        { id: 'TL-001', action: 'Case created', timestamp: new Date('2026-02-15'), user: 'Ahmad Razif (RM)' },
        { id: 'TL-002', action: 'Case approved', timestamp: new Date('2026-03-05'), user: 'Credit Committee' },
      ],
      overallRiskScore: 75,
    },
  },
]

interface DashboardState {
  // Cases list management
  cases: CaseListItem[]
  
  // Current active case
  caseData: CaseData | null
  currentStage: WorkflowStage
  currentCaseId: string | null
  
  isLoading: boolean
  aiCopilotOpen: boolean
  settingsOpen: boolean
  settings: Settings
  
  // Cases list actions
  getCaseById: (id: string) => CaseListItem | undefined
  loadCase: (id: string) => void
  addCase: (caseItem: CaseListItem) => void
  updateCaseInList: (id: string, updates: Partial<CaseListItem>) => void
  
  // Current case actions
  setCaseData: (data: CaseData) => void
  setCurrentStage: (stage: WorkflowStage) => void
  setLoading: (loading: boolean) => void
  toggleAiCopilot: () => void
  toggleSettings: () => void
  updateSettings: (newSettings: Partial<Settings>) => void
  initializeNewCase: (prospect: Prospect) => string
  runScreening: () => Promise<void>
  runUnderwriting: () => Promise<void>
  generateNarrative: () => Promise<void>
  updateNarrative: (narrative: CreditNarrative) => void
  submitToCredit: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      cases: initialCases,
      caseData: null,
      currentStage: 'screening',
      currentCaseId: null,
      isLoading: false,
      aiCopilotOpen: false,
      settingsOpen: false,
      settings: defaultSettings,

  getCaseById: (id: string) => {
    return get().cases.find(c => c.id === id)
  },

  loadCase: (id: string) => {
    const caseItem = get().cases.find(c => c.id === id)
    if (caseItem) {
      set({ 
        caseData: caseItem.caseData, 
        currentStage: caseItem.caseData.currentStage,
        currentCaseId: id
      })
    }
  },

  addCase: (caseItem: CaseListItem) => {
    set((state) => ({ cases: [caseItem, ...state.cases] }))
  },

  updateCaseInList: (id: string, updates: Partial<CaseListItem>) => {
    set((state) => ({
      cases: state.cases.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  },

  setCaseData: (data) => set({ caseData: data }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleAiCopilot: () => set((state) => ({ aiCopilotOpen: !state.aiCopilotOpen })),
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  updateSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),

  initializeNewCase: (prospect) => {
    const caseId = `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
    
    const newCaseData: CaseData = {
      id: caseId,
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
    
    const newCaseListItem: CaseListItem = {
      id: caseId,
      companyName: prospect.companyName,
      registrationNumber: prospect.registrationNumber,
      industry: prospect.industry,
      loanAmount: prospect.requestedLoanAmount,
      stage: 'screening',
      riskScore: null,
      status: 'in_progress',
      rmName: get().settings.user.fullName,
      createdAt: new Date(),
      lastUpdated: new Date(),
      caseData: newCaseData,
    }
    
    set((state) => ({ 
      cases: [newCaseListItem, ...state.cases],
      caseData: newCaseData, 
      currentStage: 'screening',
      currentCaseId: caseId
    }))
    
    return caseId
  },

  runScreening: async () => {
    set({ isLoading: true })
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const { caseData: currentCase, currentCaseId, updateCaseInList } = get()
    if (currentCase && currentCaseId) {
      const updatedCase: CaseData = {
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
      }
      
      set({
        caseData: updatedCase,
        isLoading: false,
      })
      
      // Update in the cases list
      updateCaseInList(currentCaseId, {
        caseData: updatedCase,
        lastUpdated: new Date(),
        riskScore: mockScreeningResult.overallScore,
      })
    } else {
      set({ isLoading: false })
    }
  },

  runUnderwriting: async () => {
    set({ isLoading: true })
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2500))
    
    const { caseData: currentCase, currentCaseId, updateCaseInList } = get()
    if (currentCase && currentCaseId) {
      const updatedCase: CaseData = {
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
      }
      
      set({
        caseData: updatedCase,
        currentStage: 'underwriting',
        isLoading: false,
      })
      
      // Update in the cases list
      updateCaseInList(currentCaseId, {
        caseData: updatedCase,
        stage: 'underwriting',
        lastUpdated: new Date(),
        riskScore: mockUnderwritingResult.overallScore,
      })
    } else {
      set({ isLoading: false })
    }
  },

  generateNarrative: async () => {
    set({ isLoading: true })
    
    const { caseData: currentCase, currentCaseId, updateCaseInList } = get()
    if (currentCase && currentCaseId) {
      try {
        // Call the real narrative API with actual case data
        const response = await fetch('/api/narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prospect: currentCase.prospect,
            screeningResult: currentCase.screeningResult,
            underwritingResult: currentCase.underwritingResult,
          }),
        })

        if (!response.ok) {
          throw new Error('Narrative generation failed')
        }

        // Parse SSE stream
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''
        let narrativeResult: CreditNarrative | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('data:')) {
              const data = trimmed.slice(5).trim()
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'output' && parsed.output) {
                  narrativeResult = parsed.output as CreditNarrative
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        if (narrativeResult) {
          const updatedCase: CaseData = {
            ...currentCase,
            creditNarrative: narrativeResult,
            currentStage: 'narrative',
            overallRiskScore: narrativeResult.confidenceScore,
            timeline: [
              ...currentCase.timeline,
              {
                id: `TL-${Date.now()}`,
                action: 'AI Credit Narrative generated',
                timestamp: new Date(),
                user: 'System',
              },
            ],
          }
          
          set({
            caseData: updatedCase,
            currentStage: 'narrative',
            isLoading: false,
          })
          
          // Update in the cases list
          updateCaseInList(currentCaseId, {
            caseData: updatedCase,
            stage: 'narrative',
            lastUpdated: new Date(),
            riskScore: narrativeResult.confidenceScore,
            status: 'pending_approval',
          })
          return
        }
      } catch (error) {
        console.error('Narrative generation error:', error)
        // Fallback to mock data if API fails
        const updatedCase: CaseData = {
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
        }
        
        set({
          caseData: updatedCase,
          currentStage: 'narrative',
          isLoading: false,
        })
        
        updateCaseInList(currentCaseId, {
          caseData: updatedCase,
          stage: 'narrative',
          lastUpdated: new Date(),
          riskScore: 75,
          status: 'pending_approval',
        })
      }
    } else {
      set({ isLoading: false })
    }
  },

  updateNarrative: (narrative) => {
    const { caseData: currentCase, currentCaseId, updateCaseInList } = get()
    if (currentCase && currentCaseId) {
      const updatedCase: CaseData = {
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
      }
      
      set({
        caseData: updatedCase,
      })
      
      // Update in the cases list
      updateCaseInList(currentCaseId, {
        caseData: updatedCase,
        lastUpdated: new Date(),
      })
    }
  },

  submitToCredit: async () => {
    set({ isLoading: true })
    // Simulate submission processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    const { caseData: currentCase, currentCaseId, updateCaseInList, settings } = get()
    if (currentCase && currentCaseId) {
      const updatedCase: CaseData = {
        ...currentCase,
        timeline: [
          ...currentCase.timeline,
          {
            id: `TL-${Date.now()}`,
            action: 'Credit Narrative submitted to Credit Committee for approval',
            timestamp: new Date(),
            user: settings.user.fullName,
          },
        ],
      }
      
      set({
        caseData: updatedCase,
        isLoading: false,
      })
      
      // Update in the cases list - change status to pending_approval
      updateCaseInList(currentCaseId, {
        caseData: updatedCase,
        status: 'pending_approval',
        lastUpdated: new Date(),
      })
    } else {
      set({ isLoading: false })
    }
  },
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        cases: state.cases,
        caseData: state.caseData,
        currentStage: state.currentStage,
        currentCaseId: state.currentCaseId,
        settings: state.settings,
      }),
      // Handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          // Revive Date objects
          if (parsed.state) {
            if (parsed.state.cases) {
              parsed.state.cases = parsed.state.cases.map((c: CaseListItem) => ({
                ...c,
                createdAt: new Date(c.createdAt),
                lastUpdated: new Date(c.lastUpdated),
                caseData: c.caseData ? {
                  ...c.caseData,
                  prospect: c.caseData.prospect ? {
                    ...c.caseData.prospect,
                    createdAt: new Date(c.caseData.prospect.createdAt),
                  } : undefined,
                  timeline: c.caseData.timeline?.map((t: { id: string; action: string; timestamp: Date | string; user: string }) => ({
                    ...t,
                    timestamp: new Date(t.timestamp),
                  })) || [],
                } : undefined,
              }))
            }
            if (parsed.state.caseData) {
              parsed.state.caseData = {
                ...parsed.state.caseData,
                prospect: parsed.state.caseData.prospect ? {
                  ...parsed.state.caseData.prospect,
                  createdAt: new Date(parsed.state.caseData.prospect.createdAt),
                } : undefined,
                timeline: parsed.state.caseData.timeline?.map((t: { id: string; action: string; timestamp: Date | string; user: string }) => ({
                  ...t,
                  timestamp: new Date(t.timestamp),
                })) || [],
              }
            }
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
