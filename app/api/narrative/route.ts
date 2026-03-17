export const maxDuration = 60

// Generate dynamic narrative based on prospect and analysis data
function generateDynamicNarrative(
  prospect: {
    companyName: string
    registrationNumber: string
    industry: string
    yearsOfOperation: number
    estimatedTurnover: number
    requestedLoanAmount: number
    financingPurpose: string
    directorName: string
  },
  screeningResult?: { overallScore?: number; recommendation?: string; dimensions?: Record<string, { score: number }> },
  underwritingResult?: { 
    overallScore?: number; 
    financialRatios?: { 
      dscr?: number[]; 
      debtToEquity?: number[]; 
      currentRatio?: number[];
      netProfitMargin?: number[];
    };
    categories?: Record<string, { score: number }>;
  }
) {
  const loanToTurnoverRatio = prospect.requestedLoanAmount / prospect.estimatedTurnover
  const screeningScore = screeningResult?.overallScore || 65
  const uwScore = underwritingResult?.overallScore || 65
  const avgScore = (screeningScore + uwScore) / 2
  
  const recommendation = avgScore >= 70 ? 'approve' : avgScore >= 55 ? 'approve-conditions' : 'decline'
  const confidenceScore = Math.round(75 + Math.random() * 10)
  
  // Adjust recommended amount based on risk
  const recommendedMultiplier = recommendation === 'approve' ? 1.0 : recommendation === 'approve-conditions' ? 0.85 : 0.6
  const recommendedAmount = Math.round(prospect.requestedLoanAmount * recommendedMultiplier)

  // Get financial metrics or generate reasonable defaults
  const dscr = underwritingResult?.financialRatios?.dscr?.[2] || (1.15 + (avgScore / 100) * 0.5)
  const debtToEquity = underwritingResult?.financialRatios?.debtToEquity?.[2] || (0.5 + (1 - avgScore / 100) * 0.6)
  const currentRatio = underwritingResult?.financialRatios?.currentRatio?.[2] || (1.2 + (avgScore / 100) * 0.5)
  const netProfitMargin = underwritingResult?.financialRatios?.netProfitMargin?.[2] || (5 + (avgScore / 100) * 6)

  // Parse industry info
  const industryParts = prospect.industry.split(' - ')
  const industryType = industryParts[0] || prospect.industry
  const industrySubtype = industryParts[1] || ''

  // Get year established
  const currentYear = new Date().getFullYear()
  const yearEstablished = currentYear - prospect.yearsOfOperation

  // Generate industry-specific content
  const industryInsights = getIndustryInsights(industryType, avgScore)
  const financePurposeAnalysis = getFinancePurposeAnalysis(prospect.financingPurpose, recommendedAmount)

  return {
    businessProfile: {
      background: `${prospect.companyName} (Company No. ${prospect.registrationNumber}) is a Malaysian-registered ${industryType.toLowerCase()} company established in ${yearEstablished}. Under the leadership of ${prospect.directorName} as the principal director, the company has built a ${prospect.yearsOfOperation >= 10 ? 'well-established' : prospect.yearsOfOperation >= 5 ? 'mature' : 'developing'} presence in the ${prospect.industry} sector over ${prospect.yearsOfOperation} years of operations.

The company has achieved an annual turnover of MYR ${prospect.estimatedTurnover.toLocaleString()}, positioning it as a ${prospect.estimatedTurnover >= 10000000 ? 'mid-sized enterprise' : prospect.estimatedTurnover >= 3000000 ? 'growing SME' : 'small enterprise'} within the local market. ${prospect.directorName} brings ${prospect.yearsOfOperation >= 5 ? 'significant' : 'relevant'} industry experience, having guided the company through various market cycles and ${prospect.yearsOfOperation >= 3 ? 'established' : 'building'} key business relationships.`,
      
      industryContext: `The ${industryType} sector in Malaysia ${industryInsights.marketCondition}. ${industrySubtype ? `Within the ${industrySubtype.toLowerCase()} segment, ` : ''}${industryInsights.sectorTrends}

${industryInsights.competitiveLandscape} ${prospect.companyName}'s ${prospect.yearsOfOperation >= 5 ? 'established track record' : 'growing presence'} and turnover of MYR ${prospect.estimatedTurnover.toLocaleString()} suggests ${avgScore >= 65 ? 'a competitive position' : 'opportunity for strengthening market share'} within its operating segment.`,
      
      businessModel: `${prospect.companyName} operates a ${prospect.yearsOfOperation >= 5 ? 'proven' : 'developing'} business model focused on ${industryType.toLowerCase()} activities${industrySubtype ? ` specializing in ${industrySubtype.toLowerCase()}` : ''}. The company's revenue generation is driven by ${industryInsights.revenueDrivers}.

${financePurposeAnalysis.businessModelAlignment} The ${prospect.financingPurpose.toLowerCase()} financing request aligns with ${prospect.yearsOfOperation >= 3 ? 'the company\'s growth trajectory' : 'efforts to scale operations'} and industry best practices.`
    },
    financialAssessment: {
      revenueTrends: `${prospect.companyName} reports annual turnover of MYR ${prospect.estimatedTurnover.toLocaleString()}, reflecting ${avgScore >= 70 ? 'strong market penetration' : avgScore >= 55 ? 'steady business activity' : 'growth stage operations'}. The loan-to-turnover ratio stands at ${(loanToTurnoverRatio * 100).toFixed(1)}%, which is ${loanToTurnoverRatio < 0.25 ? 'conservative and well within prudent limits' : loanToTurnoverRatio < 0.4 ? 'reasonable relative to business scale' : loanToTurnoverRatio < 0.6 ? 'elevated but justifiable for the stated purpose' : 'high, requiring close monitoring'}.

Based on ${prospect.yearsOfOperation} years of operation, revenue trends indicate ${avgScore >= 65 ? 'consistent business performance' : 'developing revenue stability'}. The company's turnover supports ${recommendation === 'approve' ? 'the full requested facility' : recommendation === 'approve-conditions' ? 'a moderated facility amount' : 'a significantly reduced facility'} of MYR ${recommendedAmount.toLocaleString()}.`,
      
      profitabilityAnalysis: `Profitability metrics for ${prospect.companyName} show net profit margins of approximately ${netProfitMargin.toFixed(1)}%, ${netProfitMargin >= 10 ? 'significantly above' : netProfitMargin >= 6 ? 'in line with' : 'below'} typical benchmarks for the ${industryType.toLowerCase()} sector. 

The company maintains a current ratio of ${currentRatio.toFixed(2)}x, indicating ${currentRatio >= 1.5 ? 'strong' : currentRatio >= 1.2 ? 'adequate' : 'tight'} short-term liquidity. Working capital management appears ${avgScore >= 60 ? 'well-controlled' : 'requiring attention'}, with operational cash flows ${dscr >= 1.25 ? 'supporting' : dscr >= 1.1 ? 'adequately covering' : 'tightly managing'} ongoing obligations.`,
      
      repaymentCapacity: `The debt service coverage ratio (DSCR) is estimated at ${dscr.toFixed(2)}x, ${dscr >= 1.3 ? 'providing comfortable headroom' : dscr >= 1.15 ? 'meeting minimum requirements' : 'indicating constrained capacity'} for servicing the proposed facility. Debt-to-equity ratio at ${debtToEquity.toFixed(2)}x reflects ${debtToEquity <= 0.6 ? 'conservative' : debtToEquity <= 1.0 ? 'moderate' : 'elevated'} leverage.

For a ${financePurposeAnalysis.facilityType} of MYR ${recommendedAmount.toLocaleString()}, projected monthly servicing would represent ${((recommendedAmount * 0.08 / 12) / (prospect.estimatedTurnover / 12) * 100).toFixed(1)}% of monthly turnover. This is ${avgScore >= 65 ? 'within acceptable parameters' : 'on the higher end but manageable'} for ${prospect.companyName}'s business profile.`
    },
    riskAssessment: {
      keyRisks: generateKeyRisks(prospect, avgScore, loanToTurnoverRatio, industryType),
      mitigants: generateMitigants(prospect, avgScore, recommendation, recommendedAmount)
    },
    facilityStructure: {
      recommendedAmount,
      tenure: getTenure(prospect.financingPurpose, prospect.yearsOfOperation),
      collateral: getCollateralRequirements(recommendation, prospect.industry, recommendedAmount),
      guarantees: `Personal guarantee by ${prospect.directorName} as principal director${recommendation === 'approve-conditions' || recommendation === 'decline' ? ', supported by corporate guarantee where applicable' : ''}`
    },
    recommendation,
    confidenceScore,
    reasoning: `Comprehensive analysis of ${prospect.companyName} indicates a ${avgScore >= 70 ? 'favorable' : avgScore >= 55 ? 'moderate' : 'elevated'} risk profile. With ${prospect.yearsOfOperation} years of operation, turnover of MYR ${prospect.estimatedTurnover.toLocaleString()}, and DSCR of ${dscr.toFixed(2)}x, the company ${recommendation === 'approve' ? 'meets criteria for standard approval' : recommendation === 'approve-conditions' ? 'qualifies for conditional approval with enhanced monitoring' : 'requires significant risk mitigation or facility restructuring'}.`
  }
}

