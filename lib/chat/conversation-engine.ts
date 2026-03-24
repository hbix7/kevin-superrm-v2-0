import type { 
  JourneyStage, 
  ChatMessage, 
  QuickAction, 
  CollectedProspectData,
  ScreeningResultCard,
  UnderwritingResultCard,
  NarrativePreviewCard
} from './types'
import { INDUSTRIES, FINANCING_PURPOSES } from './types'
import type { Prospect, ScreeningResult, UnderwritingResult, CreditNarrative } from '../types'

// Conversation flow definition
interface ConversationResponse {
  message: string
  actions?: QuickAction[]
  nextStage?: JourneyStage
  metadata?: ChatMessage['metadata']
}

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Convert full screening result to card format
export function screeningToCard(result: ScreeningResult): ScreeningResultCard {
  return {
    overallScore: result.overallScore,
    confidenceScore: result.confidenceScore,
    recommendation: result.recommendation,
    reasoning: result.reasoning,
    dimensions: Object.entries(result.dimensions).map(([key, dim]) => ({
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      score: dim.score,
      status: dim.status,
    })),
  }
}

// Convert full underwriting result to card format
export function underwritingToCard(result: UnderwritingResult): UnderwritingResultCard {
  return {
    overallScore: result.overallScore,
    confidenceScore: result.confidenceScore,
    recommendation: result.recommendation,
    categories: result.categories.map(cat => ({
      name: cat.name,
      score: cat.score,
      status: cat.status,
    })),
  }
}

// Convert narrative to preview card format
export function narrativeToCard(narrative: CreditNarrative): NarrativePreviewCard {
  return {
    businessProfile: narrative.businessProfile.background.substring(0, 200) + '...',
    financialSummary: narrative.financialAssessment.revenueTrends.substring(0, 200) + '...',
    recommendation: narrative.recommendation,
    confidenceScore: narrative.confidenceScore,
  }
}

// Main conversation engine
export class ConversationEngine {
  private collectedData: CollectedProspectData = {}
  
  constructor(initialData?: CollectedProspectData) {
    if (initialData) {
      this.collectedData = { ...initialData }
    }
  }
  
  updateData(data: Partial<CollectedProspectData>) {
    this.collectedData = { ...this.collectedData, ...data }
  }
  
  getData(): CollectedProspectData {
    return this.collectedData
  }
  
  resetData() {
    this.collectedData = {}
  }
  
  // Get the welcome message
  getWelcomeMessage(): ConversationResponse {
    return {
      message: "Hello! I'm your Credit Assessment Assistant. I'm here to guide you through evaluating a new prospect or continuing an existing case.\n\nWhat would you like to do today?",
      actions: [
        { id: generateId(), label: 'Start New Case', type: 'start-new-case', variant: 'default' },
        { id: generateId(), label: 'Resume Existing Case', type: 'resume-case', variant: 'outline' },
        { id: generateId(), label: 'View All Cases', type: 'view-cases', variant: 'outline' },
      ],
      nextStage: 'intent',
    }
  }
  
  // Process user intent
  processIntent(intent: string): ConversationResponse {
    const lowerIntent = intent.toLowerCase()
    
    if (lowerIntent.includes('new') || lowerIntent.includes('start') || lowerIntent.includes('create')) {
      return this.startNewCase()
    }
    
    if (lowerIntent.includes('resume') || lowerIntent.includes('continue') || lowerIntent.includes('existing')) {
      return {
        message: "Sure! You can select a case from the sidebar on the left, or tell me the company name or case ID you'd like to resume.",
        nextStage: 'intent',
      }
    }
    
    if (lowerIntent.includes('view') || lowerIntent.includes('all') || lowerIntent.includes('list')) {
      return {
        message: "You can see all your cases in the sidebar on the left. Click on any case to view its details and continue working on it.\n\nOr would you like to start a new assessment?",
        actions: [
          { id: generateId(), label: 'Start New Case', type: 'start-new-case', variant: 'default' },
        ],
        nextStage: 'intent',
      }
    }
    
    return {
      message: "I didn't quite catch that. Would you like to start a new credit assessment or continue with an existing case?",
      actions: [
        { id: generateId(), label: 'Start New Case', type: 'start-new-case', variant: 'default' },
        { id: generateId(), label: 'Resume Existing', type: 'resume-case', variant: 'outline' },
      ],
      nextStage: 'intent',
    }
  }
  
