'use client'

import { Building2, Calendar, DollarSign, Briefcase, User, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useDashboardStore } from '@/lib/store'

export function CaseHeader() {
  const { caseData, currentStage } = useDashboardStore()

  if (!caseData) return null

  const { prospect } = caseData
  const stageProgress = {
    screening: 33,
    underwriting: 66,
    narrative: 100,
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-destructive'
  }

  const getRiskBg = (score: number) => {
    if (score >= 75) return 'bg-success/10'
    if (score >= 50) return 'bg-warning/10'
    return 'bg-destructive/10'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-semibold text-foreground truncate">
                    {prospect.companyName}
                  </h1>
                  <Badge variant="outline" className="shrink-0">
                    {caseData.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {prospect.industry}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {prospect.yearsOfOperation} years
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {prospect.directorName}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground font-medium mb-1">Requested Amount</div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(prospect.requestedLoanAmount)}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground font-medium mb-1">Est. Turnover</div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(prospect.estimatedTurnover)}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground font-medium mb-1">Purpose</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {prospect.financingPurpose}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground font-medium mb-1">Reg. Number</div>
                <div className="text-sm font-mono text-foreground">
                  {prospect.registrationNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Score & Progress */}
          <div className="w-full lg:w-64 shrink-0">
            {caseData.overallRiskScore && (
              <div className={`rounded-lg p-4 mb-4 ${getRiskBg(caseData.overallRiskScore)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Overall Risk Score</span>
                  <AlertCircle className={`h-4 w-4 ${getRiskColor(caseData.overallRiskScore)}`} />
                </div>
                <div className={`text-3xl font-bold ${getRiskColor(caseData.overallRiskScore)}`}>
                  {caseData.overallRiskScore}
                  <span className="text-base font-normal text-muted-foreground">/100</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {caseData.overallRiskScore >= 75 && 'Low Risk - Proceed'}
                  {caseData.overallRiskScore >= 50 && caseData.overallRiskScore < 75 && 'Medium Risk - Review Required'}
                  {caseData.overallRiskScore < 50 && 'High Risk - Caution'}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Case Progress</span>
                <span className="text-xs font-semibold text-foreground">{stageProgress[currentStage]}%</span>
              </div>
              <Progress value={stageProgress[currentStage]} className="h-2" />
              <div className="flex justify-between mt-3 text-[10px] text-muted-foreground">
                <span className={currentStage === 'screening' ? 'text-primary font-medium' : ''}>Screening</span>
                <span className={currentStage === 'underwriting' ? 'text-primary font-medium' : ''}>Underwriting</span>
                <span className={currentStage === 'narrative' ? 'text-primary font-medium' : ''}>Narrative</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