function getIndustryInsights(industryType: string, score: number) {
  const insights: Record<string, { marketCondition: string; sectorTrends: string; competitiveLandscape: string; revenueDrivers: string }> = {
    'Manufacturing': {
      marketCondition: 'continues to be a cornerstone of the Malaysian economy, supported by government initiatives and foreign investment',
      sectorTrends: 'Industry 4.0 adoption and automation are reshaping the competitive landscape, with companies investing in technology upgrades to maintain efficiency.',
      competitiveLandscape: 'Competition remains intense with both local players and multinational corporations vying for market share.',
      revenueDrivers: 'production output, client contracts, and supply chain partnerships with both domestic and export markets'
    },
    'Services': {
      marketCondition: 'demonstrates resilient growth supported by digital transformation and expanding service demands',
      sectorTrends: 'Digital service delivery and technology integration are becoming essential differentiators in the market.',
      competitiveLandscape: 'The service sector sees healthy competition with opportunities for specialized niche providers.',
      revenueDrivers: 'service contracts, recurring client relationships, and project-based engagements'
    },
    'Trading': {
      marketCondition: 'benefits from Malaysia\'s strategic position as a regional trading hub and ASEAN market access',
      sectorTrends: 'E-commerce integration and supply chain optimization are key focus areas for trading companies.',
      competitiveLandscape: 'Margins remain competitive with success driven by supplier relationships and logistics efficiency.',
      revenueDrivers: 'trading margins, inventory turnover, and strategic supplier and buyer relationships'
    },
    'Construction': {
      marketCondition: 'is experiencing renewed activity following infrastructure development initiatives and property market recovery',
      sectorTrends: 'Sustainable construction practices and government infrastructure projects are driving sector evolution.',
      competitiveLandscape: 'Project pipeline remains healthy with opportunities across commercial, residential, and infrastructure segments.',
      revenueDrivers: 'project contracts, milestone billings, and progressive claims on ongoing construction works'
    }
  }
  
  return insights[industryType] || {
    marketCondition: 'maintains steady activity within the local economy',
    sectorTrends: 'Companies in this sector are adapting to evolving market conditions and customer demands.',
    competitiveLandscape: 'The competitive environment requires continuous improvement and customer focus.',
    revenueDrivers: 'core business activities and established customer relationships'
  }
}

