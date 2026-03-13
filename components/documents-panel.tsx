'use client'

import { FileText, Download, Eye, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboardStore } from '@/lib/store'

const documentTypeColors: Record<string, string> = {
  'Financial Statement': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  'Bank Statement': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Bureau Report': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  'Company Document': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
}

export function DocumentsPanel() {
  const { caseData } = useDashboardStore()

  if (!caseData) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-MY', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Documents
          </CardTitle>
          <Button variant="outline" size="sm">
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="px-4 pb-4 space-y-2">
            {caseData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${documentTypeColors[doc.type] || ''}`}
                    >
                      {doc.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
