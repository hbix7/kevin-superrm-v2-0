'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDashboardStore } from '@/lib/store'
import type { Prospect } from '@/lib/types'

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
]

interface ProspectFormProps {
  onComplete?: () => void
}

export function ProspectForm({ onComplete }: ProspectFormProps) {
  const { initializeNewCase, runScreening, isLoading } = useDashboardStore()
  const [formData, setFormData] = useState({
    companyName: 'Precision Manufacturing Sdn Bhd',
    registrationNumber: '201801012345',
    industry: 'Manufacturing - Metal Components',
    yearsOfOperation: '6',
    estimatedTurnover: '9100000',
    financingPurpose: 'Working Capital & Equipment Purchase',
    requestedLoanAmount: '2500000',
    directorName: 'Ahmad bin Hassan',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const prospect: Prospect = {
      id: `PROS-${Date.now()}`,
      companyName: formData.companyName,
      registrationNumber: formData.registrationNumber,
      industry: formData.industry,
      yearsOfOperation: parseInt(formData.yearsOfOperation),
      estimatedTurnover: parseFloat(formData.estimatedTurnover),
      financingPurpose: formData.financingPurpose,
      requestedLoanAmount: parseFloat(formData.requestedLoanAmount),
      directorName: formData.directorName,
      createdAt: new Date(),
    }

    initializeNewCase(prospect)
    await runScreening()
    onComplete?.()
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