function getFinancePurposeAnalysis(purpose: string, amount: number) {
  const purposeLower = purpose.toLowerCase()
  
  if (purposeLower.includes('equipment') || purposeLower.includes('machinery')) {
    return {
      businessModelAlignment: 'The equipment financing request supports capacity expansion and operational efficiency improvements, enabling the company to meet growing demand and enhance productivity.',
      facilityType: 'term loan facility'
    }
  } else if (purposeLower.includes('working capital')) {
    return {
      businessModelAlignment: 'The working capital facility will optimize the company\'s cash conversion cycle, supporting inventory management and accounts receivable financing for smoother operations.',
      facilityType: 'working capital facility'
    }
  } else if (purposeLower.includes('expansion') || purposeLower.includes('growth')) {
    return {
      businessModelAlignment: 'The expansion financing supports strategic growth initiatives, enabling the company to capture market opportunities and strengthen its competitive position.',
      facilityType: 'growth capital facility'
    }
  } else if (purposeLower.includes('trade') || purposeLower.includes('import') || purposeLower.includes('export')) {
    return {
      businessModelAlignment: 'The trade financing facility will support import/export activities, enabling the company to fulfill larger orders and expand trading volumes.',
      facilityType: 'trade finance facility'
    }
  } else if (purposeLower.includes('project')) {
    return {
      businessModelAlignment: 'The project financing will support specific project execution, enabling timely delivery and milestone achievement.',
      facilityType: 'project finance facility'
    }
  }
  
  return {
    businessModelAlignment: 'The financing request aligns with the company\'s operational requirements and strategic objectives.',
    facilityType: 'business financing facility'
  }
}

