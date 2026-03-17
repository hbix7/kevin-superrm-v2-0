'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  User, 
  Factory, 
  CreditCard, 
  TrendingUp, 
  Settings,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDashboardStore } from '@/lib/store'
import type { RiskLevel } from '@/lib/types'
import { ProspectForm } from '@/components/prospect-form'

const dimensionIcons: Record<string, React.ElementType> = {
  companyLegitimacy: Building2,
  directorRisk: User,
  industryRisk: Factory,
  creditSignals: CreditCard,
  businessViability: TrendingUp,
  operationalIndicators: Settings,
  fraudSignals: ShieldAlert,
}

const dimensionLabels: Record<string, string> = {
  companyLegitimacy: 'Company Legitimacy',
  directorRisk: 'Director Risk',
  industryRisk: 'Industry Risk',
  creditSignals: 'Credit Signals',
  businessViability: 'Business Viability',
  operationalIndicators: 'Operational Indicators',
  fraudSignals: 'Fraud Signals',
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const config = {
    low: { label: 'Low Risk', className: 'bg-success/10 text-success border-success/20' },
    medium: { label: 'Medium Risk', className: 'bg-warning/10 text-warning border-warning/20' },
    high: { label: 'High Risk', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  }
  return (
    <Badge variant="outline" className={config[level].className}>
      {config[level].label}
    </Badge>
  )
}

function StatusIcon({ status }: { status: 'clear' | 'probe' | 'drop' }) {
  if (status === 'clear') return <CheckCircle2 className="h-4 w-4 text-success" />
  if (status === 'probe') return <AlertTriangle className="h-4 w-4 text-warning" />
  return <XCircle className="h-4 w-4 text-destructive" />
}

export function ScreeningStage() {
  const { caseData, isLoading, setCurrentStage } = useDashboardStore()
  const [showForm, setShowForm] = useState(!caseData?.screeningResult)

  // Update showForm when caseData changes (e.g., loading a different case)
  useEffect(() => {
    setShowForm(!caseData?.screeningResult)
  }, [caseData?.id, caseData?.screeningResult])

  const screeningResult = caseData?.screeningResult

  if (showForm || !screeningResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Rapid Screening
            </CardTitle>
            <CardDescription>
              Enter prospect information to begin AI-powered screening analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProspectForm onComplete={() => setShowForm(false)} />
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRecommendationStyle = (rec: string) => {
    if (rec === 'proceed') return 'bg-success text-success-foreground'
    if (rec === 'probe') return 'bg-warning text-warning-foreground'
    return 'bg-destructive text-destructive-foreground'
  }

  const getRecommendationLabel = (rec: string) => {
    if (rec === 'proceed') return 'Proceed to Underwriting'
    if (rec === 'probe') return 'Probe Further'
    return 'Drop Prospect'
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendation Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">AI Screening Analysis Complete</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {screeningResult.reasoning}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{screeningResult.overallScore}</div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{screeningResult.confidenceScore}%</div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
              </div>
              
              <Badge className={`${getRecommendationStyle(screeningResult.recommendation)} text-sm px-4 py-1.5`}>
                {getRecommendationLabel(screeningResult.recommendation)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(screeningResult.dimensions).map(([key, dimension]) => {
          const Icon = dimensionIcons[key] || Building2
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <RiskBadge level={dimension.status} />
                </div>
                
                <h4 className="font-semibold text-foreground mb-1">{dimensionLabels[key]}</h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <Progress value={dimension.score} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-foreground">{dimension.score}</span>
                </div>
                
                <ul className="space-y-1">
                  {dimension.findings.slice(0, 3).map((finding, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Screening Checks</CardTitle>
          <CardDescription>
            Complete breakdown of all screening dimensions and data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="companyLegitimacy">
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-transparent p-0 mb-6">
              {Object.keys(dimensionLabels).map((key) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                >
                  {dimensionLabels[key]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.keys(dimensionLabels).map((dimensionKey) => (
              <TabsContent key={dimensionKey} value={dimensionKey}>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Check</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Data Source</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Finding</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {screeningResult.checks
                        .filter((check) => check.dimension === dimensionKey)
                        .map((check) => (
                          <tr key={check.id} className="hover:bg-muted/30">
                            <td className="p-3 text-sm font-medium text-foreground">{check.check}</td>
                            <td className="p-3 text-sm text-muted-foreground">{check.dataSource}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <StatusIcon status={check.status} />
                                <span className="text-sm capitalize">{check.status}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-foreground">{check.finding}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Progress value={check.confidence} className="w-16 h-1.5" />
                                <span className="text-xs text-muted-foreground">{check.confidence}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          New Screening
        </Button>
        
        {screeningResult.recommendation === 'proceed' && (
          <Button onClick={() => setCurrentStage('underwriting')}>
            Proceed to Underwriting
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
