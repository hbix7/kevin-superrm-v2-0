'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronRight,
  ChevronLeft,
  Building2,
  FileText,
  Clock,
  User,
  DollarSign,
  Factory,
  Target,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react'
import type { CaseData } from '@/lib/types'
import type { JourneyStage, CollectedProspectData } from '@/lib/chat/types'

interface ChatContextPanelProps {
  isOpen: boolean
  onToggle: () => void
  caseData?: CaseData | null
  collectedData?: CollectedProspectData
  currentStage: JourneyStage
}

const stageProgress: Record<JourneyStage, number> = {
  'welcome': 0,
  'intent': 5,
  'client-info': 20,
  'screening': 35,
  'screening-results': 45,
  'documents': 55,
  'underwriting': 65,
  'underwriting-results': 75,
  'narrative': 85,
  'narrative-results': 90,
  'review': 95,
  'submitted': 100,
}

const stageLabels: Record<JourneyStage, string> = {
  'welcome': 'Welcome',
  'intent': 'Getting Started',
  'client-info': 'Client Information',
  'screening': 'Running Screening',
  'screening-results': 'Screening Complete',
  'documents': 'Document Collection',
  'underwriting': 'Financial Analysis',
  'underwriting-results': 'Analysis Complete',
  'narrative': 'Generating Narrative',
  'narrative-results': 'Narrative Ready',
  'review': 'Final Review',
  'submitted': 'Submitted',
}

function InfoItem({ icon: Icon, label, value }: { 
  icon: React.ElementType
  label: string
  value?: string | number | null 
}) {
  if (!value) return null
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground truncate">
          {typeof value === 'number' ? `MYR ${value.toLocaleString()}` : value}
        </div>
      </div>
    </div>
  )
}

export function ChatContextPanel({ 
  isOpen, 
  onToggle, 
  caseData, 
  collectedData,
  currentStage 
}: ChatContextPanelProps) {
  const progress = stageProgress[currentStage]
  const prospect = caseData?.prospect
  const hasData = prospect || (collectedData && Object.keys(collectedData).length > 0)
  
  // Merge collected data with prospect data
  const displayData = {
    companyName: prospect?.companyName || collectedData?.companyName,
    registrationNumber: prospect?.registrationNumber || collectedData?.registrationNumber,
    industry: prospect?.industry || collectedData?.industry,
    yearsOfOperation: prospect?.yearsOfOperation || collectedData?.yearsOfOperation,
    estimatedTurnover: prospect?.estimatedTurnover || collectedData?.estimatedTurnover,
    requestedLoanAmount: prospect?.requestedLoanAmount || collectedData?.requestedLoanAmount,
    directorName: prospect?.directorName || collectedData?.directorName,
    financingPurpose: prospect?.financingPurpose || collectedData?.financingPurpose,
  }

  if (!isOpen) {
    return (
      <div className="w-12 border-l border-border bg-background flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-80 border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Case Context</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Progress */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Journey Progress</span>
          <Badge variant="outline" className="text-xs">
            {stageLabels[currentStage]}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Start</span>
          <span className="text-xs text-muted-foreground">{progress}%</span>
          <span className="text-xs text-muted-foreground">Submit</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <Tabs defaultValue="info" className="p-4">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
            <TabsTrigger value="docs" className="flex-1">Docs</TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-4 space-y-4">
            {!hasData ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No case data yet</p>
                <p className="text-xs">Start a conversation to begin</p>
              </div>
            ) : (
              <>
                {/* Case ID */}
                {caseData?.id && (
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {caseData.id}
                        </Badge>
                        {caseData.overallRiskScore && (
                          <Badge 
                            variant="outline"
                            className={cn(
                              caseData.overallRiskScore >= 70 ? 'border-success text-success' :
                              caseData.overallRiskScore >= 50 ? 'border-warning text-warning' :
                              'border-destructive text-destructive'
                            )}
                          >
                            Score: {caseData.overallRiskScore}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Company Info */}
                <div className="space-y-1">
                  <InfoItem 
                    icon={Building2} 
                    label="Company Name" 
                    value={displayData.companyName} 
                  />
                  <InfoItem 
                    icon={Factory} 
                    label="Industry" 
                    value={displayData.industry} 
                  />
                  <InfoItem 
                    icon={User} 
                    label="Director" 
                    value={displayData.directorName} 
                  />
                  <InfoItem 
                    icon={Clock} 
                    label="Years Operating" 
                    value={displayData.yearsOfOperation ? `${displayData.yearsOfOperation} years` : undefined} 
                  />
                  <InfoItem 
                    icon={DollarSign} 
                    label="Annual Turnover" 
                    value={displayData.estimatedTurnover} 
                  />
                  <InfoItem 
                    icon={Target} 
                    label="Loan Amount" 
                    value={displayData.requestedLoanAmount} 
                  />
                  <InfoItem 
                    icon={FileText} 
                    label="Purpose" 
                    value={displayData.financingPurpose} 
                  />
                </div>
                
                {/* Screening Results Summary */}
                {caseData?.screeningResult && (
                  <Card>
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Screening Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Score: </span>
                          <span className="font-medium">{caseData.screeningResult.overallScore}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence: </span>
                          <span className="font-medium">{caseData.screeningResult.confidenceScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Underwriting Results Summary */}
                {caseData?.underwritingResult && (
                  <Card>
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Analysis Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Score: </span>
                          <span className="font-medium">{caseData.underwritingResult.overallScore}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence: </span>
                          <span className="font-medium">{caseData.underwritingResult.confidenceScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="docs" className="mt-4">
            {!caseData?.documents || caseData.documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {caseData.documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-4">
            {!caseData?.timeline || caseData.timeline.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {caseData.timeline.slice().reverse().map((event) => (
                    <div key={event.id} className="flex gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <p className="text-sm text-foreground">{event.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {event.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  )
}
