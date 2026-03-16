'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  Users,
  Scale,
  BarChart3,
  Settings,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDashboardStore } from '@/lib/store'
import type { RiskLevel, UnderwritingCategory, UnderwritingResult } from '@/lib/types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const categoryIcons: Record<string, React.ElementType> = {
  'Financial Strength': DollarSign,
  'Cashflow & Repayment Capacity': TrendingUp,
  'Borrower Behaviour': Users,
  'Debt Burden & Exposure': Scale,
  'Revenue Quality': BarChart3,
  'Operational Viability': Settings,
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

function DocumentUploadArea({ onUpload }: { onUpload: () => void }) {
  const documents = [
    { name: 'Audited Financial Statements (2-3 years)', required: true, uploaded: true },
    { name: 'Management Accounts', required: false, uploaded: true },
    { name: 'Bank Statements (6 months)', required: true, uploaded: true },
    { name: 'Existing Banking Facilities', required: false, uploaded: false },
    { name: 'CCRIS Report', required: true, uploaded: true },
    { name: 'CTOS Report', required: true, uploaded: true },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>Upload required documents for financial analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.name}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                doc.uploaded ? 'border-success/30 bg-success/5' : 'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`h-5 w-5 ${doc.uploaded ? 'text-success' : 'text-muted-foreground'}`} />
                <div>
                  <span className="text-sm font-medium text-foreground">{doc.name}</span>
                  {doc.required && <Badge variant="outline" className="ml-2 text-[10px]">Required</Badge>}
                </div>
              </div>
              {doc.uploaded ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Button variant="outline" size="sm">
                  Upload
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" onClick={onUpload}>
          <Sparkles className="h-4 w-4 mr-2" />
          Run AI Financial Analysis
        </Button>
      </CardContent>
    </Card>
  )
}

