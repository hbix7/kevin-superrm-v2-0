'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Plus, 
  Search, 
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  SearchCheck,
  ShieldCheck,
  Clock,
  CircleDot,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react'
import { useDashboardStore, CaseListItem } from '@/lib/store'
import type { WorkflowStage } from '@/lib/types'

interface ChatSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  onNewChat: () => void
  onSelectCase: (caseId: string) => void
  selectedCaseId?: string | null
}

// Stage icons mapping
function StageIcon({ stage, className }: { stage: WorkflowStage; className?: string }) {
  const icons = {
    screening: SearchCheck,
    underwriting: ShieldCheck,
    narrative: FileText,
  }
  const Icon = icons[stage] || CircleDot
  return <Icon className={className} />
}

// Status configuration with conversational labels
const STATUS_CONFIG = {
  in_progress: { 
    label: 'In Progress', 
    shortLabel: 'Active',
    className: 'bg-info/15 text-info border-info/30',
    dotClassName: 'bg-info'
  },
  pending_approval: { 
    label: 'Pending Approval', 
    shortLabel: 'Pending',
    className: 'bg-warning/15 text-warning border-warning/30',
    dotClassName: 'bg-warning'
  },
  approved: { 
    label: 'Approved', 
    shortLabel: 'Approved',
    className: 'bg-success/15 text-success border-success/30',
    dotClassName: 'bg-success'
  },
  declined: { 
    label: 'Declined', 
    shortLabel: 'Declined',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
    dotClassName: 'bg-destructive'
  },
}

