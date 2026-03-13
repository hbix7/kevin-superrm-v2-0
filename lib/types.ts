export type RiskLevel = 'low' | 'medium' | 'high'
export type WorkflowStage = 'screening' | 'underwriting' | 'narrative'
export type RecommendationAction = 'proceed' | 'probe' | 'drop' | 'approve' | 'approve-conditions' | 'adjust' | 'decline'

export interface Prospect {
  id: string
  companyName: string
  registrationNumber: string
  industry: string
  yearsOfOperation: number
  estimatedTurnover: number
  financingPurpose: string
  requestedLoanAmount: number
  directorName: string
  createdAt: Date
}

export interface ScreeningCheck {
  id: string
  dimension: string
  category: string
  check: string
  dataSource: string
  status: 'clear' | 'probe' | 'drop'
  finding: string
  confidence: number
}

export interface ScreeningResult {
  overallScore: number
  confidenceScore: number
  recommendation: RecommendationAction
  reasoning: string
  checks: ScreeningCheck[]
  dimensions: {
    companyLegitimacy: { score: number; status: RiskLevel; findings: string[] }
    directorRisk: { score: number; status: RiskLevel; findings: string[] }
    industryRisk: { score: number; status: RiskLevel; findings: string[] }
    creditSignals: { score: number; status: RiskLevel; findings: string[] }
    businessViability: { score: number; status: RiskLevel; findings: string[] }
    operationalIndicators: { score: number; status: RiskLevel; findings: string[] }
    fraudSignals: { score: number; status: RiskLevel; findings: string[] }
  }
}

export interface FinancialRatios {
  grossProfitMargin: number[]
  netProfitMargin: number[]
  debtToEquity: number[]
  currentRatio: number[]
  dscr: number[]
  debtToEbitda: number[]
  years: string[]
}

export interface UnderwritingCategory {
  name: string
  status: RiskLevel
  score: number
  explanation: string
  checks: {
    name: string
    status: 'clear' | 'probe' | 'drop'
    value: string
    benchmark: string
  }[]
}

export interface UnderwritingResult {
  overallScore: number
  confidenceScore: number
  recommendation: RecommendationAction
  financialRatios: FinancialRatios
  categories: UnderwritingCategory[]
  revenueData: { year: string; revenue: number; profit: number }[]
  debtData: { year: string; debt: number; equity: number }[]
}

export interface CreditNarrative {
  businessProfile: {
    background: string
    industryContext: string
    businessModel: string
  }
  financialAssessment: {
    revenueTrends: string
    profitabilityAnalysis: string
    repaymentCapacity: string
  }
  riskAssessment: {
    keyRisks: string[]
    mitigants: string[]
  }
  facilityStructure: {
    recommendedAmount: number
    tenure: string
    collateral: string
    guarantees: string
  }
  recommendation: RecommendationAction
  confidenceScore: number
  reasoning: string
}

export interface CaseData {
  id: string
  prospect: Prospect
  currentStage: WorkflowStage
  screeningResult?: ScreeningResult
  underwritingResult?: UnderwritingResult
  creditNarrative?: CreditNarrative
  documents: { id: string; name: string; type: string; uploadedAt: Date }[]
  timeline: { id: string; action: string; timestamp: Date; user: string }[]
  overallRiskScore?: number
}
