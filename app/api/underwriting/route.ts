import { streamText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const underwritingResultSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall credit score from 0-100'),
  confidenceScore: z.number().min(0).max(100).describe('AI confidence in the assessment'),
  recommendation: z.enum(['approve', 'approve-conditions', 'probe', 'decline']).describe('Recommendation action'),
  financialRatios: z.object({
    grossProfitMargin: z.array(z.number()).length(3).describe('Gross profit margin % for 3 years'),
    netProfitMargin: z.array(z.number()).length(3).describe('Net profit margin % for 3 years'),
    debtToEquity: z.array(z.number()).length(3).describe('Debt-to-equity ratio for 3 years'),
    currentRatio: z.array(z.number()).length(3).describe('Current ratio for 3 years'),
    dscr: z.array(z.number()).length(3).describe('Debt service coverage ratio for 3 years'),
    debtToEbitda: z.array(z.number()).length(3).describe('Debt-to-EBITDA ratio for 3 years'),
    years: z.array(z.string()).length(3).describe('Year labels for the ratios')
  }),
  categories: z.array(z.object({
    name: z.string().describe('Category name'),
    status: z.enum(['low', 'medium', 'high']).describe('Risk level'),
    score: z.number().min(0).max(100),
    explanation: z.string().describe('Brief explanation of the category assessment'),
    checks: z.array(z.object({
      name: z.string(),
      status: z.enum(['clear', 'probe', 'drop']),
      value: z.string().describe('The actual value found'),
      benchmark: z.string().describe('Industry benchmark')
    })).describe('2-4 specific checks within this category')
  })).length(6).describe('6 risk categories: Financial Strength, Cashflow & Repayment Capacity, Borrower Behaviour, Debt Burden & Exposure, Revenue Quality, Operational Viability'),
  revenueData: z.array(z.object({
    year: z.string(),
    revenue: z.number().describe('Annual revenue in MYR'),
    profit: z.number().describe('Net profit in MYR')
  })).length(5).describe('5 years of revenue and profit data'),
  debtData: z.array(z.object({
    year: z.string(),
    debt: z.number().describe('Total debt in MYR'),
    equity: z.number().describe('Total equity in MYR')
  })).length(5).describe('5 years of debt and equity data')
})

export async function POST(req: Request) {
  try {
    const { prospect, screeningResult } = await req.json()

    const currentYear = new Date().getFullYear()
    const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map(String)
    const ratioYears = years.slice(2) // Last 3 years for ratios

    const result = streamText({
      model: 'anthropic/claude-sonnet-4-20250514',
      output: Output.object({ schema: underwritingResultSchema }),
      prompt: `You are an AI credit underwriter for a Malaysian bank. Perform a detailed financial analysis for a SME loan application.

PROSPECT INFORMATION:
- Company Name: ${prospect.companyName}
- Industry: ${prospect.industry}
- Years of Operation: ${prospect.yearsOfOperation} years
- Estimated Annual Turnover: MYR ${prospect.estimatedTurnover?.toLocaleString()}
- Requested Loan Amount: MYR ${prospect.requestedLoanAmount?.toLocaleString()}
- Financing Purpose: ${prospect.financingPurpose}
- Director/Owner: ${prospect.directorName}

SCREENING RESULTS:
- Overall Screening Score: ${screeningResult?.overallScore || 'N/A'}
- Screening Recommendation: ${screeningResult?.recommendation || 'N/A'}

ANALYSIS REQUIREMENTS:
Generate realistic financial analysis data for this company. Consider:
1. The company's industry (${prospect.industry}) and typical margins
2. Years of operation (${prospect.yearsOfOperation}) for growth trajectory
3. Turnover of MYR ${prospect.estimatedTurnover?.toLocaleString()} as baseline
4. Loan amount of MYR ${prospect.requestedLoanAmount?.toLocaleString()} for debt calculations

Use these years for data: ${years.join(', ')}
Use these years for ratios: ${ratioYears.join(', ')}

Generate:
1. Realistic financial ratios showing gradual improvement over 3 years
2. 6 risk categories with detailed checks
3. 5 years of revenue/profit data showing realistic growth pattern
4. 5 years of debt/equity data showing leverage position

Categories should be:
1. Financial Strength - profitability and balance sheet strength
2. Cashflow & Repayment Capacity - DSCR, operating cash flow
3. Borrower Behaviour - payment history, credit track record
4. Debt Burden & Exposure - leverage, existing facilities
5. Revenue Quality - revenue concentration, customer base
6. Operational Viability - management, business model

Base revenue around the estimated turnover with realistic year-over-year growth.
Make the data internally consistent and realistic for a Malaysian SME in the ${prospect.industry} sector.`,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Underwriting API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to run underwriting' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
