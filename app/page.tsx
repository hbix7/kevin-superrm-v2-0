'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { CaseHeader } from '@/components/case-header'
import { ScreeningStage } from '@/components/stages/screening-stage'
import { UnderwritingStage } from '@/components/stages/underwriting-stage'
import { NarrativeStage } from '@/components/stages/narrative-stage'
import { AiCopilot } from '@/components/ai-copilot'
import { CaseTimeline } from '@/components/case-timeline'
import { DocumentsPanel } from '@/components/documents-panel'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { MessageSquare, Bell, Search } from 'lucide-react'

export default function DashboardPage() {
  const { currentStage, toggleAiCopilot, aiCopilotOpen } = useDashboardStore()

  const renderStage = () => {
    switch (currentStage) {
      case 'screening':
        return <ScreeningStage />
      case 'underwriting':
        return <UnderwritingStage />
      case 'narrative':
        return <NarrativeStage />
      default:
        return <ScreeningStage />
    }
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
              <input
                type="search"
                placeholder="Search cases, companies..."
                className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button 
              variant={aiCopilotOpen ? 'default' : 'outline'} 
              size="sm"
              onClick={toggleAiCopilot}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Copilot</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-[1600px] mx-auto p-6">
            {/* Case Header */}
            <div className="mb-6">
              <CaseHeader />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Main Stage Content */}
              <div className="xl:col-span-9">
                {renderStage()}
              </div>

              {/* Right Sidebar */}
              <div className="xl:col-span-3 space-y-6">
                <CaseTimeline />
                <DocumentsPanel />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>

      {/* AI Copilot Panel */}
      <AiCopilot />
    </SidebarProvider>
  )
}
