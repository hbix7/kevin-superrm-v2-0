'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessageComponent } from './chat-message'
import { ChatInput } from './chat-input'
import { ChatSidebar } from './chat-sidebar'
import { ChatContextPanel } from './chat-context-panel'
import { useChatStore } from '@/lib/chat/store'
import { useDashboardStore } from '@/lib/store'
import { ConversationEngine } from '@/lib/chat/conversation-engine'
import type { ChatMessage, QuickAction, JourneyStage } from '@/lib/chat/types'
import type { ScreeningResult } from '@/lib/types'

export function ChatInterface() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contextPanelOpen, setContextPanelOpen] = useState(true)
  const [engine] = useState(() => new ConversationEngine())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const { 
    activeSessionId,
    createSession,
    getActiveSession,
    addMessage,
    updateLastAssistantMessage,
    setStage,
    updateCollectedData,
    linkCaseToSession,
  } = useChatStore()
  
  const {
    cases,
    caseData,
    loadCase,
    initializeNewCase,
    runScreening,
    runUnderwriting,
    generateNarrative,
    submitToCredit,
  } = useDashboardStore()
  
  const session = getActiveSession()
  const messages = session?.messages || []
  const currentStage = session?.currentStage || 'welcome'
  
  // Initialize session and welcome message on mount
  useEffect(() => {
    if (!activeSessionId) {
      const sessionId = createSession()
      // Add welcome message after a short delay
      setTimeout(() => {
        const welcome = engine.getWelcomeMessage()
        addMessage({
          role: 'assistant',
          content: welcome.message,
          actions: welcome.actions,
          stage: welcome.nextStage,
        })
        if (welcome.nextStage) {
          setStage(welcome.nextStage)
        }
      }, 500)
    }
  }, [activeSessionId, createSession, addMessage, engine, setStage])
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])
  
  // Handle user message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    
    // Add user message
    addMessage({
      role: 'user',
      content,
      stage: currentStage,
    })
    
    // Process based on current stage
    let response
    
    switch (currentStage) {
      case 'welcome':
      case 'intent':
        response = engine.processIntent(content)
        break
      
      case 'client-info':
        engine.updateData(session?.collectedData || {})
        response = engine.processClientInfo(content)
        updateCollectedData(engine.getData())
        break
      
      default:
        // Generic response for other stages
        response = {
          message: "I understand. Let me help you with that.",
        }
    }
    
    // Add assistant response after a short delay for natural feel
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: response.message,
        actions: response.actions,
        metadata: response.metadata,
        stage: response.nextStage || currentStage,
      })
      
      if (response.nextStage) {
        setStage(response.nextStage)
      }
    }, 500)
  }, [addMessage, currentStage, engine, session?.collectedData, setStage, updateCollectedData])
  
  // Handle quick action clicks
  const handleActionClick = useCallback(async (action: QuickAction) => {
    // Add user's action as a message
    addMessage({
      role: 'user',
      content: action.label,
      stage: currentStage,
    })
    
    let response
    
    switch (action.type) {
      case 'start-new-case':
        response = engine.startNewCase()
        updateCollectedData({})
        break
      
      case 'resume-case':
        response = {
          message: "Select a case from the sidebar on the left, or tell me the company name you'd like to find.",
        }
        break
      
      case 'view-cases':
        response = {
          message: "You can see all your cases in the sidebar. Click on any case to view its details.",
        }
        break
      
      case 'select-industry':
        if (action.value) {
          engine.updateData(session?.collectedData || {})
          response = engine.processClientInfo(action.value)
          updateCollectedData(engine.getData())
        }
        break
      
      case 'run-screening':
        // Show loading message
        addMessage({
          role: 'assistant',
          content: "Running AI-powered screening now. I'll check company registry, sanctions, credit bureau, and more...",
          metadata: { isLoading: true },
          stage: 'screening',
        })
        setStage('screening')
        
        try {
          // Build prospect and create case
          const prospect = engine.buildProspect()
          const caseId = initializeNewCase(prospect)
          linkCaseToSession(caseId)
          
          // Run screening via API
          const screeningResponse = await fetch('/api/screening', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prospect }),
          })
          
          if (!screeningResponse.ok) {
            throw new Error('Screening failed')
          }
          
          // Parse SSE stream
          const reader = screeningResponse.body?.getReader()
          if (!reader) throw new Error('No response body')
          
          const decoder = new TextDecoder()
          let buffer = ''
          let screeningResult: ScreeningResult | null = null
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            
            for (const line of lines) {
              const trimmed = line.trim()
              if (trimmed.startsWith('data:')) {
                const data = trimmed.slice(5).trim()
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'output' && parsed.output) {
                    screeningResult = parsed.output as ScreeningResult
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
          
          if (screeningResult) {
            // Update the case in store
            await runScreening()
            
            // Remove loading message and show results
            response = engine.getScreeningComplete(screeningResult)
            updateLastAssistantMessage({
              content: response.message,
              actions: response.actions,
              metadata: { ...response.metadata, isLoading: false },
              stage: response.nextStage,
            })
            
            if (response.nextStage) {
              setStage(response.nextStage)
            }
            return
          }
        } catch (error) {
          console.error('Screening error:', error)
          // Fallback to mock if API fails
          await runScreening()
          const mockCase = useDashboardStore.getState().caseData
          if (mockCase?.screeningResult) {
            response = engine.getScreeningComplete(mockCase.screeningResult)
            updateLastAssistantMessage({
              content: response.message,
              actions: response.actions,
              metadata: { ...response.metadata, isLoading: false },
              stage: response.nextStage,
            })
            if (response.nextStage) {
              setStage(response.nextStage)
            }
          }
        }
        return
      
      case 'proceed-underwriting':
        // Show loading message
        addMessage({
          role: 'assistant',
          content: "Performing comprehensive financial analysis...",
          metadata: { isLoading: true },
          stage: 'underwriting',
        })
        setStage('underwriting')
        
        await runUnderwriting()
        
        const uwCase = useDashboardStore.getState().caseData
        if (uwCase?.underwritingResult) {
          response = engine.getUnderwritingComplete(uwCase.underwritingResult)
          updateLastAssistantMessage({
            content: response.message,
            actions: response.actions,
            metadata: { ...response.metadata, isLoading: false },
            stage: response.nextStage,
          })
          if (response.nextStage) {
            setStage(response.nextStage)
          }
        }
        return
      
      case 'generate-narrative':
        // Show loading message
        addMessage({
          role: 'assistant',
          content: "Generating comprehensive credit narrative...",
          metadata: { isLoading: true },
          stage: 'narrative',
        })
        setStage('narrative')
        
        await generateNarrative()
        
        const narCase = useDashboardStore.getState().caseData
        if (narCase?.creditNarrative) {
          response = engine.getNarrativeComplete(narCase.creditNarrative)
          updateLastAssistantMessage({
            content: response.message,
            actions: response.actions,
            metadata: { ...response.metadata, isLoading: false },
            stage: response.nextStage,
          })
          if (response.nextStage) {
            setStage(response.nextStage)
          }
        }
        return
      
      case 'submit-approval':
        await submitToCredit()
        response = engine.getSubmissionConfirmation()
        break
      
      case 'edit':
        response = {
          message: "Sure, let's make some changes. What would you like to update?\n\n- Company name\n- Registration number\n- Industry\n- Years of operation\n- Annual turnover\n- Loan amount\n- Financing purpose\n- Director name\n\nJust tell me what to change.",
        }
        break
      
      default:
        response = {
          message: "I'll help you with that.",
        }
    }
    
    if (response) {
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: response.message,
          actions: response.actions,
          metadata: response.metadata,
          stage: response.nextStage || currentStage,
        })
        
        if (response.nextStage) {
          setStage(response.nextStage)
        }
      }, 300)
    }
  }, [
    addMessage, 
    currentStage, 
    engine, 
    session?.collectedData, 
    setStage, 
    updateCollectedData,
    initializeNewCase,
    linkCaseToSession,
    runScreening,
    runUnderwriting,
    generateNarrative,
    submitToCredit,
    updateLastAssistantMessage,
  ])
  
  // Handle case selection from sidebar
  const handleSelectCase = useCallback((caseId: string) => {
    loadCase(caseId)
    
    const selectedCase = cases.find(c => c.id === caseId)
    if (selectedCase) {
      // Create new session for this case or switch to existing
      createSession(caseId)
      
      // Add context message
      setTimeout(() => {
        const caseInfo = selectedCase.caseData
        let stageMessage = ''
        
        switch (caseInfo.currentStage) {
          case 'screening':
            stageMessage = caseInfo.screeningResult 
              ? `Screening is complete with a score of ${caseInfo.screeningResult.overallScore}. Ready to proceed to underwriting.`
              : 'Ready to run AI screening.'
            break
          case 'underwriting':
            stageMessage = caseInfo.underwritingResult
              ? `Financial analysis complete. Score: ${caseInfo.underwritingResult.overallScore}. Ready to generate narrative.`
              : 'Ready to run financial analysis.'
            break
          case 'narrative':
            stageMessage = caseInfo.creditNarrative
              ? 'Credit narrative has been generated. Ready for review and submission.'
              : 'Ready to generate credit narrative.'
            break
        }
        
        addMessage({
          role: 'assistant',
          content: `Loaded case ${caseId} for ${selectedCase.companyName}.\n\nCurrent stage: ${caseInfo.currentStage.charAt(0).toUpperCase() + caseInfo.currentStage.slice(1)}\n\n${stageMessage}\n\nHow would you like to proceed?`,
          metadata: {
            caseSummary: {
              companyName: selectedCase.companyName,
              industry: selectedCase.industry,
              loanAmount: selectedCase.loanAmount,
              stage: caseInfo.currentStage as JourneyStage,
              riskScore: selectedCase.riskScore || undefined,
            },
          },
          actions: getActionsForStage(caseInfo.currentStage, caseInfo),
        })
        
        setStage(caseInfo.currentStage as JourneyStage)
      }, 300)
    }
  }, [loadCase, cases, createSession, addMessage, setStage])
  
  // Get appropriate actions for current stage
  const getActionsForStage = (stage: string, caseInfo: any): QuickAction[] => {
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    switch (stage) {
      case 'screening':
        return caseInfo.screeningResult
          ? [{ id: generateId(), label: 'Proceed to Underwriting', type: 'proceed-underwriting', variant: 'default' }]
          : [{ id: generateId(), label: 'Run AI Screening', type: 'run-screening', variant: 'default' }]
      case 'underwriting':
        return caseInfo.underwritingResult
          ? [{ id: generateId(), label: 'Generate Narrative', type: 'generate-narrative', variant: 'default' }]
          : [{ id: generateId(), label: 'Run Analysis', type: 'proceed-underwriting', variant: 'default' }]
      case 'narrative':
        return caseInfo.creditNarrative
          ? [{ id: generateId(), label: 'Submit for Approval', type: 'submit-approval', variant: 'default' }]
          : [{ id: generateId(), label: 'Generate Narrative', type: 'generate-narrative', variant: 'default' }]
      default:
        return []
    }
  }
  
  // Handle new chat
  const handleNewChat = useCallback(() => {
    const sessionId = createSession()
    engine.resetData()
    
    setTimeout(() => {
      const welcome = engine.getWelcomeMessage()
      addMessage({
        role: 'assistant',
        content: welcome.message,
        actions: welcome.actions,
        stage: welcome.nextStage,
      })
      if (welcome.nextStage) {
        setStage(welcome.nextStage)
      }
    }, 300)
  }, [createSession, engine, addMessage, setStage])
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
        onSelectCase={handleSelectCase}
        selectedCaseId={caseData?.id || session?.caseId}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border bg-background flex items-center px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">Super RM Assistant</span>
          </div>
          
          {caseData && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {caseData.id} - {caseData.prospect.companyName}
              </span>
            </div>
          )}
        </header>
        
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="max-w-3xl mx-auto py-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Starting conversation...</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onActionClick={handleActionClick}
                  isLast={index === messages.length - 1}
                />
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          placeholder={getPlaceholderForStage(currentStage)}
          showAttachments={currentStage === 'documents'}
        />
      </div>
      
      {/* Context Panel */}
      <ChatContextPanel
        isOpen={contextPanelOpen}
        onToggle={() => setContextPanelOpen(!contextPanelOpen)}
        caseData={caseData}
        collectedData={session?.collectedData}
        currentStage={currentStage}
      />
    </div>
  )
}

function getPlaceholderForStage(stage: JourneyStage): string {
  switch (stage) {
    case 'welcome':
    case 'intent':
      return "Tell me what you'd like to do..."
    case 'client-info':
      return "Enter the information requested..."
    case 'screening':
    case 'underwriting':
    case 'narrative':
      return "Ask a question or provide additional details..."
    default:
      return "Type your message..."
  }
}
