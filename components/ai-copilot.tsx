'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { X, Send, Sparkles, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboardStore } from '@/lib/store'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

const suggestedQuestions = [
  'What are the key risks for this borrower?',
  'How does the financial health look?',
  'What additional documents should I request?',
  'Summarize the company profile',
  'What are the main concerns from screening?',
]

export function AiCopilot() {
  const { aiCopilotOpen, toggleAiCopilot, caseData } = useDashboardStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Build case context for the AI
  const caseContext = useMemo(() => {
    if (!caseData) return undefined
    return {
      companyName: caseData.prospect.companyName,
      industry: caseData.prospect.industry,
      loanAmount: caseData.prospect.requestedLoanAmount,
      stage: caseData.currentStage,
      registrationNumber: caseData.prospect.registrationNumber,
      yearsOfOperation: caseData.prospect.yearsOfOperation,
      estimatedTurnover: caseData.prospect.estimatedTurnover,
      financingPurpose: caseData.prospect.financingPurpose,
      directorName: caseData.prospect.directorName,
      riskScore: caseData.overallRiskScore,
    }
  }, [caseData])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/copilot',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          messages,
          caseContext,
        },
      }),
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Reset messages when case changes
  useEffect(() => {
    setMessages([])
  }, [caseData?.id, setMessages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const message = input
    setInput('')
    sendMessage({ text: message })
  }

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return
    setInput('')
    sendMessage({ text: question })
  }

  // Helper to extract text from message parts
  const getMessageText = (message: typeof messages[0]) => {
    if (!message.parts || !Array.isArray(message.parts)) return ''
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
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
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg px-3 py-2 max-w-[80%] bg-muted/50 text-foreground">
                <p className="text-sm whitespace-pre-line">
                  Hello! I&apos;m your AI Copilot for the {caseData?.prospect.companyName || 'current'} case. I can help you understand the analysis, answer questions about the borrower, or explain any findings. How can I assist you?
                </p>
              </div>
            </div>
          )}

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
                <p className="text-sm whitespace-pre-line">{getMessageText(message)}</p>
              </div>
            </div>
          ))}

          {isLoading && (
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
              disabled={isLoading}
              className="text-[11px] px-2 py-1 rounded-md bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {question.length > 35 ? question.slice(0, 35) + '...' : question}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this case..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
