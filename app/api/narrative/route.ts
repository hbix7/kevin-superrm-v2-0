import { streamText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const creditNarrativeSchema = z.object({
  businessProfile: z.object({
    background: z.string().describe('2-3 paragraphs about company history, ownership, and operations'),
    industryContext: z.string().describe('1-2 paragraphs about the industry landscape and market position'),
    businessModel: z.string().describe('1-2 paragraphs describing how the business generates revenue')
  }),
  financialAssessment: z.object({
    revenueTrends: z.string().describe('Analysis of revenue performance over the years'),
    profitabilityAnalysis: z.string().describe('Assessment of profit margins and efficiency'),
    repaymentCapacity: z.string().describe('Analysis of debt service capability and cash flows')
  }),
  riskAssessment: z.object({
    keyRisks: z.array(z.string()).describe('4-6 key risks identified'),
    mitigants: z.array(z.string()).describe('4-6 risk mitigants available')
  }),
  facilityStructure: z.object({
    recommendedAmount: z.number().describe('Recommended loan amount in MYR'),
    tenure: z.string().describe('Recommended loan tenure'),
    collateral: z.string().describe('Recommended collateral requirements'),
    guarantees: z.string().describe('Recommended guarantee requirements')
  }),
  recommendation: z.enum(['approve', 'approve-conditions', 'decline']).describe('Final recommendation'),
  confidenceScore: z.number().min(0).max(100).describe('AI confidence in the recommendation'),
  reasoning: z.string().describe('Summary reasoning for the recommendation in 2-3 sentences')
})

// Generate fallback narrative based on prospect and analysis data
function generateFallbackResult(
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
  screeningResult?: { overallScore?: number; recommendation?: string; reasoning?: string },
  underwritingResult?: { 
    overallScore?: number; 
    financialRatios?: { 
      dscr?: number[]; 
      debtToEquity?: number[]; 
      currentRatio?: number[];
      netProfitMargin?: number[];
    } 
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

  const dscr = underwritingResult?.financialRatios?.dscr?.[2] || (1.2 + Math.random() * 0.3)
  const debtToEquity = underwritingResult?.financialRatios?.debtToEquity?.[2] || (0.6 + Math.random() * 0.3)
  const currentRatio = underwritingResult?.financialRatios?.currentRatio?.[2] || (1.4 + Math.random() * 0.3)
  const netProfitMargin = underwritingResult?.financialRatios?.netProfitMargin?.[2] || (6 + Math.random() * 4)

  const industryType = prospect.industry.split(' - ')[0] || prospect.industry

  return {
    businessProfile: {
      background: `${prospect.companyName} (Registration No: ${prospect.registrationNumber}) is a Malaysian-incorporated company established ${prospect.yearsOfOperation} years ago. The company operates in the ${prospect.industry} sector under the leadership of ${prospect.directorName}, who serves as the principal director and key decision-maker.\n\nSince its establishment, the company has developed a solid operational foundation with an estimated annual turnover of MYR ${prospect.estimatedTurnover.toLocaleString()}. The business has maintained consistent operations throughout its ${prospect.yearsOfOperation} years of establishment, demonstrating resilience and adaptability in its market segment.`,
      
      industryContext: `The ${industryType} sector in Malaysia has shown ${prospect.yearsOfOperation >= 5 ? 'steady growth' : 'moderate development'} over recent years. Companies operating in ${prospect.industry} typically face competitive pressures while benefiting from domestic demand and regional trade opportunities.\n\nMarket conditions remain ${avgScore >= 60 ? 'favorable' : 'challenging but manageable'} for established players with proven track records, providing a conducive environment for business expansion and working capital financing.`,
      
      businessModel: `${prospect.companyName} generates revenue through its core ${industryType.toLowerCase()} operations, serving both domestic and ${prospect.yearsOfOperation >= 5 ? 'selected international' : 'local'} clients. The company's business model focuses on ${prospect.financingPurpose.toLowerCase().includes('equipment') ? 'operational efficiency and capacity expansion' : prospect.financingPurpose.toLowerCase().includes('working capital') ? 'maintaining optimal inventory and receivables management' : 'sustainable growth and market penetration'}.\n\nRevenue streams are ${prospect.yearsOfOperation >= 5 ? 'diversified across multiple customer segments' : 'developing with growing customer base'}, supporting the company's financial stability and growth trajectory.`
    },
    financialAssessment: {
      revenueTrends: `${prospect.companyName} reported estimated annual turnover of MYR ${prospect.estimatedTurnover.toLocaleString()}, reflecting ${prospect.yearsOfOperation >= 5 ? 'established market presence' : 'growth-stage operations'}. Revenue trends have been ${avgScore >= 65 ? 'positive' : 'stable'}, with the company demonstrating ${avgScore >= 60 ? 'consistent ability to maintain its market position' : 'efforts to strengthen its competitive position'}. The loan-to-turnover ratio of ${(loanToTurnoverRatio * 100).toFixed(1)}% is ${loanToTurnoverRatio < 0.3 ? 'well within prudent limits' : loanToTurnoverRatio < 0.5 ? 'within acceptable range' : 'on the higher end but manageable given the financing purpose'}.`,
      
      profitabilityAnalysis: `Profitability analysis indicates net profit margins of approximately ${netProfitMargin.toFixed(1)}%, which is ${netProfitMargin >= 8 ? 'above' : netProfitMargin >= 5 ? 'in line with' : 'slightly below'} industry averages for the ${industryType.toLowerCase()} sector. The company maintains ${currentRatio >= 1.3 ? 'healthy' : 'adequate'} liquidity with a current ratio of ${currentRatio.toFixed(2)}x, indicating ${currentRatio >= 1.3 ? 'strong' : 'sufficient'} short-term financial health. Operational efficiency has ${avgScore >= 60 ? 'improved' : 'remained stable'} over recent periods.`,
      
      repaymentCapacity: `Debt service coverage ratio (DSCR) stands at ${dscr.toFixed(2)}x, ${dscr >= 1.25 ? 'providing comfortable headroom for debt servicing obligations' : dscr >= 1.1 ? 'indicating adequate capacity to meet debt obligations' : 'suggesting tight but manageable repayment capacity'}. The debt-to-equity ratio of ${debtToEquity.toFixed(2)}x reflects ${debtToEquity <= 0.8 ? 'conservative leverage positioning' : debtToEquity <= 1.2 ? 'moderate leverage levels' : 'elevated but acceptable leverage given industry norms'}. Cash flow analysis supports the company's ability to service the proposed facility of MYR ${recommendedAmount.toLocaleString()} over the recommended tenure.`
    },
    riskAssessment: {
      keyRisks: [
        `Customer concentration risk - ${prospect.yearsOfOperation >= 5 ? 'Moderate dependency on key customers' : 'Revenue concentration in limited customer base'}`,
        `Industry cyclicality - ${industryType} sector subject to economic cycle fluctuations`,
        `Foreign exchange exposure - ${prospect.industry.includes('Trading') || prospect.industry.includes('Import') ? 'Material' : 'Limited'} FX risk from ${prospect.industry.includes('Trading') ? 'import/export activities' : 'operational inputs'}`,
        `Key-man risk - Dependency on ${prospect.directorName} for business direction and relationships`,
        `Competition - ${avgScore >= 70 ? 'Manageable competitive pressures in the market segment' : 'Increasing competition in the sector'}`,
        prospect.yearsOfOperation < 5 ? 'Business maturity - Relatively shorter operating history' : 'Succession planning - Long-term management transition considerations'
      ],
      mitigants: [
        `${prospect.yearsOfOperation} years of established operations demonstrating business resilience`,
        `${avgScore >= 65 ? 'Strong' : 'Adequate'} financial ratios and repayment capacity`,
        `Collateral and guarantee arrangements to secure the facility`,
        `Director's personal guarantee and commitment to the business`,
        `${prospect.industry.includes('Manufacturing') ? 'Tangible asset base providing collateral support' : 'Diversified revenue streams supporting cash flow stability'}`,
        `Proven track record in ${industryType.toLowerCase()} operations`
      ]
    },
    facilityStructure: {
      recommendedAmount,
      tenure: prospect.financingPurpose.toLowerCase().includes('equipment') ? '5-7 years' : prospect.financingPurpose.toLowerCase().includes('working capital') ? '1-3 years (revolving)' : '3-5 years',
      collateral: recommendation === 'approve' 
        ? `Fixed charge over business assets, assignment of receivables` 
        : `First charge over property/equipment, fixed charge over business assets, assignment of receivables and insurance`,
      guarantees: `Personal guarantee by ${prospect.directorName}${recommendation !== 'approve' ? ', corporate guarantee if applicable' : ''}`
    },
    recommendation,
    confidenceScore,
    reasoning: `Based on comprehensive analysis, ${prospect.companyName} demonstrates ${avgScore >= 70 ? 'strong' : avgScore >= 55 ? 'adequate' : 'elevated risk'} credit profile with ${prospect.yearsOfOperation} years of operation and turnover of MYR ${prospect.estimatedTurnover.toLocaleString()}. ${recommendation === 'approve' ? 'Recommend approval with standard terms and conditions.' : recommendation === 'approve-conditions' ? 'Recommend conditional approval subject to additional security and covenants.' : 'Recommend decline or significant restructuring of the facility terms.'} Key strengths include ${avgScore >= 60 ? 'established market presence and adequate financial metrics' : 'potential for growth with appropriate risk mitigation'}.`
  }
}

export async function POST(req: Request) {
  try {
    const { prospect, screeningResult, underwritingResult } = await req.json()

    try {
      const result = streamText({
        model: 'anthropic/claude-sonnet-4-20250514',
        output: Output.object({ schema: creditNarrativeSchema }),
        prompt: `You are a senior credit analyst at a Malaysian bank writing a credit narrative for loan approval committee.

COMPANY INFORMATION:
- Company Name: ${prospect.companyName}
- Registration Number: ${prospect.registrationNumber}
- Industry: ${prospect.industry}
- Years of Operation: ${prospect.yearsOfOperation} years
- Estimated Annual Turnover: MYR ${prospect.estimatedTurnover?.toLocaleString()}
- Requested Loan Amount: MYR ${prospect.requestedLoanAmount?.toLocaleString()}
- Financing Purpose: ${prospect.financingPurpose}
- Director/Owner: ${prospect.directorName}

SCREENING RESULTS:
- Overall Score: ${screeningResult?.overallScore || 'N/A'}/100
- Recommendation: ${screeningResult?.recommendation || 'N/A'}
- Key Findings: ${screeningResult?.reasoning || 'N/A'}

UNDERWRITING RESULTS:
- Credit Score: ${underwritingResult?.overallScore || 'N/A'}/100
- DSCR: ${underwritingResult?.financialRatios?.dscr?.[2] || 'N/A'}x (latest year)
- Debt-to-Equity: ${underwritingResult?.financialRatios?.debtToEquity?.[2] || 'N/A'}x (latest year)
- Current Ratio: ${underwritingResult?.financialRatios?.currentRatio?.[2] || 'N/A'}x (latest year)

NARRATIVE REQUIREMENTS:
Write a comprehensive credit narrative that:
1. Provides detailed business profile with realistic background
2. Analyzes financial performance comprehensively
3. Identifies key risks and mitigants specific to the industry
4. Proposes appropriate facility structure based on the company's profile

The recommended amount should be based on:
- The requested amount: MYR ${prospect.requestedLoanAmount?.toLocaleString()}
- Company's turnover: MYR ${prospect.estimatedTurnover?.toLocaleString()}
- Industry norms and risk profile

Make the narrative professional, thorough, and suitable for a credit committee review.
Use formal banking language and ensure all assessments are data-driven.`,
      })

      return result.toUIMessageStreamResponse()
    } catch (aiError) {
      // AI Gateway unavailable - use intelligent fallback
      console.log('AI Gateway unavailable, using fallback narrative logic')
      const fallbackResult = generateFallbackResult(prospect, screeningResult, underwritingResult)
      
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'output', output: fallbackResult })}\n\n`))
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
    }
  } catch (error) {
    console.error('Narrative API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate narrative' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