  // Start collecting client info
  startNewCase(): ConversationResponse {
    this.resetData()
    return {
      message: "Great! Let's start a new credit assessment.\n\nFirst, what's the company name you'd like to evaluate?",
      nextStage: 'client-info',
    }
  }
  
  // Process client info collection
  processClientInfo(input: string, currentField?: string): ConversationResponse {
    // Determine which field we're collecting based on what's missing
    if (!this.collectedData.companyName) {
      this.collectedData.companyName = input.trim()
      return {
        message: `Got it - ${this.collectedData.companyName}.\n\nWhat's their business registration number?`,
        nextStage: 'client-info',
      }
    }
    
    if (!this.collectedData.registrationNumber) {
      this.collectedData.registrationNumber = input.trim()
      return {
        message: "Thank you. Now, what industry is the company in?",
        actions: INDUSTRIES.slice(0, 6).map(ind => ({
          id: generateId(),
          label: ind.label.split(' - ')[0],
          type: 'select-industry' as const,
          value: ind.value,
          variant: 'outline' as const,
        })),
        nextStage: 'client-info',
      }
    }
    
    if (!this.collectedData.industry) {
      // Check if it's a selection or typed
      const matchedIndustry = INDUSTRIES.find(
        ind => ind.value.toLowerCase() === input.toLowerCase() || 
               ind.label.toLowerCase().includes(input.toLowerCase())
      )
      this.collectedData.industry = matchedIndustry?.value || input.trim()
      return {
        message: `${this.collectedData.industry} - got it.\n\nHow many years has the company been operating?`,
        nextStage: 'client-info',
      }
    }
    
    if (!this.collectedData.yearsOfOperation) {
      const years = parseInt(input.replace(/[^0-9]/g, ''))
      if (isNaN(years) || years < 0) {
        return {
          message: "Please enter a valid number of years (e.g., '5' or '5 years').",
          nextStage: 'client-info',
        }
      }
      this.collectedData.yearsOfOperation = years
      return {
        message: `${years} years of operation.\n\nWhat's the company's estimated annual turnover in MYR?`,
        nextStage: 'client-info',
      }
    }
    
    if (!this.collectedData.estimatedTurnover) {
      const turnover = parseFloat(input.replace(/[^0-9.]/g, ''))
      if (isNaN(turnover) || turnover <= 0) {
        return {
          message: "Please enter a valid amount (e.g., '5000000' or '5 million').",
          nextStage: 'client-info',
        }
      }
      this.collectedData.estimatedTurnover = turnover
      return {
        message: `Annual turnover of MYR ${turnover.toLocaleString()}.\n\nHow much financing are they looking for?`,
        nextStage: 'client-info',
      }
    }
    
    if (!this.collectedData.requestedLoanAmount) {
      const amount = parseFloat(input.replace(/[^0-9.]/g, ''))
      if (isNaN(amount) || amount <= 0) {
        return {
          message: "Please enter a valid loan amount (e.g., '2500000' or '2.5 million').",
          nextStage: 'client-info',
        }
      }
      this.collectedData.requestedLoanAmount = amount
      return {
        message: `Loan amount of MYR ${amount.toLocaleString()}.\n\nWhat's the purpose of the financing?`,
        actions: FINANCING_PURPOSES.slice(0, 4).map(purpose => ({
          id: generateId(),
          label: purpose.label,
          type: 'select-industry' as const,
          value: purpose.value,
          variant: 'outline' as const,
        })),
        nextStage: 'client-info',
      }
    }
    
    if (!this.collectedData.financingPurpose) {
      const matchedPurpose = FINANCING_PURPOSES.find(
        p => p.value.toLowerCase() === input.toLowerCase() ||
             p.label.toLowerCase().includes(input.toLowerCase())
      )
      this.collectedData.financingPurpose = matchedPurpose?.value || input.trim()
      return {
        message: `Purpose: ${this.collectedData.financingPurpose}.\n\nFinally, who is the main director or owner?`,
        nextStage: 'client-info',
      }
    }
    
    if (!this.collectedData.directorName) {
      this.collectedData.directorName = input.trim()
      
      // All data collected - show summary
      return this.getSummaryConfirmation()
    }
    
    return {
      message: "I have all the information I need. Let me show you a summary.",
      nextStage: 'client-info',
    }
  }
  
