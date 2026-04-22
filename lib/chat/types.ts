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
  | 'screening-chip'
  | 'screening-next'
  | 'screening-add-notes'
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
  documents?: CollectedDocuments
  rapidScreening?: RapidScreeningState
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

// Required documents for credit assessment
export interface RequiredDocument {
  id: string
  name: string
  description: string
  category: 'financial' | 'registry' | 'credit' | 'internal'
  required: boolean
  uploaded?: boolean
  fileName?: string
}

export const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  // Financial Documents
  { id: 'audited-fs', name: 'Audited Financial Statements', description: 'Last 2-3 years of audited accounts', category: 'financial', required: true },
  { id: 'management-accounts', name: 'Management Accounts', description: 'Latest management accounts / interim financials', category: 'financial', required: true },
  { id: 'bank-statements', name: 'Bank Statements', description: 'Last 6-12 months of bank statements', category: 'financial', required: true },
  { id: 'banking-facilities', name: 'Existing Banking Facilities', description: 'Current facility letters and loan schedules', category: 'financial', required: false },
  
  // Related Party / ICA
  { id: 'ica-model', name: 'ICA Financial Model', description: 'Inter-company account reconciliation and financial model', category: 'financial', required: false },
  { id: 'rp-bank-statements', name: 'Related Party Bank Statements', description: 'Bank statements for related entities', category: 'financial', required: false },
  
  // Credit Reports
  { id: 'ctos-report', name: 'CTOS Report', description: 'Full CTOS company and director report', category: 'credit', required: true },
  { id: 'ccris-report', name: 'CCRIS Report', description: 'BNM CCRIS credit report', category: 'credit', required: true },
  { id: 'ctos-lite', name: 'CTOS Lite', description: 'Quick CTOS snapshot for preliminary review', category: 'credit', required: false },
  
  // Registry Documents
  { id: 'ssm-roc', name: 'SSM / ROC Registry', description: 'Company profile from SSM / ROC', category: 'registry', required: true },
  { id: 'google-search', name: 'Google Search Results', description: 'Background search on company and directors', category: 'registry', required: false },
  
  // Internal Checks
  { id: 'internal-blacklist', name: 'Internal Blacklist Check', description: 'Verification against internal blacklist database', category: 'internal', required: true },
]

export interface DocumentUploadState {
  documents: RequiredDocument[]
  allRequiredUploaded: boolean
}

export interface CollectedDocuments {
  [documentId: string]: {
    uploaded: boolean
    fileName?: string
    fileSize?: number
    uploadedAt?: Date
  }
}

// Rapid Screening Steps - 11 step process
export type ScreeningOutcome = 'clear' | 'probe' | 'drop'

export interface ScreeningChipOption {
  id: string
  label: string
  outcome: ScreeningOutcome
  probeMessage?: string
}

export interface RapidScreeningStep {
  id: string
  stepNumber: number
  title: string
  dataSource: string
  question: string
  chips: ScreeningChipOption[]
}

export interface ScreeningStepResult {
  stepId: string
  selectedChip: string
  outcome: ScreeningOutcome
  probeMessage?: string
  notes?: string
  timestamp: Date
}

export interface RapidScreeningState {
  currentStep: number
  completedSteps: ScreeningStepResult[]
  overallOutcome: ScreeningOutcome
  isComplete: boolean
  droppedAt?: string
}

