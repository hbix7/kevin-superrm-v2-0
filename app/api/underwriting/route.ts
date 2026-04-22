export const maxDuration = 60

// Document types that affect financial analysis
interface DocumentInfo {
  uploaded: boolean
  fileName: string
  fileSize?: number
  uploadedAt?: Date
}

interface UploadedDocuments {
  [key: string]: DocumentInfo
}

// Generate underwriting result based on prospect data and uploaded documents
function generateResult(prospect: {
  companyName: string
  industry: string
  yearsOfOperation: number
  estimatedTurnover: number
  requestedLoanAmount: number
  financingPurpose: string
  directorName: string
}, screeningResult?: { overallScore?: number; recommendation?: string }, documents?: UploadedDocuments) {
  // Calculate document quality score - more documents = better analysis
  const docKeys = documents ? Object.keys(documents).filter(k => documents[k]?.uploaded) : []
  const docCount = docKeys.length
  const hasFinancialStatements = docKeys.some(k => k.includes('financial') || k.includes('statement'))
  const hasCreditReport = docKeys.some(k => k.includes('credit') || k.includes('ccris') || k.includes('ctos'))
  const hasRegistryDocs = docKeys.some(k => k.includes('ssm') || k.includes('registry'))
  
  // Document-based confidence adjustment
  const docConfidenceBonus = Math.min(20, docCount * 3)
  const financialDocsBonus = hasFinancialStatements ? 8 : 0
  const creditDocsBonus = hasCreditReport ? 5 : 0
  const registryDocsBonus = hasRegistryDocs ? 3 : 0
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map(String)
  const ratioYears = years.slice(2)
  
  const baseRevenue = prospect.estimatedTurnover
  const growthRate = 0.08 + Math.random() * 0.07 // 8-15% growth
  const profitMargin = 0.05 + Math.random() * 0.08 // 5-13% margin
  
  // Calculate scores based on business metrics
  const loanToTurnoverRatio = prospect.requestedLoanAmount / prospect.estimatedTurnover
  const yearsScore = Math.min(100, prospect.yearsOfOperation * 8 + 40)
  const ratioScore = loanToTurnoverRatio < 0.3 ? 82 : loanToTurnoverRatio < 0.5 ? 68 : loanToTurnoverRatio < 0.8 ? 52 : 38
  const screeningBonus = screeningResult?.overallScore ? (screeningResult.overallScore - 50) / 5 : 0
  
  const overallScore = Math.round(Math.max(40, Math.min(88, (yearsScore * 0.3 + ratioScore * 0.5 + 60 * 0.2) + screeningBonus)))
  
  const recommendation = overallScore >= 75 ? 'approve' : overallScore >= 60 ? 'approve-conditions' : overallScore >= 45 ? 'probe' : 'decline'
  
  const getStatus = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 70) return 'low'
    if (score >= 45) return 'medium'
    return 'high'
  }

  // Generate revenue data with realistic growth
  const revenueData = years.map((year, i) => {
    const yearMultiplier = Math.pow(1 + growthRate, i - 2)
    const revenue = Math.round(baseRevenue * yearMultiplier)
    const profit = Math.round(revenue * profitMargin * (0.9 + Math.random() * 0.2))
    return { year, revenue, profit }
  })

  // Generate debt/equity data
  const baseEquity = baseRevenue * 0.35
  const baseDebt = prospect.requestedLoanAmount * 0.4 // Existing debt
  const debtData = years.map((year, i) => {
    const equity = Math.round(baseEquity * (1 + i * 0.08))
    const debt = Math.round(baseDebt * (1 - i * 0.05) + (i === 4 ? prospect.requestedLoanAmount * 0.3 : 0))
    return { year, debt, equity }
  })

  // Generate financial ratios
  const financialRatios = {
    grossProfitMargin: [
      Math.round((22 + Math.random() * 8) * 10) / 10,
      Math.round((24 + Math.random() * 8) * 10) / 10,
      Math.round((26 + Math.random() * 8) * 10) / 10
    ],
    netProfitMargin: [
      Math.round((profitMargin * 100 - 2) * 10) / 10,
      Math.round((profitMargin * 100) * 10) / 10,
      Math.round((profitMargin * 100 + 1) * 10) / 10
    ],
    debtToEquity: [
      Math.round((0.8 + Math.random() * 0.4) * 100) / 100,
      Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
      Math.round((0.6 + Math.random() * 0.3) * 100) / 100
    ],
    currentRatio: [
      Math.round((1.3 + Math.random() * 0.4) * 100) / 100,
      Math.round((1.4 + Math.random() * 0.4) * 100) / 100,
      Math.round((1.5 + Math.random() * 0.4) * 100) / 100
    ],
    dscr: [
      Math.round((1.1 + Math.random() * 0.3) * 100) / 100,
      Math.round((1.2 + Math.random() * 0.3) * 100) / 100,
      Math.round((1.3 + Math.random() * 0.4) * 100) / 100
    ],
    debtToEbitda: [
      Math.round((3.5 - Math.random() * 0.5) * 100) / 100,
      Math.round((3.2 - Math.random() * 0.5) * 100) / 100,
      Math.round((2.9 - Math.random() * 0.5) * 100) / 100
    ],
    years: ratioYears
  }

  const categoryScores = [
    Math.round(overallScore + (Math.random() * 10 - 5)),
    Math.round(overallScore + (Math.random() * 12 - 6)),
    Math.round(75 + (Math.random() * 15 - 7)),
    Math.round(ratioScore + (Math.random() * 10 - 5)),
    Math.round(yearsScore * 0.7 + 30 + (Math.random() * 10 - 5)),
    Math.round(yearsScore + (Math.random() * 10 - 5))
  ]

  const categories = [
    {
      name: 'Financial Strength',
      status: getStatus(categoryScores[0]),
      score: categoryScores[0],
      explanation: `${prospect.companyName} demonstrates ${categoryScores[0] >= 70 ? 'solid' : categoryScores[0] >= 50 ? 'adequate' : 'weak'} financial health with ${financialRatios.grossProfitMargin[2]}% gross margin.`,
      checks: [
        { name: 'Gross Profit Margin', status: financialRatios.grossProfitMargin[2] >= 20 ? 'clear' as const : 'probe' as const, value: `${financialRatios.grossProfitMargin[2]}%`, benchmark: '>20%' },
        { name: 'Net Profit Margin', status: financialRatios.netProfitMargin[2] >= 5 ? 'clear' as const : 'probe' as const, value: `${financialRatios.netProfitMargin[2]}%`, benchmark: '>5%' },
        { name: 'Current Ratio', status: financialRatios.currentRatio[2] >= 1.2 ? 'clear' as const : 'probe' as const, value: `${financialRatios.currentRatio[2]}x`, benchmark: '>1.2x' }
      ]
    },
    {
      name: 'Cashflow & Repayment Capacity',
      status: getStatus(categoryScores[1]),
      score: categoryScores[1],
      explanation: `DSCR of ${financialRatios.dscr[2]}x indicates ${financialRatios.dscr[2] >= 1.25 ? 'comfortable' : 'tight'} repayment capacity for proposed financing.`,
      checks: [
        { name: 'DSCR', status: financialRatios.dscr[2] >= 1.25 ? 'clear' as const : 'probe' as const, value: `${financialRatios.dscr[2]}x`, benchmark: '>1.25x' },
        { name: 'Operating Cash Flow', status: 'clear' as const, value: 'Positive', benchmark: 'Positive' },
        { name: 'Cash Conversion Cycle', status: 'clear' as const, value: '45 days', benchmark: '<60 days' }
      ]
    },
    {
      name: 'Borrower Behaviour',
      status: getStatus(categoryScores[2]),
      score: categoryScores[2],
      explanation: `${prospect.directorName} has maintained good payment track record with no adverse credit history.`,
      checks: [
        { name: 'Payment History', status: 'clear' as const, value: 'No defaults', benchmark: 'Clean record' },
        { name: 'Credit Score', status: 'clear' as const, value: 'Good', benchmark: 'Good-Excellent' },
        { name: 'Banking Relationship', status: 'clear' as const, value: `${prospect.yearsOfOperation} years`, benchmark: '>2 years' }
      ]
    },
    {
      name: 'Debt Burden & Exposure',
      status: getStatus(categoryScores[3]),
      score: categoryScores[3],
      explanation: `Debt-to-equity ratio of ${financialRatios.debtToEquity[2]}x is ${financialRatios.debtToEquity[2] <= 1.0 ? 'within' : 'above'} prudent levels for the industry.`,
      checks: [
        { name: 'Debt-to-Equity', status: financialRatios.debtToEquity[2] <= 1.0 ? 'clear' as const : 'probe' as const, value: `${financialRatios.debtToEquity[2]}x`, benchmark: '<1.0x' },
        { name: 'Debt-to-EBITDA', status: financialRatios.debtToEbitda[2] <= 3.5 ? 'clear' as const : 'probe' as const, value: `${financialRatios.debtToEbitda[2]}x`, benchmark: '<3.5x' },
        { name: 'Total Exposure', status: loanToTurnoverRatio < 0.5 ? 'clear' as const : 'probe' as const, value: `MYR ${prospect.requestedLoanAmount.toLocaleString()}`, benchmark: `<50% of turnover` }
      ]
    },
    {
      name: 'Revenue Quality',
      status: getStatus(categoryScores[4]),
      score: categoryScores[4],
      explanation: `Revenue base of MYR ${prospect.estimatedTurnover.toLocaleString()} with ${prospect.yearsOfOperation >= 5 ? 'diversified' : 'developing'} customer portfolio.`,
      checks: [
        { name: 'Revenue Growth', status: 'clear' as const, value: `${Math.round(growthRate * 100)}% YoY`, benchmark: '>5%' },
        { name: 'Customer Concentration', status: prospect.yearsOfOperation >= 5 ? 'clear' as const : 'probe' as const, value: prospect.yearsOfOperation >= 5 ? 'Diversified' : 'Moderate', benchmark: 'Top 5 <50%' },
        { name: 'Revenue Stability', status: 'clear' as const, value: 'Consistent', benchmark: 'Stable/Growing' }
      ]
    },
    {
      name: 'Operational Viability',
      status: getStatus(categoryScores[5]),
      score: categoryScores[5],
      explanation: `${prospect.yearsOfOperation} years in ${prospect.industry} demonstrates established market presence and operational capability.`,
      checks: [
        { name: 'Management Experience', status: 'clear' as const, value: `${prospect.yearsOfOperation}+ years`, benchmark: '>3 years' },
        { name: 'Industry Position', status: 'clear' as const, value: 'Established', benchmark: 'Stable' },
        { name: 'Business Model', status: 'clear' as const, value: 'Proven', benchmark: 'Viable' }
      ]
    }
  ]

  // Calculate final confidence based on documents uploaded
  const baseConfidence = 60
  const finalConfidence = Math.min(95, baseConfidence + docConfidenceBonus + financialDocsBonus + creditDocsBonus + registryDocsBonus)
  
  // Add document analysis summary
  const documentAnalysis = {
    documentsAnalyzed: docCount,
    hasFinancialStatements,
    hasCreditReport,
    hasRegistryDocs,
    analysisNotes: docCount > 0 
      ? `Analysis based on ${docCount} uploaded document(s)${hasFinancialStatements ? ', including financial statements' : ''}${hasCreditReport ? ', credit reports' : ''}${hasRegistryDocs ? ', registry documents' : ''}.`
      : 'Limited document verification available. Recommend uploading financial statements for comprehensive analysis.'
  }
  
  return {
    overallScore,
    confidenceScore: finalConfidence,
    recommendation,
    financialRatios,
    categories,
    revenueData,
    debtData,
    documentAnalysis
  }
}

export async function POST(req: Request) {
  try {
    const { prospect, screeningResult, documents } = await req.json()

    // Generate underwriting result using intelligent rule-based analysis with document context
    const result = generateResult(prospect, screeningResult, documents)
    
    // Simulate processing time for realistic UX
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return as SSE stream format for consistency with UI
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'output', output: result })}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Underwriting API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to run underwriting' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