  // Get summary and confirmation
  getSummaryConfirmation(): ConversationResponse {
    const data = this.collectedData
    return {
      message: `Excellent! Here's a summary of the prospect information:\n\nCompany: ${data.companyName}\nRegistration: ${data.registrationNumber}\nIndustry: ${data.industry}\nYears Operating: ${data.yearsOfOperation}\nAnnual Turnover: MYR ${data.estimatedTurnover?.toLocaleString()}\nLoan Requested: MYR ${data.requestedLoanAmount?.toLocaleString()}\nPurpose: ${data.financingPurpose}\nDirector: ${data.directorName}\n\nIs this information correct?`,
      actions: [
        { id: generateId(), label: 'Yes, Run Screening', type: 'run-screening', variant: 'default' },
        { id: generateId(), label: 'Make Changes', type: 'edit', variant: 'outline' },
      ],
      metadata: {
        caseSummary: {
          companyName: data.companyName!,
          industry: data.industry,
          loanAmount: data.requestedLoanAmount,
          stage: 'client-info',
        },
      },
      nextStage: 'screening',
    }
  }
  
  // Prepare for screening
  getScreeningStart(): ConversationResponse {
    return {
      message: "Running AI-powered screening now. I'll check:\n\n- Company registry verification\n- Sanctions & PEP checks\n- Credit bureau lookup\n- Industry risk assessment\n- Business viability signals\n\nThis usually takes about 10-15 seconds...",
      metadata: {
        isLoading: true,
      },
      nextStage: 'screening',
    }
  }
  
  // Screening complete
  getScreeningComplete(result: ScreeningResult): ConversationResponse {
    const recommendation = result.recommendation
    let message = `Screening complete!\n\n`
    
    if (recommendation === 'proceed') {
      message += `Good news - the prospect passes initial screening with a risk score of ${result.overallScore}.\n\n${result.reasoning}\n\nWould you like to proceed to financial analysis?`
    } else if (recommendation === 'probe') {
      message += `The screening identified some areas that need further investigation. Risk score: ${result.overallScore}.\n\n${result.reasoning}\n\nYou may want to gather more information before proceeding.`
    } else {
      message += `I'm afraid the screening has flagged significant concerns. Risk score: ${result.overallScore}.\n\n${result.reasoning}\n\nI recommend reviewing these findings carefully before deciding to proceed.`
    }
    
    const actions: QuickAction[] = []
    if (recommendation === 'proceed' || recommendation === 'probe') {
      actions.push({ id: generateId(), label: 'Proceed to Underwriting', type: 'proceed-underwriting', variant: 'default' })
    }
    actions.push({ id: generateId(), label: 'View Detailed Results', type: 'view-cases', variant: 'outline' })
    
    return {
      message,
      actions,
      metadata: {
        screeningResult: screeningToCard(result),
      },
      nextStage: 'screening-results',
    }
  }
  
  // Prepare for underwriting
  getUnderwritingStart(): ConversationResponse {
    return {
      message: "Now I'll perform a comprehensive financial analysis. This includes:\n\n- Revenue and profitability trends\n- Debt service coverage analysis\n- Cashflow assessment\n- Credit behavior review\n- Industry benchmarking\n\nAnalyzing the financials...",
      metadata: {
        isLoading: true,
      },
      nextStage: 'underwriting',
    }
  }
  
  // Underwriting complete
  getUnderwritingComplete(result: UnderwritingResult): ConversationResponse {
    const message = `Financial analysis complete!\n\nOverall score: ${result.overallScore} with ${result.confidenceScore}% confidence.\n\nKey findings across ${result.categories.length} assessment categories have been evaluated. The analysis shows the company's financial health and repayment capacity.\n\nWould you like me to generate a credit narrative for approval?`
    
    return {
      message,
      actions: [
        { id: generateId(), label: 'Generate Narrative', type: 'generate-narrative', variant: 'default' },
        { id: generateId(), label: 'View Analysis Details', type: 'view-cases', variant: 'outline' },
      ],
      metadata: {
        underwritingResult: underwritingToCard(result),
      },
      nextStage: 'underwriting-results',
    }
  }
  
