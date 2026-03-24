import type { Prospect, ScreeningResult, UnderwritingResult, CreditNarrative, CaseData } from '../types'

export type JourneyStage = 
  | 'welcome'
  | 'intent'
  | 'client-info'
  | 'screening'
  | 'screening-results'
  | 'documents'
  | 'underwriting'
  | 'underwriting-results'
  | 'narrative'
  | 'narrative-results'
  | 'review'
  | 'submitted'

export type MessageRole = 'assistant' | 'user' | 'system'

export type QuickActionType = 
  | 'start-new-case'
  | 'resume-case'
  | 'view-cases'
  | 'select-industry'
  | 'confirm'
  | 'edit'
  | 'run-screening'
  | 'proceed-underwriting'
  | 'upload-documents'
  | 'run-underwriting'
  | 'generate-narrative'
  | 'edit-narrative'
  | 'submit-approval'
  | 'back'

export interface QuickAction {
  id: string
  label: string
  type: QuickActionType
  value?: string
  variant?: 'default' | 'outline' | 'secondary'
  disabled?: boolean
}

export interface MessageAttachment {
  id: string
  name: string
  type: string
  size?: number
  url?: string
}

export interface CaseSummaryCard {
  companyName: string
  industry?: string
  loanAmount?: number
  stage: JourneyStage
  riskScore?: number
  recommendation?: string
}

export interface ScreeningResultCard {
  overallScore: number
  confidenceScore: number
  recommendation: string
  reasoning: string
  dimensions: {
    name: string
    score: number
    status: 'low' | 'medium' | 'high'
  }[]
}

export interface UnderwritingResultCard {
  overallScore: number
  confidenceScore: number
  recommendation: string
  categories: {
    name: string
    score: number
    status: 'low' | 'medium' | 'high'
  }[]
}

export interface NarrativePreviewCard {
  businessProfile: string
  financialSummary: string
  recommendation: string
  confidenceScore: number
}

export interface ProgressCard {
  currentStage: JourneyStage
  completedStages: JourneyStage[]
  percentage: number
}

export interface ChatMessageMetadata {
  isLoading?: boolean
  isError?: boolean
  isTyping?: boolean
  caseSummary?: CaseSummaryCard
  screeningResult?: ScreeningResultCard
  underwritingResult?: UnderwritingResultCard
  narrativePreview?: NarrativePreviewCard
  progress?: ProgressCard
  formFields?: FormField[]
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  value?: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  caseId?: string
  stage?: JourneyStage
  actions?: QuickAction[]
  attachments?: MessageAttachment[]
  metadata?: ChatMessageMetadata
}

export interface CollectedProspectData {
  companyName?: string
  registrationNumber?: string
  industry?: string
  yearsOfOperation?: number
  estimatedTurnover?: number
  financingPurpose?: string
  requestedLoanAmount?: number
  directorName?: string
}

export interface ChatSession {
  id: string
  caseId?: string
  messages: ChatMessage[]
  currentStage: JourneyStage
  collectedData: CollectedProspectData
  createdAt: Date
  updatedAt: Date
}

export interface ChatState {
  sessions: Record<string, ChatSession>
  activeSessionId: string | null
  globalMessages: ChatMessage[]
}

// Conversation flow configuration
export interface ConversationStep {
  stage: JourneyStage
  field?: keyof CollectedProspectData
  question: string
  type: 'text' | 'number' | 'select' | 'confirm' | 'action'
  options?: { label: string; value: string }[]
  validation?: (value: string) => boolean | string
  nextStage?: JourneyStage
}

// Industries list for selection
export const INDUSTRIES = [
  { label: 'Manufacturing - Metal Components', value: 'Manufacturing - Metal Components' },
  { label: 'Manufacturing - Electronics', value: 'Manufacturing - Electronics' },
  { label: 'Manufacturing - Food & Beverage', value: 'Manufacturing - Food & Beverage' },
  { label: 'Wholesale Trade', value: 'Wholesale Trade' },
  { label: 'Retail Trade', value: 'Retail Trade' },
  { label: 'Construction', value: 'Construction' },
  { label: 'Transportation & Logistics', value: 'Transportation & Logistics' },
  { label: 'Professional Services', value: 'Professional Services' },
  { label: 'Technology & IT Services', value: 'Technology & IT Services' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Hospitality', value: 'Hospitality' },
  { label: 'Services - IT', value: 'Services - IT' },
  { label: 'Trading - Import/Export', value: 'Trading - Import/Export' },
  { label: 'Trading - Wholesale', value: 'Trading - Wholesale' },
]

// Financing purposes
export const FINANCING_PURPOSES = [
  { label: 'Working Capital', value: 'Working Capital' },
  { label: 'Equipment Purchase', value: 'Equipment Purchase' },
  { label: 'Business Expansion', value: 'Business Expansion' },
  { label: 'Trade Financing', value: 'Trade Financing' },
  { label: 'Project Financing', value: 'Project Financing' },
  { label: 'Debt Refinancing', value: 'Debt Refinancing' },
  { label: 'Property Purchase', value: 'Property Purchase' },
  { label: 'Other', value: 'Other' },
]
