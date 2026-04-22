'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { 
  Bot, 
  User, 
  Building2, 
  TrendingUp, 
  FileText, 
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles
} from 'lucide-react'
import type { ChatMessage, QuickAction } from '@/lib/chat/types'

interface ChatMessageProps {
  message: ChatMessage
  onActionClick?: (action: QuickAction) => void
  isLast?: boolean
}

function RiskBadge({ status }: { status: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { label: 'Low Risk', className: 'bg-success/10 text-success border-success/20' },
    medium: { label: 'Medium Risk', className: 'bg-warning/10 text-warning border-warning/20' },
    high: { label: 'High Risk', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  }
  return (
    <Badge variant="outline" className={config[status].className}>
      {config[status].label}
    </Badge>
  )
}

function StatusIcon({ status }: { status: 'low' | 'medium' | 'high' }) {
  if (status === 'low') return <CheckCircle2 className="h-4 w-4 text-success" />
  if (status === 'medium') return <AlertTriangle className="h-4 w-4 text-warning" />
  return <XCircle className="h-4 w-4 text-destructive" />
}

function CaseSummaryCard({ summary }: { summary: NonNullable<ChatMessage['metadata']>['caseSummary'] }) {
  if (!summary) return null
  
  return (
    <Card className="mt-3 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{summary.companyName}</h4>
            {summary.industry && (
              <p className="text-sm text-muted-foreground">{summary.industry}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-2">
              {summary.loanAmount && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Loan: </span>
                  <span className="font-medium">MYR {summary.loanAmount.toLocaleString()}</span>
                </div>
              )}
              {summary.riskScore !== undefined && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Risk Score: </span>
                  <span className="font-medium">{summary.riskScore}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScreeningResultCard({ result }: { result: NonNullable<ChatMessage['metadata']>['screeningResult'] }) {
  if (!result) return null
  
  const getRecommendationStyle = (rec: string) => {
    if (rec === 'proceed') return 'bg-success text-success-foreground'
    if (rec === 'probe') return 'bg-warning text-warning-foreground'
    return 'bg-destructive text-destructive-foreground'
  }
  
  return (
    <Card className="mt-3 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">AI Screening Complete</h4>
            <p className="text-sm text-muted-foreground">{result.reasoning}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{result.overallScore}</div>
            <div className="text-xs text-muted-foreground">Risk Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{result.confidenceScore}%</div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
          <Badge className={`${getRecommendationStyle(result.recommendation)} capitalize`}>
            {result.recommendation}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {result.dimensions.slice(0, 4).map((dim) => (
            <div key={dim.name} className="flex items-center gap-2 text-sm">
              <StatusIcon status={dim.status} />
              <span className="text-muted-foreground">{dim.name}</span>
              <span className="font-medium ml-auto">{dim.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function UnderwritingResultCard({ result }: { result: NonNullable<ChatMessage['metadata']>['underwritingResult'] }) {
  if (!result) return null
  
  return (
    <Card className="mt-3 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Financial Analysis Complete</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{result.overallScore}</div>
            <div className="text-xs text-muted-foreground">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{result.confidenceScore}%</div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
        </div>
        
        <div className="space-y-2">
          {result.categories.slice(0, 4).map((cat) => (
            <div key={cat.name} className="flex items-center gap-2">
              <StatusIcon status={cat.status} />
              <span className="text-sm text-muted-foreground flex-1">{cat.name}</span>
              <Progress value={cat.score} className="w-20 h-2" />
              <span className="text-sm font-medium w-8">{cat.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NarrativePreviewCard({ 
  preview, 
  fullNarrative,
  onActionClick,
  caseId,
  clientName,
}: { 
  preview: NonNullable<ChatMessage['metadata']>['narrativePreview']
  fullNarrative?: any
  onActionClick?: (action: QuickAction) => void
  caseId?: string
  clientName?: string
}) {
  const [showFullReport, setShowFullReport] = useState(false)
  const [showEditMode, setShowEditMode] = useState(false)
  const [editText, setEditText] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  if (!preview) return null
  
  const handleViewFullReport = () => {
    setShowFullReport(!showFullReport)
    setShowEditMode(false)
  }
  
  const handleEditClick = () => {
    setShowEditMode(true)
    setShowFullReport(true)
    setEditText('')
  }
  
  const handleSaveToDb = () => {
    if (onActionClick && caseId) {
      const payload = {
        clientName: clientName || 'Unknown Client',
        screeningDate: new Date().toISOString(),
        fullNarrative: fullNarrative || preview,
        caseId,
      }
      onActionClick({
        id: `${Date.now()}-save`,
        label: 'Save to Database',
        type: 'save-to-db',
        value: JSON.stringify(payload),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }
  
  const handleSubmitEdit = () => {
    if (onActionClick && editText.trim()) {
      onActionClick({
        id: `${Date.now()}-edit`,
        label: 'Submit Edit',
        type: 'submit-narrative-edit',
        value: editText,
      })
      setShowEditMode(false)
      setEditText('')
    }
  }
  
  return (
    <Card className="mt-3 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Credit Narrative Generated</h4>
            <p className="text-sm text-muted-foreground">Confidence: {preview.confidenceScore}%</p>
          </div>
          {saveSuccess && (
            <Badge className="bg-success text-success-foreground">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
        
        {!showFullReport ? (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium text-foreground">Business Profile</div>
              <p className="text-muted-foreground line-clamp-2">{preview.businessProfile}</p>
            </div>
            <div>
              <div className="font-medium text-foreground">Financial Summary</div>
              <p className="text-muted-foreground line-clamp-2">{preview.financialSummary}</p>
            </div>
            <div>
              <div className="font-medium text-foreground">Recommendation</div>
              <p className="text-muted-foreground">{preview.recommendation}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            {fullNarrative ? (
              <>
                <div>
                  <div className="font-medium text-foreground mb-2">Business Profile - Background</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fullNarrative.businessProfile?.background}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Industry Context</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fullNarrative.businessProfile?.industryContext}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Business Model</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fullNarrative.businessProfile?.businessModel}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Revenue Trends</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fullNarrative.financialAssessment?.revenueTrends}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Profitability Analysis</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fullNarrative.financialAssessment?.profitabilityAnalysis}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Repayment Capacity</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fullNarrative.financialAssessment?.repaymentCapacity}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Key Risks</div>
                  <ul className="text-muted-foreground space-y-1">
                    {fullNarrative.riskAssessment?.keyRisks?.map((risk: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Risk Mitigants</div>
                  <ul className="text-muted-foreground space-y-1">
                    {fullNarrative.riskAssessment?.mitigants?.map((mitigant: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        {mitigant}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">Facility Structure</div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>Amount: MYR {fullNarrative.facilityStructure?.recommendedAmount?.toLocaleString()}</div>
                    <div>Tenure: {fullNarrative.facilityStructure?.tenure}</div>
                    <div>Collateral: {fullNarrative.facilityStructure?.collateral}</div>
                    <div>Guarantees: {fullNarrative.facilityStructure?.guarantees}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-foreground">Business Profile</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{preview.businessProfile}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground">Financial Summary</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{preview.financialSummary}</p>
                </div>
                <div>
                  <div className="font-medium text-foreground">Recommendation</div>
                  <p className="text-muted-foreground">{preview.recommendation}</p>
                </div>
              </div>
            )}
            
            {/* Edit mode textarea */}
            {showEditMode && (
              <div className="border-t border-border pt-4 mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Please send a new edit
                </label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Enter your revised narrative here..."
                  className="w-full min-h-[120px] p-3 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleSubmitEdit} disabled={!editText.trim()}>
                    Submit Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Save prompt */}
            {showFullReport && !showEditMode && (
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Would you like to save this report to the database?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveToDb}>
                    Save to Database
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowFullReport(false)}>
                    Not Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          <Button size="sm" variant="outline" onClick={handleViewFullReport}>
            {showFullReport ? 'Hide Report' : 'View Full Report'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleEditClick}>
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressCard({ progress }: { progress: NonNullable<ChatMessage['metadata']>['progress'] }) {
  if (!progress) return null
  
  const stages = [
    { key: 'client-info', label: 'Client Info' },
    { key: 'screening', label: 'Screening' },
    { key: 'underwriting', label: 'Underwriting' },
    { key: 'narrative', label: 'Narrative' },
    { key: 'review', label: 'Review' },
  ]
  
  return (
    <Card className="mt-3 bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Journey Progress</span>
          <span className="text-sm text-muted-foreground">{progress.percentage}%</span>
        </div>
        <Progress value={progress.percentage} className="h-2 mb-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          {stages.map((stage) => (
            <span 
              key={stage.key}
              className={cn(
                progress.completedStages.includes(stage.key as any) && 'text-primary font-medium',
                progress.currentStage === stage.key && 'text-foreground font-medium'
              )}
            >
              {stage.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export function ChatMessageComponent({ message, onActionClick, isLast }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'
  const isLoading = message.metadata?.isLoading
  const isTyping = message.metadata?.isTyping
  
  return (
    <div className={cn(
      'flex gap-3 px-4 py-3',
      isAssistant ? 'justify-start' : 'justify-end'
    )}>
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        'flex flex-col max-w-[80%]',
        !isAssistant && 'items-end'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5',
          isAssistant 
            ? 'bg-muted text-foreground rounded-tl-sm' 
            : 'bg-primary text-primary-foreground rounded-tr-sm'
        )}>
          {isTyping ? (
            <TypingIndicator />
          ) : isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>{message.content}</span>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        {/* Metadata cards */}
        {message.metadata?.caseSummary && (
          <CaseSummaryCard summary={message.metadata.caseSummary} />
        )}
        {message.metadata?.screeningResult && (
          <ScreeningResultCard result={message.metadata.screeningResult} />
        )}
        {message.metadata?.underwritingResult && (
          <UnderwritingResultCard result={message.metadata.underwritingResult} />
        )}
        {message.metadata?.narrativePreview && (
          <NarrativePreviewCard 
            preview={message.metadata.narrativePreview}
            fullNarrative={message.metadata?.fullNarrative}
            onActionClick={onActionClick}
            caseId={message.caseId}
            clientName={message.metadata?.caseSummary?.companyName}
          />
        )}
        {message.metadata?.progress && (
          <ProgressCard progress={message.metadata.progress} />
        )}
        
        {/* Quick actions */}
        {message.actions && message.actions.length > 0 && isLast && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                disabled={action.disabled}
                onClick={() => onActionClick?.(action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
        
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {!isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