  // Prepare for narrative
  getNarrativeStart(): ConversationResponse {
    return {
      message: "Generating a comprehensive credit narrative now. This will include:\n\n- Executive summary\n- Business profile analysis\n- Financial assessment\n- Risk evaluation\n- Facility recommendation\n\nCrafting the narrative...",
      metadata: {
        isLoading: true,
      },
      nextStage: 'narrative',
    }
  }
  
  // Narrative complete
  getNarrativeComplete(narrative: CreditNarrative): ConversationResponse {
    const recLabel = {
      'approve': 'Approve',
      'approve-conditions': 'Approve with Conditions',
      'adjust': 'Adjust Terms',
      'decline': 'Decline',
    }[narrative.recommendation] || narrative.recommendation
    
    return {
      message: `Credit narrative generated!\n\nRecommendation: ${recLabel}\nConfidence: ${narrative.confidenceScore}%\n\n${narrative.reasoning}\n\nYou can review the full narrative, make edits if needed, and submit for approval.`,
      actions: [
        { id: generateId(), label: 'Submit for Approval', type: 'submit-approval', variant: 'default' },
        { id: generateId(), label: 'Edit Narrative', type: 'edit-narrative', variant: 'outline' },
        { id: generateId(), label: 'View Full Narrative', type: 'view-cases', variant: 'outline' },
      ],
      metadata: {
        narrativePreview: narrativeToCard(narrative),
      },
      nextStage: 'narrative-results',
    }
  }
  
  // Submit for approval
  getSubmissionConfirmation(): ConversationResponse {
    return {
      message: "The credit narrative has been submitted to the Credit Committee for approval.\n\nYou'll receive a notification once a decision has been made. In the meantime, you can:\n\n- Start a new assessment\n- Review other pending cases\n- Check the status of this submission",
      actions: [
        { id: generateId(), label: 'Start New Case', type: 'start-new-case', variant: 'default' },
        { id: generateId(), label: 'View All Cases', type: 'view-cases', variant: 'outline' },
      ],
      metadata: {
        progress: {
          currentStage: 'submitted',
          completedStages: ['client-info', 'screening', 'screening-results', 'underwriting', 'underwriting-results', 'narrative', 'narrative-results', 'review', 'submitted'],
          percentage: 100,
        },
      },
      nextStage: 'submitted',
    }
  }
  
  // Build prospect from collected data
  buildProspect(): Prospect {
    const data = this.collectedData
    return {
      id: `PROS-${Date.now()}`,
      companyName: data.companyName || '',
      registrationNumber: data.registrationNumber || '',
      industry: data.industry || '',
      yearsOfOperation: data.yearsOfOperation || 0,
      estimatedTurnover: data.estimatedTurnover || 0,
      financingPurpose: data.financingPurpose || '',
      requestedLoanAmount: data.requestedLoanAmount || 0,
      directorName: data.directorName || '',
      createdAt: new Date(),
    }
  }
  
  // Check if all required data is collected
  isDataComplete(): boolean {
    const required: (keyof CollectedProspectData)[] = [
      'companyName',
      'registrationNumber', 
      'industry',
      'yearsOfOperation',
      'estimatedTurnover',
      'requestedLoanAmount',
      'financingPurpose',
      'directorName',
    ]
    return required.every(field => this.collectedData[field] !== undefined && this.collectedData[field] !== '')
  }
}

// Create a singleton for easy access
let engineInstance: ConversationEngine | null = null

export function getConversationEngine(initialData?: CollectedProspectData): ConversationEngine {
  if (!engineInstance) {
    engineInstance = new ConversationEngine(initialData)
  } else if (initialData) {
    engineInstance.updateData(initialData)
  }
  return engineInstance
}

export function resetConversationEngine(): void {
  engineInstance = null
}