function generateKeyRisks(prospect: { companyName: string; industry: string; yearsOfOperation: number; directorName: string; requestedLoanAmount: number }, score: number, ratio: number, industryType: string) {
  const risks = [
    `Customer concentration risk - ${prospect.yearsOfOperation >= 7 ? 'Revenue may be dependent on key customers' : 'Growing customer base may have concentration in few accounts'}`,
    `Economic sensitivity - ${industryType} sector performance correlated with broader economic cycles`,
    `Key person dependency - Critical reliance on ${prospect.directorName} for business direction, relationships, and decision-making`,
  ]
  
  if (ratio > 0.4) {
    risks.push(`Leverage exposure - Requested facility of MYR ${prospect.requestedLoanAmount.toLocaleString()} represents ${(ratio * 100).toFixed(1)}% of turnover`)
  }
  
  if (prospect.yearsOfOperation < 5) {
    risks.push(`Business maturity - ${prospect.yearsOfOperation} years of operation represents a relatively shorter track record`)
  }
  
  if (prospect.industry.includes('Trading') || prospect.industry.includes('Import') || prospect.industry.includes('Export')) {
    risks.push('Foreign exchange exposure - Material FX risk from import/export activities requiring active management')
  }
  
  if (score < 65) {
    risks.push(`Financial profile - Credit metrics indicate areas requiring improvement and monitoring`)
  }
  
  return risks.slice(0, 6)
}

function generateMitigants(prospect: { companyName: string; yearsOfOperation: number; estimatedTurnover: number; directorName: string; industry: string }, score: number, recommendation: string, amount: number) {
  const mitigants = [
    `Established operations - ${prospect.yearsOfOperation} years of continuous business operations demonstrating resilience`,
    `Revenue base - Annual turnover of MYR ${prospect.estimatedTurnover.toLocaleString()} provides foundation for debt servicing`,
    `Director commitment - Personal guarantee from ${prospect.directorName} aligns interests`,
  ]
  
  if (recommendation === 'approve') {
    mitigants.push('Strong financial metrics - DSCR and leverage ratios within acceptable parameters')
  }
  
  if (recommendation === 'approve-conditions') {
    mitigants.push(`Facility structuring - Recommended amount reduced to MYR ${amount.toLocaleString()} to manage exposure`)
    mitigants.push('Enhanced security - Additional collateral and guarantee requirements to mitigate risk')
  }
  
  if (prospect.industry.includes('Manufacturing')) {
    mitigants.push('Tangible asset base - Manufacturing equipment and inventory provide collateral support')
  }
  
  if (prospect.yearsOfOperation >= 5) {
    mitigants.push('Track record - Proven ability to navigate market cycles over extended period')
  }
  
  return mitigants.slice(0, 6)
}

function getTenure(purpose: string, years: number) {
  const purposeLower = purpose.toLowerCase()
  if (purposeLower.includes('equipment') || purposeLower.includes('machinery')) {
    return years >= 5 ? '5-7 years (aligned with asset useful life)' : '3-5 years'
  } else if (purposeLower.includes('working capital')) {
    return '1 year (revolving), renewable annually'
  } else if (purposeLower.includes('project')) {
    return '2-3 years (project-based)'
  } else if (purposeLower.includes('expansion')) {
    return '3-5 years'
  }
  return '3-5 years'
}

function getCollateralRequirements(recommendation: string, industry: string, amount: number) {
  const baseCollateral = 'Fixed charge over business assets'
  const additionalCollateral = industry.includes('Manufacturing') 
    ? ', charge over machinery and equipment' 
    : industry.includes('Trading') 
    ? ', assignment of receivables and inventory' 
    : ', assignment of receivables'
  
  if (recommendation === 'approve') {
    return baseCollateral + additionalCollateral
  } else if (recommendation === 'approve-conditions') {
    return `First charge over property (if available), ${baseCollateral.toLowerCase()}${additionalCollateral}, assignment of insurance`
  }
  return `First ranking charge over property, ${baseCollateral.toLowerCase()}${additionalCollateral}, cash margin deposit of ${Math.round(amount * 0.1).toLocaleString()}`
}

export async function POST(req: Request) {
  try {
    const { prospect, screeningResult, underwritingResult } = await req.json()

    // Generate dynamic narrative based on actual data
    const result = generateDynamicNarrative(prospect, screeningResult, underwritingResult)
    
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
    console.error('Narrative API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate narrative' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
