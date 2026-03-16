import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

// AI Copilot API route for credit analysis assistant
export const maxDuration = 30

interface CaseContext {
  companyName: string
  industry: string
  loanAmount: number
  stage: string
  registrationNumber: string
  yearsOfOperation: number
  estimatedTurnover: number
  financingPurpose: string
  directorName: string
  riskScore?: number | null
}

// Generate a context-aware response when AI Gateway is unavailable
function generateFallbackResponse(userMessage: string, caseContext?: CaseContext): string {
  const lowerMsg = userMessage.toLowerCase()
  
  if (!caseContext) {
    return "I'm your AI Credit Analyst Copilot. To provide specific insights, please open a case first. I can help you analyze:\n\n- **Risk factors** for loan applications\n- **Financial metrics** and industry benchmarks\n- **Document requirements** for credit assessment\n- **Industry insights** for various sectors\n\nHow can I assist you today?"
  }

  const { companyName, industry, loanAmount, yearsOfOperation, estimatedTurnover, financingPurpose, directorName, riskScore, stage } = caseContext
  const loanToTurnover = ((loanAmount / estimatedTurnover) * 100).toFixed(1)

  if (lowerMsg.includes('risk') || lowerMsg.includes('concern')) {
    return `## Key Risks for ${companyName}

Based on the case profile, here are the key risks to consider:

**1. Credit Risk Factors:**
- Loan-to-turnover ratio of ${loanToTurnover}% ${parseFloat(loanToTurnover) > 50 ? 'is on the higher side' : 'is within acceptable range'}
- ${yearsOfOperation < 5 ? 'Relatively shorter operating history (' + yearsOfOperation + ' years)' : 'Established operating history of ' + yearsOfOperation + ' years'}

**2. Industry Risks (${industry}):**
- Economic cycle sensitivity typical for this sector
- Competitive pressures affecting margins
- Regulatory compliance requirements

**3. Key-Person Risk:**
- Business dependent on ${directorName}'s expertise and relationships

**Mitigating Factors:**
- ${yearsOfOperation >= 5 ? 'Proven track record over ' + yearsOfOperation + ' years' : 'Director experience in the industry'}
- Turnover of MYR ${estimatedTurnover.toLocaleString()} demonstrates market presence
- ${financingPurpose} aligns with business growth objectives

Would you like me to elaborate on any specific risk area?`
  }

  if (lowerMsg.includes('document') || lowerMsg.includes('what') && lowerMsg.includes('need')) {
    return `## Recommended Documents for ${companyName}

For a comprehensive credit assessment of this ${industry} company, I recommend requesting:

**Financial Documents:**
- 3 years audited financial statements
- Latest management accounts (within 3 months)
- Bank statements for last 12 months
- Accounts receivable and payable aging

**Business Documents:**
- Company registration documents (SSM)
- Business profile and organization structure
- Key contracts with major customers/suppliers
- ${financingPurpose.toLowerCase().includes('equipment') ? 'Quotations for equipment purchase' : 'Working capital requirement breakdown'}

**Director Documents:**
- ${directorName}'s IC copy and CV
- Personal net worth statement
- CCRIS consent and personal guarantee

**Additional (if applicable):**
- Property valuation reports (for collateral)
- Insurance policies
- Business permits and licenses

Should I explain why any specific document is needed?`
  }

  if (lowerMsg.includes('ratio') || lowerMsg.includes('financial') || lowerMsg.includes('metric')) {
    return `## Financial Metrics Overview for ${companyName}

**Key Ratios to Monitor:**

| Metric | Industry Benchmark | Significance |
|--------|-------------------|--------------|
| DSCR | >1.25x | Debt servicing capacity |
| Current Ratio | >1.2x | Short-term liquidity |
| Debt-to-Equity | <1.0x | Leverage position |
| Gross Margin | >20% (${industry}) | Operational efficiency |

**For ${companyName}:**
- Annual turnover: MYR ${estimatedTurnover.toLocaleString()}
- Requested facility: MYR ${loanAmount.toLocaleString()}
- Loan-to-turnover: ${loanToTurnover}%

${riskScore ? `- Current risk score: ${riskScore}/100` : ''}

**Industry Context (${industry}):**
Typical margins in this sector range from 15-30% gross and 5-12% net. Working capital cycles vary based on customer payment terms and inventory requirements.

Want me to explain any specific ratio in more detail?`
  }

  if (lowerMsg.includes('recommend') || lowerMsg.includes('decision') || lowerMsg.includes('approve')) {
    const recommendation = riskScore && riskScore >= 70 ? 'favorable' : riskScore && riskScore >= 50 ? 'conditional' : 'requires additional review'
    return `## Credit Assessment Summary for ${companyName}

**Current Stage:** ${stage}
${riskScore ? `**Risk Score:** ${riskScore}/100` : ''}

**Assessment:** The case appears ${recommendation}.

**Supporting Factors:**
- ${yearsOfOperation} years of operations
- Turnover of MYR ${estimatedTurnover.toLocaleString()}
- Purpose: ${financingPurpose}

**Considerations:**
- Ensure adequate collateral coverage
- Verify director's track record
- Confirm no adverse credit history

**Next Steps:**
${stage === 'screening' ? '1. Complete AI screening analysis\n2. Review all check results\n3. Proceed to underwriting if screening passes' : 
  stage === 'underwriting' ? '1. Review financial analysis results\n2. Validate ratio assumptions\n3. Generate credit narrative' :
  '1. Review and refine narrative\n2. Submit for credit committee approval'}

Need me to elaborate on any aspect?`
  }

  // Default helpful response
  return `## How Can I Help with ${companyName}?

I'm analyzing this ${industry} company's loan application. Here's what I can help with:

**Quick Overview:**
- Company: ${companyName}
- Loan Request: MYR ${loanAmount.toLocaleString()} for ${financingPurpose}
- Turnover: MYR ${estimatedTurnover.toLocaleString()}
- Operating: ${yearsOfOperation} years
${riskScore ? `- Risk Score: ${riskScore}/100` : ''}

**I can assist with:**
1. **Risk Analysis** - "What are the key risks?"
2. **Document Checklist** - "What documents do we need?"
3. **Financial Metrics** - "Explain the financial ratios"
4. **Credit Decision** - "What's your recommendation?"
5. **Industry Insights** - "Tell me about ${industry} sector"

What would you like to know?`
}

