'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Shield,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  Edit3,
  Save,
  FileText,
  X,
  Maximize2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDashboardStore } from '@/lib/store'
import type { CreditNarrative, RecommendationAction, CaseData } from '@/lib/types'

function RecommendationBadge({ recommendation }: { recommendation: RecommendationAction }) {
  const config: Record<RecommendationAction, { label: string; className: string }> = {
    proceed: { label: 'Proceed', className: 'bg-success text-success-foreground' },
    probe: { label: 'Probe Further', className: 'bg-warning text-warning-foreground' },
    drop: { label: 'Drop', className: 'bg-destructive text-destructive-foreground' },
    approve: { label: 'Approve', className: 'bg-success text-success-foreground' },
    'approve-conditions': { label: 'Approve with Conditions', className: 'bg-warning text-warning-foreground' },
    adjust: { label: 'Adjust Structure', className: 'bg-info text-info-foreground' },
    decline: { label: 'Decline', className: 'bg-destructive text-destructive-foreground' },
  }
  return (
    <Badge className={config[recommendation].className}>
      {config[recommendation].label}
    </Badge>
  )
}

function EditableSection({
  title,
  content,
  icon: Icon,
  isEditing,
  onEdit,
  onChange,
}: {
  title: string
  content: string
  icon: React.ElementType
  isEditing: boolean
  onEdit: () => void
  onChange: (value: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[150px]"
          />
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
        )}
      </CardContent>
    </Card>
  )
}

