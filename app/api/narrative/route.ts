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

export async function POST(req: Request) {
  try {
    const { prospect, screeningResult, underwritingResult } = await req.json()

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
  } catch (error) {
    console.error('Narrative API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate narrative' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