export async function POST(req: Request) {
  const { messages, caseContext }: { messages: UIMessage[]; caseContext?: CaseContext } = await req.json()

  const systemPrompt = `You are an AI Credit Analyst Copilot for a bank's SME lending platform. You help Relationship Managers (RMs) analyze loan applications, understand risks, and make informed credit decisions.

${caseContext ? `
## Current Case Context
- **Company**: ${caseContext.companyName}
- **Registration Number**: ${caseContext.registrationNumber}
- **Industry**: ${caseContext.industry}
- **Years of Operation**: ${caseContext.yearsOfOperation}
- **Estimated Annual Turnover**: MYR ${caseContext.estimatedTurnover?.toLocaleString() || 'N/A'}
- **Requested Loan Amount**: MYR ${caseContext.loanAmount?.toLocaleString() || 'N/A'}
- **Financing Purpose**: ${caseContext.financingPurpose}
- **Director/Key Person**: ${caseContext.directorName}
- **Current Stage**: ${caseContext.stage}
${caseContext.riskScore ? `- **Risk Score**: ${caseContext.riskScore}/100` : ''}
` : ''}

## Your Capabilities
1. **Risk Analysis**: Identify and explain key risks for borrowers including customer concentration, market risks, operational risks, and financial risks.
2. **Financial Metrics**: Explain and contextualize financial ratios like DSCR, current ratio, debt-to-equity, and compare them to industry benchmarks.
3. **Document Guidance**: Recommend additional documents that should be requested for a complete credit assessment.
4. **Industry Insights**: Provide relevant industry context and benchmarks for the specific sector.
5. **Credit Recommendations**: Offer structured analysis to support credit decisions.

## Response Guidelines
- Be concise but thorough
- Use bullet points and formatting for clarity
- Always relate insights back to the specific case when context is available
- Highlight both risks and mitigating factors
- Use Malaysian Ringgit (MYR) for currency references
- Reference industry standards and banking best practices
- If asked about something not related to credit analysis, politely redirect to relevant topics`

  try {
    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      consumeSseStream: consumeStream,
    })
  } catch (aiError) {
    // AI Gateway unavailable - use intelligent fallback
    console.log('AI Gateway unavailable, using fallback copilot response')
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    const userText = lastUserMessage?.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('') || ''
    
    const fallbackResponse = generateFallbackResponse(userText, caseContext)
    
    // Return as SSE stream format for consistency with useChat
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', delta: fallbackResponse })}\n\n`))
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
}
