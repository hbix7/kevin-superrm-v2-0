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

// Generate a context-aware response based on user query and case context
function generateResponse(userMessage: string, caseContext?: CaseContext): string {
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

  if (lowerMsg.includes('industry') || lowerMsg.includes('sector') || lowerMsg.includes('market')) {
    const industryType = industry.split(' - ')[0] || industry
    return `## Industry Analysis: ${industry}

**Sector Overview:**
The ${industryType} sector in Malaysia represents a significant component of the economy with diverse players ranging from SMEs to large corporations.

**Key Characteristics:**
- Typical gross margins: 20-35%
- Working capital intensity: ${industry.includes('Trading') ? 'High' : industry.includes('Manufacturing') ? 'Moderate-High' : 'Moderate'}
- Regulatory environment: Stable with standard compliance requirements
- Growth outlook: ${yearsOfOperation >= 5 ? 'Steady with established players maintaining market share' : 'Competitive with opportunities for growth'}

**Risk Factors for ${industryType}:**
1. Economic cycle sensitivity
2. ${industry.includes('Trading') ? 'Foreign exchange exposure' : 'Raw material price fluctuations'}
3. Competition from regional players
4. ${industry.includes('Manufacturing') ? 'Technology disruption risks' : 'Supply chain dependencies'}

**Benchmarks for ${companyName}:**
- Turnover of MYR ${estimatedTurnover.toLocaleString()} indicates ${estimatedTurnover > 10000000 ? 'mid-sized player' : 'SME category'}
- ${yearsOfOperation} years suggests ${yearsOfOperation >= 5 ? 'established market presence' : 'developing business'}

Would you like more specific benchmarks or competitor analysis?`
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

interface MessagePart {
  type: string
  text?: string
}

interface Message {
  role: string
  parts?: MessagePart[]
}

export async function POST(req: Request) {
  try {
    const { messages, caseContext }: { messages: Message[]; caseContext?: CaseContext } = await req.json()
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    const userText = lastUserMessage?.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('') || ''
    
    const response = generateResponse(userText, caseContext)
    
    // Simulate processing time for realistic UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return as SSE stream format for consistency with useChat
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', delta: response })}\n\n`))
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
    console.error('Copilot API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
