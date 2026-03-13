'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, User, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboardStore } from '@/lib/store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  'What are the key risks for this borrower?',
  'How does the DSCR compare to industry benchmarks?',
  'What additional documents should I request?',
  'Summarize the financial health of this company',
  'What are the main concerns from the screening?',
]

const mockResponses: Record<string, string> = {
  'What are the key risks for this borrower?': 
    'Based on my analysis, the key risks for Precision Manufacturing Sdn Bhd are:\n\n1. **Customer Concentration**: Top 3 customers account for 60% of revenue, creating dependency risk.\n\n2. **Raw Material Price Volatility**: Steel and aluminum prices are subject to global market fluctuations.\n\n3. **Currency Exposure**: ~30% of raw materials are imported, exposing the company to MYR/USD exchange rate risk.\n\n4. **Key Man Risk**: Operations depend significantly on the founder/MD.\n\nHowever, the company has mitigants in place including diversification plans, pricing adjustment clauses, and a newly hired Deputy GM for succession planning.',
  
  'How does the DSCR compare to industry benchmarks?':
    'The company\'s Debt Service Coverage Ratio (DSCR) of **1.45x** is favorable:\n\n- **Bank minimum threshold**: 1.2x ✓\n- **Industry average (Manufacturing)**: 1.3x\n- **This company**: 1.45x (Above average)\n\nThe DSCR has improved from 1.25x in FY2022 to 1.45x in FY2024, indicating strengthening repayment capacity. This provides a comfortable buffer of 21% above the minimum threshold.',
  
  'What additional documents should I request?':
    'For a complete assessment, I recommend requesting:\n\n1. **Aging reports** for both receivables and payables to assess working capital quality\n\n2. **Top 5 customer contracts** to verify contract terms and concentration risk\n\n3. **Tax returns (Form C)** for the last 3 years to verify reported income\n\n4. **Utility bills** to verify operational presence at declared premises\n\n5. **Equipment listing and valuation** if equipment is to be used as additional collateral\n\nCurrently uploaded documents appear sufficient for basic underwriting.',
  
  'Summarize the financial health of this company':
    'Precision Manufacturing Sdn Bhd shows **solid financial health** with an improving trajectory:\n\n**Strengths:**\n- Revenue CAGR of 12% over 5 years (RM6.2M → RM9.1M)\n- Improving margins (NPM: 8.2% → 10.8%)\n- Reducing leverage (D/E: 1.8x → 1.2x)\n- Adequate liquidity (Current Ratio: 1.8x)\n- Clean repayment history\n\n**Areas to Monitor:**\n- Cash conversion cycle of 85 days (slightly extended)\n- Customer concentration at 60%\n- Existing banking exposure of RM2.5M\n\n**Overall Assessment:** The company is credit-viable with adequate capacity to service the proposed RM2.5M facility.',
  
  'What are the main concerns from the screening?':
    'The rapid screening identified the following areas requiring attention:\n\n**Moderate Concerns (Probe Further):**\n1. **Existing Banking Exposure**: RM2.5M in existing facilities - moderate leverage\n2. **Customer Concentration**: 60% revenue from top 3 customers\n\n**All Clear:**\n- Company legitimacy verified (Active since 2018)\n- Director has clean records (no bankruptcy, litigation, or AML flags)\n- Industry within risk appetite\n- CTOS score of 720 (Good)\n- Business operations verified\n\nThe AI recommends proceeding to underwriting as the identified concerns are manageable with appropriate structuring.',
}

export function AiCopilot() {
  const { aiCopilotOpen, toggleAiCopilot, caseData } = useDashboardStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI Copilot for the ${caseData?.prospect.companyName || 'current'} case. I can help you understand the analysis, answer questions about the borrower, or explain any findings. How can I assist you?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const responseContent = mockResponses[input] || 
      `Based on my analysis of ${caseData?.prospect.companyName || 'the company'}, I can provide insights on financial health, risk factors, and recommendations. Could you please be more specific about what aspect you'd like me to elaborate on?`

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  if (!aiCopilotOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50 bg-background border-l border-border shadow-lg flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Copilot</h3>
            <p className="text-xs text-muted-foreground">Ask me anything about this case</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleAiCopilot}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  message.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Sparkles className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  message.role === 'assistant'
                    ? 'bg-muted/50 text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-[10px] mt-1 opacity-60">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg px-3 py-2 bg-muted/50">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      <div className="px-4 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
        <div className="flex flex-wrap gap-1">
          {suggestedQuestions.slice(0, 3).map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedQuestion(question)}
              className="text-[11px] px-2 py-1 rounded-md bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              {question.length > 35 ? question.slice(0, 35) + '...' : question}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this case..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
