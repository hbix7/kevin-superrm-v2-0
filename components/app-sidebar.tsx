'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Building2, 
  FileSearch, 
  FileText, 
  LayoutDashboard, 
  MessageSquare,
  Settings,
  User,
  ChevronRight,
  Sparkles,
  Plus,
  FolderOpen
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/lib/store'
import type { WorkflowStage } from '@/lib/types'

const workflowStages: { id: WorkflowStage; label: string; icon: React.ElementType; step: number }[] = [
  { id: 'screening', label: 'Rapid Screening', icon: FileSearch, step: 1 },
  { id: 'underwriting', label: 'Full Underwriting', icon: LayoutDashboard, step: 2 },
  { id: 'narrative', label: 'Risk Narrative', icon: FileText, step: 3 },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentStage, setCurrentStage, caseData, toggleAiCopilot, toggleSettings } = useDashboardStore()
  
  const isNewClientPage = pathname === '/clients/new'

  const getStageStatus = (stageId: WorkflowStage) => {
    const stageOrder = { screening: 1, underwriting: 2, narrative: 3 }
    const currentOrder = stageOrder[currentStage]
    const thisOrder = stageOrder[stageId]
    
    if (thisOrder < currentOrder) return 'completed'
    if (thisOrder === currentOrder) return 'current'
    return 'pending'
  }

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-sidebar-foreground">Super RM</h1>
            <p className="text-xs text-sidebar-foreground/60">AI Relationship Manager</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Case Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider">
            Case Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isNewClientPage}
                  onClick={() => router.push('/clients/new')}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Client</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={pathname === '/cases' || pathname === '/'}
                  onClick={() => router.push('/cases')}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>All Cases</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Current Case */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider">
            Current Case
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {caseData && !isNewClientPage ? (
              <div className="px-2 py-2">
                <div className="rounded-lg bg-sidebar-accent/50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-sidebar-foreground/70" />
                    <span className="text-sm font-medium text-sidebar-foreground truncate">
                      {caseData.prospect.companyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                    <span>{caseData.id}</span>
                    <span className="text-sidebar-border">|</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sidebar-border text-sidebar-foreground/70">
                      {caseData.prospect.industry.split(' - ')[0]}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-2 py-2">
                <div className="rounded-lg border border-dashed border-sidebar-border p-3 text-center">
                  <p className="text-xs text-sidebar-foreground/50">No active case</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary h-auto p-0 mt-1"
                    onClick={() => router.push('/clients/new')}
                  >
                    Create new client
                  </Button>
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider">
            Workflow Stages
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowStages.map((stage) => {
                const status = getStageStatus(stage.id)
                const Icon = stage.icon
                return (
                  <SidebarMenuItem key={stage.id}>
                    <SidebarMenuButton
                      isActive={stage.id === currentStage}
                      onClick={() => setCurrentStage(stage.id)}
                      className="group relative"
                    >
                      <div className={`
                        flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                        ${status === 'completed' ? 'bg-success text-success-foreground' : ''}
                        ${status === 'current' ? 'bg-primary text-primary-foreground' : ''}
                        ${status === 'pending' ? 'bg-sidebar-accent text-sidebar-foreground/50' : ''}
                      `}>
                        {status === 'completed' ? (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          stage.step
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{stage.label}</span>
                        <span className="text-[10px] text-sidebar-foreground/50">
                          {status === 'completed' && 'Completed'}
                          {status === 'current' && 'In Progress'}
                          {status === 'pending' && 'Pending'}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-sidebar-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleAiCopilot}>
                  <MessageSquare className="h-4 w-4" />
                  <span>AI Copilot</span>
                  <Badge className="ml-auto bg-primary/20 text-primary text-[10px] px-1.5">
                    AI
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleSettings}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="py-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  ST
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">Sarah Tan</span>
                <span className="text-xs text-sidebar-foreground/50">Relationship Manager</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
