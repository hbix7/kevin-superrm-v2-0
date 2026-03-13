'use client'

import { Clock, User, Bot, FileText, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboardStore } from '@/lib/store'

export function CaseTimeline() {
  const { caseData } = useDashboardStore()

  if (!caseData) return null

  const getTimelineIcon = (action: string) => {
    if (action.includes('AI') || action.includes('System')) return Bot
    if (action.includes('uploaded') || action.includes('document')) return FileText
    if (action.includes('Decision') || action.includes('completed')) return CheckCircle2
    return User
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-MY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          Case Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="px-4 pb-4">
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
              
              <div className="space-y-4">
                {caseData.timeline.slice().reverse().map((event, idx) => {
                  const Icon = getTimelineIcon(event.action)
                  const isSystem = event.user === 'System'
                  
                  return (
                    <div key={event.id} className="relative flex gap-4 pl-8">
                      <div className={`
                        absolute left-0 flex h-6 w-6 items-center justify-center rounded-full
                        ${isSystem ? 'bg-primary/10' : 'bg-muted'}
                      `}>
                        <Icon className={`h-3 w-3 ${isSystem ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-tight">{event.action}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{event.user}</span>
                          <span className="text-border">|</span>
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
