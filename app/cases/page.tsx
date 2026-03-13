'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Plus,
  Bell,
  Filter,
  MoreHorizontal,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

// Mock cases data for the list
const mockCases = [
  {
    id: 'CASE-2026-00142',
    companyName: 'TechVenture Solutions Sdn Bhd',
    registrationNumber: '201901045678',
    industry: 'Services - IT',
    loanAmount: 2500000,
    stage: 'screening',
    riskScore: null,
    status: 'in_progress',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-03-10'),
    lastUpdated: new Date('2026-03-13'),
  },
  {
    id: 'CASE-2026-00138',
    companyName: 'Golden Harvest Trading',
    registrationNumber: '200801023456',
    industry: 'Trading - Import/Export',
    loanAmount: 5000000,
    stage: 'underwriting',
    riskScore: 68,
    status: 'in_progress',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-03-05'),
    lastUpdated: new Date('2026-03-12'),
  },
  {
    id: 'CASE-2026-00135',
    companyName: 'Precision Manufacturing',
    registrationNumber: '201501087654',
    industry: 'Manufacturing - Electronics',
    loanAmount: 8000000,
    stage: 'narrative',
    riskScore: 82,
    status: 'pending_approval',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-02-28'),
    lastUpdated: new Date('2026-03-11'),
  },
  {
    id: 'CASE-2026-00129',
    companyName: 'Fresh Foods Distribution',
    registrationNumber: '201201034567',
    industry: 'Trading - Wholesale',
    loanAmount: 3500000,
    stage: 'narrative',
    riskScore: 45,
    status: 'declined',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-02-20'),
    lastUpdated: new Date('2026-03-08'),
  },
  {
    id: 'CASE-2026-00122',
    companyName: 'BuildRight Construction',
    registrationNumber: '200901056789',
    industry: 'Construction',
    loanAmount: 12000000,
    stage: 'narrative',
    riskScore: 75,
    status: 'approved',
    rmName: 'Ahmad Razif',
    createdAt: new Date('2026-02-15'),
    lastUpdated: new Date('2026-03-05'),
  },
]

const getStageLabel = (stage: string) => {
  switch (stage) {
    case 'screening':
      return 'Rapid Screening'
    case 'underwriting':
      return 'Full Underwriting'
    case 'narrative':
      return 'Risk Narrative'
    default:
      return stage
  }
}

const getStageBadgeVariant = (stage: string) => {
  switch (stage) {
    case 'screening':
      return 'outline'
    case 'underwriting':
      return 'secondary'
    case 'narrative':
      return 'default'
    default:
      return 'outline'
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'in_progress':
      return { label: 'In Progress', className: 'bg-info/10 text-info border-info/20' }
    case 'pending_approval':
      return { label: 'Pending Approval', className: 'bg-warning/10 text-warning border-warning/20' }
    case 'approved':
      return { label: 'Approved', className: 'bg-success/10 text-success border-success/20' }
    case 'declined':
      return { label: 'Declined', className: 'bg-destructive/10 text-destructive border-destructive/20' }
    default:
      return { label: status, className: '' }
  }
}

const getRiskScoreColor = (score: number | null) => {
  if (score === null) return 'text-muted-foreground'
  if (score >= 70) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function CasesPage() {
  const router = useRouter()
  const { setCaseData, setCurrentStage } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredCases = mockCases.filter(c => {
    const matchesSearch = 
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.registrationNumber.includes(searchQuery)
    
    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'in_progress') return matchesSearch && c.status === 'in_progress'
    if (activeTab === 'pending') return matchesSearch && c.status === 'pending_approval'
    if (activeTab === 'completed') return matchesSearch && (c.status === 'approved' || c.status === 'declined')
    return matchesSearch
  })

  const handleOpenCase = (caseItem: typeof mockCases[0]) => {
    // Set the case data in the store and navigate to dashboard
    setCurrentStage(caseItem.stage as 'screening' | 'underwriting' | 'narrative')
    router.push(`/cases/${caseItem.id}`)
  }

  const stats = {
    total: mockCases.length,
    inProgress: mockCases.filter(c => c.status === 'in_progress').length,
    pending: mockCases.filter(c => c.status === 'pending_approval').length,
    approved: mockCases.filter(c => c.status === 'approved').length,
    totalValue: mockCases.reduce((sum, c) => sum + c.loanAmount, 0),
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-2" />
          
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cases, companies..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button onClick={() => router.push('/clients/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Client
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container max-w-7xl mx-auto p-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">Case Management</h1>
                  <p className="text-sm text-muted-foreground">
                    View and manage all credit assessment cases
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Cases</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                      <Clock className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stats.inProgress}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending Approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{formatCurrency(stats.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">Total Pipeline Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cases Table */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Cases</CardTitle>
                    <CardDescription>
                      Click on a case to continue assessment
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Cases</TabsTrigger>
                    <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                    <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[140px]">Case ID</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead className="text-right">Loan Amount</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead className="text-center">Risk Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCases.map((caseItem) => {
                            const statusBadge = getStatusBadge(caseItem.status)
                            return (
                              <TableRow 
                                key={caseItem.id} 
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleOpenCase(caseItem)}
                              >
                                <TableCell className="font-mono text-xs">
                                  {caseItem.id}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{caseItem.companyName}</p>
                                      <p className="text-xs text-muted-foreground">{caseItem.registrationNumber}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {caseItem.industry.split(' - ')[0]}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(caseItem.loanAmount)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getStageBadgeVariant(caseItem.stage) as 'outline' | 'secondary' | 'default'}>
                                    {getStageLabel(caseItem.stage)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {caseItem.riskScore !== null ? (
                                    <span className={`font-semibold ${getRiskScoreColor(caseItem.riskScore)}`}>
                                      {caseItem.riskScore}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">--</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={statusBadge.className}>
                                    {statusBadge.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(caseItem.lastUpdated)}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleOpenCase(caseItem)}>
                                        Open Case
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                      <DropdownMenuItem>Export Report</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {filteredCases.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="h-32 text-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                  <FileText className="h-8 w-8" />
                                  <p>No cases found</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => router.push('/clients/new')}
                                  >
                                    Create New Client
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
