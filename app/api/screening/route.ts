import { streamText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const screeningResultSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall risk score from 0-100, higher is better'),
  confidenceScore: z.number().min(0).max(100).describe('AI confidence in the assessment'),
  recommendation: z.enum(['proceed', 'probe', 'drop']).describe('Recommendation action'),
  reasoning: z.string().describe('Brief explanation of the recommendation'),
  dimensions: z.object({
    companyLegitimacy: z.object({
      score: z.number().min(0).max(100),
      status: z.enum(['low', 'medium', 'high']),
      findings: z.array(z.string()).describe('3 key findings about company legitimacy')
    }),
    directorRisk: z.object({
      score: z.number().min(0).max(100),
      status: z.enum(['low', 'medium', 'high']),
      findings: z.array(z.string()).describe('3 key findings about director risk')
    }),
    industryRisk: z.object({
      score: z.number().min(0).max(100),
      status: z.enum(['low', 'medium', 'high']),
      findings: z.array(z.string()).describe('3 key findings about industry risk')
    }),
    creditSignals: z.object({
      score: z.number().min(0).max(100),
      status: z.enum(['low', 'medium', 'high']),
      findings: z.array(z.string()).describe('3 key findings about credit signals')
    }),
    businessViability: z.object({
      score: z.number().min(0).max(100),
      status: z.enum(['low', 'medium', 'high']),
      findings: z.array(z.string()).describe('3 key findings about business viability')
    }),
    operationalIndicators: z.object({
      score: z.number().min(0).max(100),
      status: z.enum(['low', 'medium', 'high']),
      findings: z.array(z.string()).describe('3 key findings about operational indicators')
    }),
    fraudSignals: z.object({
      score: z.number().min(0).max(100),
      status: z.enum(['low', 'medium', 'high']),
      findings: z.array(z.string()).describe('3 key findings about fraud signals')
    })
  }),
  checks: z.array(z.object({
    id: z.string(),
    dimension: z.string(),
    category: z.string(),
    check: z.string().describe('Name of the check performed'),
    dataSource: z.string().describe('Source of data for this check'),
    status: z.enum(['clear', 'probe', 'drop']),
    finding: z.string().describe('What was found'),
    confidence: z.number().min(0).max(100)
  })).describe('Array of 14-21 detailed screening checks across all dimensions')
})

export async function POST(req: Request) {
  try {
    const { prospect } = await req.json()

    const result = streamText({
      model: 'anthropic/claude-sonnet-4-20250514',
      output: Output.object({ schema: screeningResultSchema }),
      prompt: `You are an AI credit risk analyst for a Malaysian bank. Perform a rapid screening analysis for a SME loan application.

PROSPECT INFORMATION:
- Company Name: ${prospect.companyName}
- Business Registration Number: ${prospect.registrationNumber}
- Industry: ${prospect.industry}
- Years of Operation: ${prospect.yearsOfOperation} years
- Estimated Annual Turnover: MYR ${prospect.estimatedTurnover?.toLocaleString()}
- Requested Loan Amount: MYR ${prospect.requestedLoanAmount?.toLocaleString()}
- Financing Purpose: ${prospect.financingPurpose}
- Director/Owner: ${prospect.directorName}

SCREENING REQUIREMENTS:
Analyze this prospect across 7 dimensions and provide detailed screening results. Be realistic and consider:
1. Company legitimacy based on registration age and industry
2. Director risk profile
3. Industry-specific risks for ${prospect.industry}
4. Credit signals based on turnover vs loan amount ratio
5. Business viability given years of operation and turnover
6. Operational indicators
7. Fraud signals

SCORING GUIDELINES:
- Score 0-40: High risk (status: 'high', recommendation may be 'drop')
- Score 41-70: Medium risk (status: 'medium', recommendation may be 'probe')  
- Score 71-100: Low risk (status: 'low', recommendation may be 'proceed')

The loan-to-turnover ratio is ${((prospect.requestedLoanAmount / prospect.estimatedTurnover) * 100).toFixed(1)}%. Consider this in your assessment.

Generate realistic findings specific to this company and industry. Each dimension should have exactly 3 findings.
Generate 14-21 detailed checks spread across the 7 categories (companyLegitimacy, directorRisk, industryRisk, creditSignals, businessViability, operationalIndicators, fraudSignals).

Return a comprehensive screening result with realistic scores and findings based on the provided data.`,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Screening API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to run screening' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