function NarrativeLoadingState() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Generating Credit Narrative...</h3>
            <p className="text-sm text-muted-foreground mt-1">
              AI is analyzing all data points to create a comprehensive credit memo
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>This may take a few moments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NarrativeStage() {
  const { caseData, isLoading, setLoading, setCaseData, updateCaseInList, currentCaseId, setCurrentStage, updateNarrative, submitToCredit } = useDashboardStore()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [localNarrative, setLocalNarrative] = useState<CreditNarrative | null>(
    caseData?.creditNarrative || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showFullEditModal, setShowFullEditModal] = useState(false)
  const [fullEditText, setFullEditText] = useState('')
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [dbSaveSuccess, setDbSaveSuccess] = useState(false)

  // Update local narrative when case changes
  useEffect(() => {
    setLocalNarrative(caseData?.creditNarrative || null)
    setIsSubmitted(false)
  }, [caseData?.id, caseData?.creditNarrative])

  const handleGenerateNarrative = async () => {
    if (!caseData || !currentCaseId) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prospect: caseData.prospect,
          screeningResult: caseData.screeningResult,
          underwritingResult: caseData.underwritingResult
        }),
      })

      if (!response.ok) throw new Error('Narrative generation failed')

      // Parse SSE stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let narrativeResult: CreditNarrative | null = null

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
                narrativeResult = parsed.output as CreditNarrative
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      if (narrativeResult) {
        setLocalNarrative(narrativeResult)
        
        const updatedCase: CaseData = {
          ...caseData,
          creditNarrative: narrativeResult,
          currentStage: 'narrative',
          overallRiskScore: narrativeResult.confidenceScore,
          timeline: [
            ...caseData.timeline,
            {
              id: `TL-${Date.now()}`,
              action: 'AI Credit Narrative generated',
              timestamp: new Date(),
              user: 'System',
            },
          ],
        }

        setCaseData(updatedCase)
        updateCaseInList(currentCaseId, {
          caseData: updatedCase,
          stage: 'narrative',
          lastUpdated: new Date(),
          riskScore: narrativeResult.confidenceScore,
          status: 'pending_approval',
        })
      }
    } catch (error) {
      console.error('Narrative error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitToCredit = async () => {
    // Save any pending changes first
    if (localNarrative) {
      updateNarrative(localNarrative)
    }
    
    setIsSubmitting(true)
    await submitToCredit()
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isLoading) {
    return <NarrativeLoadingState />
  }

  if (!localNarrative) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Credit Narrative Generated</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete the underwriting stage to generate an AI credit narrative
          </p>
          <Button onClick={handleGenerateNarrative}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Credit Narrative
          </Button>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSaveNarrative = () => {
    if (localNarrative) {
      updateNarrative(localNarrative)
      setEditingSection(null)
    }
  }
  
  // Generate full narrative text for the edit modal
  const getFullNarrativeText = () => {
    if (!localNarrative) return ''
    
    return `## Business Profile

### Background
${localNarrative.businessProfile.background}

### Industry Context
${localNarrative.businessProfile.industryContext}

### Business Model
${localNarrative.businessProfile.businessModel}

## Financial Assessment

### Revenue Trends
${localNarrative.financialAssessment.revenueTrends}

### Profitability Analysis
${localNarrative.financialAssessment.profitabilityAnalysis}

### Repayment Capacity
${localNarrative.financialAssessment.repaymentCapacity}

## Risk Assessment

### Key Risks
${localNarrative.riskAssessment.keyRisks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### Risk Mitigants
${localNarrative.riskAssessment.mitigants.map((m, i) => `${i + 1}. ${m}`).join('\n')}

## Facility Structure

- Recommended Amount: MYR ${localNarrative.facilityStructure.recommendedAmount.toLocaleString()}
- Tenure: ${localNarrative.facilityStructure.tenure}
- Collateral: ${localNarrative.facilityStructure.collateral}
- Guarantees: ${localNarrative.facilityStructure.guarantees}
`
  }
  
  const handleOpenFullEdit = () => {
    setFullEditText(getFullNarrativeText())
    setShowFullEditModal(true)
  }
  
  const handleSubmitFullEdit = () => {
    if (localNarrative && fullEditText.trim()) {
      // Update the narrative reasoning and background with the new text
      const updatedNarrative: CreditNarrative = {
        ...localNarrative,
        reasoning: fullEditText,
        businessProfile: {
          ...localNarrative.businessProfile,
          background: fullEditText,
        },
      }
      setLocalNarrative(updatedNarrative)
      setShowFullEditModal(false)
      setShowSavePrompt(true)
    }
  }
  
  const handleSaveToDatabase = () => {
    if (localNarrative && currentCaseId) {
      const storageKey = `narrative:${currentCaseId}`
      const narrativeData = {
        ...localNarrative,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(narrativeData))
      setDbSaveSuccess(true)
      setShowSavePrompt(false)
      setTimeout(() => setDbSaveSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">AI Credit Narrative Generated</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {localNarrative.reasoning}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{localNarrative.confidenceScore}%</div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
              <RecommendationBadge recommendation={localNarrative.recommendation} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Memo Sections */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
          <TabsTrigger 
            value="profile" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Business Profile
          </TabsTrigger>
          <TabsTrigger 
            value="financial" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Financial Assessment
          </TabsTrigger>
          <TabsTrigger 
            value="risk" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger 
            value="facility" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Facility Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-4">
          <EditableSection
            title="Company Background"
            content={localNarrative.businessProfile.background}
            icon={Building2}
            isEditing={editingSection === 'background'}
            onEdit={() => setEditingSection(editingSection === 'background' ? null : 'background')}
            onChange={(value) =>
              setLocalNarrative({
                ...localNarrative,
                businessProfile: { ...localNarrative.businessProfile, background: value },
              })
            }
          />
          <EditableSection
            title="Industry Context"
            content={localNarrative.businessProfile.industryContext}
            icon={TrendingUp}
            isEditing={editingSection === 'industryContext'}
            onEdit={() => setEditingSection(editingSection === 'industryContext' ? null : 'industryContext')}
            onChange={(value) =>
              setLocalNarrative({
                ...localNarrative,
                businessProfile: { ...localNarrative.businessProfile, industryContext: value },
              })
            }
          />
          <EditableSection
            title="Business Model"
            content={localNarrative.businessProfile.businessModel}
            icon={Building2}
            isEditing={editingSection === 'businessModel'}
            onEdit={() => setEditingSection(editingSection === 'businessModel' ? null : 'businessModel')}
            onChange={(value) =>
              setLocalNarrative({
                ...localNarrative,
                businessProfile: { ...localNarrative.businessProfile, businessModel: value },
              })
            }
          />
        </TabsContent>

        <TabsContent value="financial" className="mt-6 space-y-4">
          <EditableSection
            title="Revenue Trends"
            content={localNarrative.financialAssessment.revenueTrends}
            icon={TrendingUp}
            isEditing={editingSection === 'revenueTrends'}
            onEdit={() => setEditingSection(editingSection === 'revenueTrends' ? null : 'revenueTrends')}
            onChange={(value) =>
              setLocalNarrative({
                ...localNarrative,
                financialAssessment: { ...localNarrative.financialAssessment, revenueTrends: value },
              })
            }
          />
          <EditableSection
            title="Profitability Analysis"
            content={localNarrative.financialAssessment.profitabilityAnalysis}
            icon={DollarSign}
            isEditing={editingSection === 'profitability'}
            onEdit={() => setEditingSection(editingSection === 'profitability' ? null : 'profitability')}
            onChange={(value) =>
              setLocalNarrative({
                ...localNarrative,
                financialAssessment: { ...localNarrative.financialAssessment, profitabilityAnalysis: value },
              })
            }
          />
          <EditableSection
            title="Repayment Capacity"
            content={localNarrative.financialAssessment.repaymentCapacity}
            icon={CheckCircle2}
            isEditing={editingSection === 'repayment'}
            onEdit={() => setEditingSection(editingSection === 'repayment' ? null : 'repayment')}
            onChange={(value) =>
              setLocalNarrative({
                ...localNarrative,
                financialAssessment: { ...localNarrative.financialAssessment, repaymentCapacity: value },
              })
            }
          />
        </TabsContent>

        <TabsContent value="risk" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Key Risks Identified
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {localNarrative.riskAssessment.keyRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning text-xs font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-success" />
                  Risk Mitigants
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {localNarrative.riskAssessment.mitigants.map((mitigant, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success mt-0.5" />
                    <span className="text-muted-foreground">{mitigant}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facility" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Recommended Facility Structure
              </CardTitle>
              <CardDescription>AI-recommended terms based on financial analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Recommended Amount</div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(localNarrative.facilityStructure.recommendedAmount)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Tenure</div>
                    <div className="text-lg font-semibold text-foreground">
                      {localNarrative.facilityStructure.tenure}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Collateral</div>
                    <div className="text-sm text-foreground">
                      {localNarrative.facilityStructure.collateral}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Guarantees</div>
                    <div className="text-sm text-foreground">
                      {localNarrative.facilityStructure.guarantees}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={() => setCurrentStage('underwriting')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Underwriting
        </Button>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleOpenFullEdit}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Edit Full Narrative
          </Button>
          <Button variant="outline" onClick={handleSaveNarrative}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {isSubmitted ? (
            <Button disabled className="bg-success text-success-foreground">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submitted for Approval
            </Button>
          ) : (
            <Button onClick={handleSubmitToCredit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit to Credit
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Save Prompt */}
      {showSavePrompt && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm text-foreground mb-3">
              Narrative updated. Would you like to save this to the database?
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveToDatabase}>
                Save to Database
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowSavePrompt(false)}>
                Not Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Database Save Success Badge */}
      {dbSaveSuccess && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge className="bg-success text-success-foreground px-4 py-2">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Saved to database
          </Badge>
        </div>
      )}
      
      {/* Full Edit Modal */}
      {showFullEditModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 z-50 bg-background border rounded-lg shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                Edit Full Narrative
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFullEditModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                  {getFullNarrativeText()}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Please send a new edit
                  </label>
                  <Textarea
                    value={fullEditText}
                    onChange={(e) => setFullEditText(e.target.value)}
                    placeholder="Enter your revised narrative here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <Button variant="outline" onClick={() => setShowFullEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitFullEdit} disabled={!fullEditText.trim()}>
                Submit Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
