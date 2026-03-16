'use client'

import { useState, useEffect } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDashboardStore } from '@/lib/store'
import type { Prospect, ScreeningResult } from '@/lib/types'

const industries = [
  'Manufacturing - Metal Components',
  'Manufacturing - Electronics',
  'Manufacturing - Food & Beverage',
  'Wholesale Trade',
  'Retail Trade',
  'Construction',
  'Transportation & Logistics',
  'Professional Services',
  'Technology & IT Services',
  'Healthcare',
  'Education',
  'Hospitality',
  'Services - IT',
  'Trading - Import/Export',
  'Trading - Wholesale',
]

interface ProspectFormProps {
  onComplete?: () => void
}

export function ProspectForm({ onComplete }: ProspectFormProps) {
  const { caseData, setCaseData, updateCaseInList, currentCaseId, setLoading, isLoading } = useDashboardStore()
  
  // Initialize form with existing case data if available
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    industry: '',
    yearsOfOperation: '',
    estimatedTurnover: '',
    financingPurpose: '',
    requestedLoanAmount: '',
    directorName: '',
  })
  
  // Populate form with case data when it changes
  useEffect(() => {
    if (caseData?.prospect) {
      setFormData({
        companyName: caseData.prospect.companyName || '',
        registrationNumber: caseData.prospect.registrationNumber || '',
        industry: caseData.prospect.industry || '',
        yearsOfOperation: caseData.prospect.yearsOfOperation?.toString() || '',
        estimatedTurnover: caseData.prospect.estimatedTurnover?.toString() || '',
        financingPurpose: caseData.prospect.financingPurpose || '',
        requestedLoanAmount: caseData.prospect.requestedLoanAmount?.toString() || '',
        directorName: caseData.prospect.directorName || '',
      })
    }
  }, [caseData?.prospect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Build prospect from form data
    const prospect: Prospect = {
      id: caseData?.prospect?.id || `PROS-${Date.now()}`,
      companyName: formData.companyName,
      registrationNumber: formData.registrationNumber,
      industry: formData.industry,
      yearsOfOperation: parseInt(formData.yearsOfOperation),
      estimatedTurnover: parseFloat(formData.estimatedTurnover),
      financingPurpose: formData.financingPurpose,
      requestedLoanAmount: parseFloat(formData.requestedLoanAmount),
      directorName: formData.directorName,
      createdAt: caseData?.prospect?.createdAt || new Date(),
    }

    try {
      // Call the real AI screening API
      const response = await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect }),
      })

      if (!response.ok) {
        throw new Error('Screening failed')
      }

      // Parse SSE stream to get the screening result
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let screeningResult: ScreeningResult | null = null

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
              // Look for the object output in the stream
              if (parsed.type === 'output' && parsed.output) {
                screeningResult = parsed.output as ScreeningResult
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      if (screeningResult && caseData && currentCaseId) {
        // Update the case with the AI-generated screening result
        const updatedCase = {
          ...caseData,
          prospect,
          screeningResult,
          timeline: [
            ...caseData.timeline,
            {
              id: `TL-${Date.now()}`,
              action: 'AI Rapid Screening completed',
              timestamp: new Date(),
              user: 'System',
            },
          ],
        }

        setCaseData(updatedCase)
        updateCaseInList(currentCaseId, {
          caseData: updatedCase,
          lastUpdated: new Date(),
          riskScore: screeningResult.overallScore,
          companyName: prospect.companyName,
          registrationNumber: prospect.registrationNumber,
          industry: prospect.industry,
          loanAmount: prospect.requestedLoanAmount,
        })
      }

      onComplete?.()
    } catch (error) {
      console.error('Screening error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Business Registration Number</Label>
          <Input
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            placeholder="e.g., 201801012345"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => setFormData({ ...formData, industry: value })}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfOperation">Years of Operation</Label>
          <Input
            id="yearsOfOperation"
            type="number"
            value={formData.yearsOfOperation}
            onChange={(e) => setFormData({ ...formData, yearsOfOperation: e.target.value })}
            placeholder="e.g., 5"
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedTurnover">Estimated Annual Turnover (MYR)</Label>
          <Input
            id="estimatedTurnover"
            type="number"
            value={formData.estimatedTurnover}
            onChange={(e) => setFormData({ ...formData, estimatedTurnover: e.target.value })}
            placeholder="e.g., 5000000"
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestedLoanAmount">Requested Loan Amount (MYR)</Label>
          <Input
            id="requestedLoanAmount"
            type="number"
            value={formData.requestedLoanAmount}
            onChange={(e) => setFormData({ ...formData, requestedLoanAmount: e.target.value })}
            placeholder="e.g., 1000000"
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="directorName">Director / Owner Name</Label>
          <Input
            id="directorName"
            value={formData.directorName}
            onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
            placeholder="Enter director name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="financingPurpose">Financing Purpose</Label>
          <Input
            id="financingPurpose"
            value={formData.financingPurpose}
            onChange={(e) => setFormData({ ...formData, financingPurpose: e.target.value })}
            placeholder="e.g., Working Capital"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="min-w-[200px]">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running AI Screening...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Run AI Screening
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