function CategoryCard({ category }: { category: UnderwritingCategory }) {
  const Icon = categoryIcons[category.name] || DollarSign

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <RiskBadge level={category.status} />
        </div>

        <h4 className="font-semibold text-foreground mb-1">{category.name}</h4>
        
        <div className="flex items-center gap-2 mb-3">
          <Progress value={category.score} className="flex-1 h-2" />
          <span className="text-sm font-medium text-foreground">{category.score}</span>
        </div>

        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{category.explanation}</p>

        <div className="space-y-2">
          {category.checks.map((check, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <StatusIcon status={check.status} />
                <span className="text-muted-foreground">{check.name}</span>
              </div>
              <span className="font-medium text-foreground">{check.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FinancialRatiosTable() {
  const { caseData } = useDashboardStore()
  const ratios = caseData?.underwritingResult?.financialRatios

  if (!ratios) return null

  const ratioRows = [
    { name: 'Gross Profit Margin', values: ratios.grossProfitMargin, format: (v: number) => `${v.toFixed(1)}%`, benchmark: '>20%' },
    { name: 'Net Profit Margin', values: ratios.netProfitMargin, format: (v: number) => `${v.toFixed(1)}%`, benchmark: '>5%' },
    { name: 'Debt-to-Equity', values: ratios.debtToEquity, format: (v: number) => `${v.toFixed(1)}x`, benchmark: '<2.0x' },
    { name: 'Current Ratio', values: ratios.currentRatio, format: (v: number) => `${v.toFixed(1)}x`, benchmark: '>1.2x' },
    { name: 'DSCR', values: ratios.dscr, format: (v: number) => `${v.toFixed(2)}x`, benchmark: '>1.2x' },
    { name: 'Debt-to-EBITDA', values: ratios.debtToEbitda, format: (v: number) => `${v.toFixed(1)}x`, benchmark: '<3.0x' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Financial Ratios</CardTitle>
        <CardDescription>AI-computed ratios from financial statements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Ratio</th>
                {ratios.years.map((year) => (
                  <th key={year} className="text-center p-3 text-xs font-medium text-muted-foreground">{year}</th>
                ))}
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ratioRows.map((row) => (
                <tr key={row.name} className="hover:bg-muted/30">
                  <td className="p-3 text-sm font-medium text-foreground">{row.name}</td>
                  {row.values.map((value, idx) => (
                    <td key={idx} className="p-3 text-sm text-center font-mono text-foreground">
                      {row.format(value)}
                    </td>
                  ))}
                  <td className="p-3 text-sm text-center text-muted-foreground">{row.benchmark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueChart() {
  const { caseData } = useDashboardStore()
  const data = caseData?.underwritingResult?.revenueData

  if (!data) return null

  const chartData = data.map((d) => ({
    year: d.year,
    Revenue: d.revenue / 1000000,
    Profit: d.profit / 1000000,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & Profitability Trend</CardTitle>
        <CardDescription>5-year financial performance (MYR millions)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="year" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
            <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="Revenue" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Profit" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function DebtChart() {
  const { caseData } = useDashboardStore()
  const data = caseData?.underwritingResult?.debtData

  if (!data) return null

  const chartData = data.map((d) => ({
    year: d.year,
    Debt: d.debt / 1000000,
    Equity: d.equity / 1000000,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt vs Equity</CardTitle>
        <CardDescription>Leverage position (MYR millions)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="year" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
            <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Debt" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Equity" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function UnderwritingStage() {
  const { caseData, isLoading, setLoading, setCaseData, updateCaseInList, currentCaseId, setCurrentStage, generateNarrative } = useDashboardStore()
  const [hasAnalysis, setHasAnalysis] = useState(!!caseData?.underwritingResult)

  // Update hasAnalysis when caseData changes
  useEffect(() => {
    setHasAnalysis(!!caseData?.underwritingResult)
  }, [caseData?.id, caseData?.underwritingResult])

  const underwritingResult = caseData?.underwritingResult

  const handleRunAnalysis = async () => {
    if (!caseData || !currentCaseId) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/underwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prospect: caseData.prospect,
          screeningResult: caseData.screeningResult 
        }),
      })

      if (!response.ok) throw new Error('Underwriting failed')

      // Parse SSE stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let underwritingResultData: UnderwritingResult | null = null

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
                underwritingResultData = parsed.output as UnderwritingResult
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      if (underwritingResultData) {
        const updatedCase = {
          ...caseData,
          underwritingResult: underwritingResultData,
          currentStage: 'underwriting' as const,
          timeline: [
            ...caseData.timeline,
            {
              id: `TL-${Date.now()}`,
              action: 'AI Financial Analysis completed',
              timestamp: new Date(),
              user: 'System',
            },
          ],
        }

        setCaseData(updatedCase)
        updateCaseInList(currentCaseId, {
          caseData: updatedCase,
          stage: 'underwriting',
          lastUpdated: new Date(),
          riskScore: underwritingResultData.overallScore,
        })
        setHasAnalysis(true)
      }
    } catch (error) {
      console.error('Underwriting error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasAnalysis || !underwritingResult) {
    return (
      <div className="space-y-6">
        <DocumentUploadArea onUpload={handleRunAnalysis} />
        
        {isLoading && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <div>
                  <h3 className="font-semibold text-foreground">Running AI Financial Analysis...</h3>
                  <p className="text-sm text-muted-foreground">Analyzing financial statements and computing key ratios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const getRecommendationStyle = (rec: string) => {
    if (rec === 'proceed' || rec === 'approve') return 'bg-success text-success-foreground'
    if (rec === 'probe' || rec === 'approve-conditions') return 'bg-warning text-warning-foreground'
    return 'bg-destructive text-destructive-foreground'
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">AI Financial Analysis Complete</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Company demonstrates improving financial health with adequate repayment capacity
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{underwritingResult.overallScore}</div>
                  <div className="text-xs text-muted-foreground">Credit Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{underwritingResult.confidenceScore}%</div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
              </div>
              
              <Badge className={`${getRecommendationStyle(underwritingResult.recommendation)} text-sm px-4 py-1.5`}>
                Proceed to Recommendation
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Ratios */}
      <FinancialRatiosTable />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <DebtChart />
      </div>

      {/* Risk Categories */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Risk Category Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {underwritingResult.categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setCurrentStage('screening')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Screening
        </Button>
        
        <Button onClick={() => {
          generateNarrative()
          setCurrentStage('narrative')
        }}>
          Generate Credit Narrative
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