// Stage labels for conversational display
const STAGE_LABELS: Record<WorkflowStage, string> = {
  screening: 'Screening',
  underwriting: 'Underwriting',
  narrative: 'Narrative',
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `MYR ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `MYR ${(amount / 1000).toFixed(0)}K`
  }
  return `MYR ${amount.toLocaleString()}`
}

function CaseCard({ 
  caseItem, 
  isSelected, 
  onClick 
}: { 
  caseItem: CaseListItem
  isSelected: boolean
  onClick: () => void 
}) {
  const statusConfig = STATUS_CONFIG[caseItem.status]
  const stageLabel = STAGE_LABELS[caseItem.stage]
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl transition-all duration-200',
        'border border-transparent',
        'hover:border-sidebar-border/50',
        isSelected
          ? 'bg-sidebar-accent border-sidebar-primary/30 shadow-sm'
          : 'hover:bg-sidebar-accent/40'
      )}
    >
      {/* Header: Company name */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className={cn(
            'mt-0.5 p-1.5 rounded-lg shrink-0',
            isSelected ? 'bg-sidebar-primary/20' : 'bg-sidebar-accent'
          )}>
            <Building2 className="h-4 w-4 text-sidebar-foreground/70" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={cn(
              'font-semibold text-sm leading-tight text-sidebar-foreground',
              'break-words hyphens-auto'
            )}>
              {caseItem.companyName}
            </h4>
          </div>
        </div>
        
        {/* Amount aligned right */}
        <span className={cn(
          'text-sm font-medium shrink-0',
          isSelected ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
        )}>
          {formatCurrency(caseItem.loanAmount)}
        </span>
      </div>
      
      {/* Secondary info: Case ID and Type */}
      <div className="flex items-center gap-2 mb-3 pl-9">
        <span className="text-xs text-sidebar-foreground/50 font-mono">
          {caseItem.id}
        </span>
        <span className="text-sidebar-foreground/30">·</span>
        <div className="flex items-center gap-1 text-xs text-sidebar-foreground/60">
          <StageIcon stage={caseItem.stage} className="h-3 w-3" />
          <span>{stageLabel}</span>
        </div>
      </div>
      
      {/* Status badge and score */}
      <div className="flex items-center justify-between pl-9">
        <Badge 
          variant="outline" 
          className={cn(
            'text-[10px] font-medium px-2 py-0.5 rounded-full',
            statusConfig.className
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', statusConfig.dotClassName)} />
          {statusConfig.shortLabel}
        </Badge>
        
        {caseItem.riskScore !== null && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            caseItem.riskScore >= 70 ? 'text-success' : 
            caseItem.riskScore >= 50 ? 'text-warning' : 'text-destructive'
          )}>
            <Sparkles className="h-3 w-3" />
            <span>Score {caseItem.riskScore}</span>
          </div>
        )}
      </div>
      
      {/* Conversational context line */}
      <p className="text-[11px] text-sidebar-foreground/40 mt-2.5 pl-9 italic">
        {caseItem.status === 'in_progress' && `At ${stageLabel.toLowerCase()} stage`}
        {caseItem.status === 'pending_approval' && `Ready for approval review`}
        {caseItem.status === 'approved' && `Approved for ${formatCurrency(caseItem.loanAmount)}`}
        {caseItem.status === 'declined' && `Application declined`}
      </p>
    </button>
  )
}

function CaseGroup({ 
  title, 
  cases, 
  selectedCaseId, 
  onSelectCase,
  defaultOpen = true,
  icon: Icon
}: { 
  title: string
  cases: CaseListItem[]
  selectedCaseId?: string | null
  onSelectCase: (caseId: string) => void
  defaultOpen?: boolean
  icon: React.ComponentType<{ className?: string }>
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  if (cases.length === 0) return null
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg',
          'text-sidebar-foreground/70 hover:text-sidebar-foreground',
          'hover:bg-sidebar-accent/30 transition-colors'
        )}>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {title}
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-sidebar-accent text-sidebar-foreground/60">
              {cases.length}
            </Badge>
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">
        <div className="space-y-1">
          {cases.map((c) => (
            <CaseCard
              key={c.id}
              caseItem={c}
              isSelected={selectedCaseId === c.id}
              onClick={() => onSelectCase(c.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ChatSidebar({ 
  isCollapsed, 
  onToggle, 
  onNewChat, 
  onSelectCase,
  selectedCaseId 
}: ChatSidebarProps) {
  const { cases } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredCases = useMemo(() => {
    return cases.filter(c => 
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [cases, searchQuery])
  
  // Group cases by status
  const groupedCases = useMemo(() => ({
    inProgress: filteredCases.filter(c => c.status === 'in_progress'),
    pending: filteredCases.filter(c => c.status === 'pending_approval'),
    approved: filteredCases.filter(c => c.status === 'approved'),
    declined: filteredCases.filter(c => c.status === 'declined'),
  }), [filteredCases])

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        <Button
          size="icon"
          onClick={onNewChat}
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-10 w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        <div className="w-8 h-px bg-sidebar-border my-1" />
        
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-1.5 px-2">
            {cases.slice(0, 8).map((c) => {
              const statusConfig = STATUS_CONFIG[c.status]
              return (
                <Button
                  key={c.id}
                  variant="ghost"
                  size="icon"
                  onClick={() => onSelectCase(c.id)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-sidebar-foreground relative',
                    selectedCaseId === c.id 
                      ? 'bg-sidebar-accent ring-1 ring-sidebar-primary/50' 
                      : 'hover:bg-sidebar-accent/50'
                  )}
                  title={`${c.companyName} - ${c.status.replace('_', ' ')}`}
                >
                  <Building2 className="h-4 w-4" />
                  <span className={cn(
                    'absolute bottom-1 right-1 w-2 h-2 rounded-full',
                    statusConfig.dotClassName
                  )} />
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sidebar-foreground text-lg">
            Assessments
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* New Assessment Button */}
        <Button 
          onClick={onNewChat}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-11 rounded-xl font-medium shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>
      
      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
          <Input
            placeholder="Search by name or case ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'pl-9 h-10 rounded-xl',
              'bg-sidebar-accent/40 border-sidebar-border/50',
              'text-sidebar-foreground placeholder:text-sidebar-foreground/40',
              'focus:bg-sidebar-accent focus:border-sidebar-primary/50'
            )}
          />
        </div>
      </div>
      
      {/* Cases list grouped by status - Scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-2 pb-4 space-y-2">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-sidebar-accent mx-auto mb-3 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-sidebar-foreground/40" />
                </div>
                <p className="text-sm text-sidebar-foreground/60 font-medium">No cases found</p>
                <p className="text-xs text-sidebar-foreground/40 mt-1">
                  {searchQuery ? 'Try a different search term' : 'Start a new assessment'}
                </p>
              </div>
            ) : (
              <>
                <CaseGroup
                  title="In Progress"
                  cases={groupedCases.inProgress}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={onSelectCase}
                  defaultOpen={true}
                  icon={Clock}
                />
                
                <CaseGroup
                  title="Pending Approval"
                  cases={groupedCases.pending}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={onSelectCase}
                  defaultOpen={true}
                  icon={CircleDot}
                />
                
                <CaseGroup
                  title="Approved"
                  cases={groupedCases.approved}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={onSelectCase}
                  defaultOpen={false}
                  icon={CheckCircle2}
                />
                
                <CaseGroup
                  title="Declined"
                  cases={groupedCases.declined}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={onSelectCase}
                  defaultOpen={false}
                  icon={XCircle}
                />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