// 11 Rapid Screening Steps Definition
export const RAPID_SCREENING_STEPS: RapidScreeningStep[] = [
  {
    id: 'company-status',
    stepNumber: 1,
    title: 'Company Status',
    dataSource: 'SSM or CTOS website',
    question: 'What is the company status according to SSM/CTOS?',
    chips: [
      { id: 'existing-active', label: 'Existing / Active', outcome: 'clear' },
      { id: 'dormant', label: 'Dormant', outcome: 'probe', probeMessage: 'Ask customer why company is dormant. Note: SSM marks dormant if bank account has no activity for 6+ months — can be reactivated.' },
      { id: 'winding-up', label: 'Winding Up', outcome: 'probe', probeMessage: 'Ask: Is this a different company? Is the winding up voluntary or court-ordered?' },
    ],
  },
  {
    id: 'business-presence',
    stepNumber: 2,
    title: 'Business Presence',
    dataSource: 'Google Maps, company website, social media (FB, TikTok, Instagram)',
    question: 'Can you confirm the business presence online?',
    chips: [
      { id: 'confirmed', label: 'Confirmed presence', outcome: 'clear' },
      { id: 'no-trace', label: 'No trace found', outcome: 'probe', probeMessage: 'Get address from customer directly. Arrange a site visit to verify.' },
      { id: 'address-mismatch', label: 'Address mismatch', outcome: 'probe', probeMessage: 'Ask why address differs from internet sources. Request tenancy agreement.' },
    ],
  },
  {
    id: 'business-activity',
    stepNumber: 3,
    title: 'Business Activity',
    dataSource: 'SSM business code / CTOS MSIC Code',
    question: 'Does the business activity match the SSM/MSIC code?',
    chips: [
      { id: 'consistent', label: 'Consistent match', outcome: 'clear' },
      { id: 'slight-mismatch', label: 'Slight mismatch', outcome: 'probe', probeMessage: 'Ask customer why there\'s a mismatch. Must be explained clearly in write-up/memo.' },
      { id: 'completely-unrelated', label: 'Completely unrelated', outcome: 'probe', probeMessage: 'Ask customer why there\'s a mismatch. Must be explained clearly in write-up/memo.' },
    ],
  },
  {
    id: 'business-age',
    stepNumber: 4,
    title: 'Business Age',
    dataSource: 'SSM incorporation date',
    question: 'How long has the company been incorporated?',
    chips: [
      { id: '3-years-plus', label: '3 years or more', outcome: 'clear' },
      { id: 'less-than-3', label: 'Less than 3 years', outcome: 'probe', probeMessage: 'Ask: (1) Is this a continuation or expansion of a previous business? (2) Is it an investment holding company?' },
    ],
  },
  {
    id: 'net-worth',
    stepNumber: 5,
    title: 'Net Worth',
    dataSource: 'SSM share capital & retained earnings / CTOS Lite',
    question: 'What is the company\'s net worth position?',
    chips: [
      { id: 'positive', label: 'Positive net worth', outcome: 'clear' },
      { id: 'negative', label: 'Negative net worth', outcome: 'probe', probeMessage: 'Ask: (1) What caused the negative net worth? (2) Does customer foresee this as temporary — and how long until recovery?' },
    ],
  },
  {
    id: 'revenue',
    stepNumber: 6,
    title: 'Revenue',
    dataSource: 'CTOS Lite latest year revenue',
    question: 'What is the company\'s latest annual revenue?',
    chips: [
      { id: 'above-500k', label: 'RM500k or above', outcome: 'clear' },
      { id: 'below-500k', label: 'Below RM500k', outcome: 'probe', probeMessage: 'Revenue is below the RM500k minimum threshold. Escalate and discuss with supervisor before proceeding.' },
    ],
  },
  {
    id: 'reputation-legal',
    stepNumber: 7,
    title: 'Reputation & Legal',
    dataSource: 'News sources + CTOS Lite litigation status',
    question: 'What does the reputation and legal check show?',
    chips: [
      { id: 'clean', label: 'Clean', outcome: 'clear' },
      { id: 'minor-legal', label: 'Minor legal cases', outcome: 'probe', probeMessage: 'Ask if cases are settled or pending. If settled, request court letter or documentary evidence.' },
      { id: 'significant-news', label: 'Significant negative news', outcome: 'probe', probeMessage: 'More than one negatively impactful news item. Ask customer for full details and justification.' },
      { id: 'further-dd', label: 'Further due diligence recommended', outcome: 'probe', probeMessage: 'CTOS status is "Further Due Diligence With Consent Recommended." Ask if settled or pending. If settled, obtain court letter or documentary evidence.' },
    ],
  },
  {
    id: 'director-bankruptcy',
    stepNumber: 8,
    title: 'Director Bankruptcy',
    dataSource: 'Insolvency Dept (MDI/JIM) + CTOS Lite',
    question: 'What is the director\'s bankruptcy status?',
    chips: [
      { id: 'clean', label: 'Clean', outcome: 'clear' },
      { id: 'fresh-mdi', label: 'Fresh MDI Search Recommended', outcome: 'probe', probeMessage: 'Conduct a fresh MDI search. If still flagged, ask if settled or pending.' },
      { id: 'settled', label: 'Settled — with documentary evidence', outcome: 'probe', probeMessage: 'Request and verify MDI/JIM documentary evidence before proceeding.' },
      { id: 'pending', label: 'Pending / outstanding', outcome: 'probe', probeMessage: 'Outstanding bankruptcy matter. Escalate for further due diligence.' },
    ],
  },
  {
    id: 'director-history',
    stepNumber: 9,
    title: 'Director History',
    dataSource: 'CTOS Lite — Director\'s Date of Appointment',
    question: 'How long has the director been appointed?',
    chips: [
      { id: '3-years-plus', label: 'At least one director with 3+ years', outcome: 'clear' },
      { id: 'all-under-3', label: 'All directors under 3 years', outcome: 'probe', probeMessage: 'Ask if any director has experience in another company in the same industry. If YES → request name card and do employment verification. If NO → ask if customer can provide a guarantor with relevant industry experience.' },
    ],
  },
  {
    id: 'industry-risk',
    stepNumber: 10,
    title: 'Industry Risk',
    dataSource: 'Product Dept / Credit Dept stats',
    question: 'What is the industry risk classification?',
    chips: [
      { id: 'within-appetite', label: 'Within risk appetite', outcome: 'clear' },
      { id: 'non-target', label: 'Non-target industry', outcome: 'probe', probeMessage: 'Confirm with credit team. Cyclical/non-target industries may still qualify with justification.' },
      { id: 'caution', label: 'Caution lending', outcome: 'probe', probeMessage: 'Proceed only on a 1:1 cash-back basis.' },
      { id: 'prohibited', label: 'Prohibited lending', outcome: 'drop', probeMessage: 'Prohibited lending category — drop case immediately. Do not proceed.' },
    ],
  },
  {
    id: 'credit-signals',
    stepNumber: 11,
    title: 'Credit Signals (CCRIS)',
    dataSource: 'CCRIS (requires customer consent — can be pulled via CMB). Also reference the Programme Underwriting PDF as each programme\'s CCRIS criteria differs.',
    question: 'What does the CCRIS credit check show?',
    chips: [
      { id: 'clean', label: 'Clean — 0 overdue', outcome: 'clear' },
      { id: 'occasional', label: 'Occasional delays', outcome: 'probe', probeMessage: 'Some delinquencies noted. Quantify frequency and recency. Check against the relevant programme\'s CCRIS criteria.' },
      { id: 'multiple-overdue', label: 'Multiple overdue loans', outcome: 'probe', probeMessage: 'Multiple overdue accounts. Significant credit concern — escalate to credit team before proceeding.' },
    ],
  },
]
