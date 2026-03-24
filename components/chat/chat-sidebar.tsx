'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { useDashboardStore, CaseListItem } from '@/lib/store'

interface ChatSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  onNewChat: () => void
  onSelectCase: (caseId: string) => void
  selectedCaseId?: string | null
}

function StatusBadge({ status }: { status: CaseListItem['status'] }) {
  const config = {
    in_progress: { label: 'In Progress', className: 'bg-info/10 text-info border-info/20', icon: Clock },
    pending_approval: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20', icon: AlertTriangle },
    approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
    declined: { label: 'Declined', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  }
  
  const { label, className, icon: Icon } = config[status]
  
  return (
    <Badge variant="outline" className={cn('text-[10px] gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
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
  
  const filteredCases = cases.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isCollapsed) {
    return (
      <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        <div className="w-8 h-px bg-sidebar-border my-2" />
        
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-2 px-2">
            {cases.slice(0, 10).map((c) => (
              <Button
                key={c.id}
                variant="ghost"
                size="icon"
                onClick={() => onSelectCase(c.id)}
                className={cn(
                  'w-10 h-10 rounded-lg text-sidebar-foreground',
                  selectedCaseId === c.id 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'hover:bg-sidebar-accent/50'
                )}
                title={c.companyName}
              >
                <Building2 className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">Conversations</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
          />
        </div>
      </div>
      
      {/* Cases list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredCases.length === 0 ? (
            <div className="text-center py-8 text-sidebar-foreground/50">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cases found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    selectedCaseId === c.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm truncate flex-1">
                      {c.companyName}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                    <span>{c.id}</span>
                    <span>|</span>
                    <span className="capitalize">{c.stage}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-sidebar-foreground/50">
                      MYR {c.loanAmount.toLocaleString()}
                    </span>
                    {c.riskScore !== null && (
                      <span className={cn(
                        'font-medium',
                        c.riskScore >= 70 ? 'text-success' : 
                        c.riskScore >= 50 ? 'text-warning' : 'text-destructive'
                      )}>
                        Score: {c.riskScore}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
