'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Building2, 
  User, 
  FileText, 
  Upload, 
  X, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Sparkles,
  Bell,
  Search,
  FileSpreadsheet,
  FileCheck,
  CreditCard,
  Briefcase,
  Calendar,
  DollarSign,
  Hash,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import type { Prospect } from '@/lib/types'

const industries = [
  'Manufacturing - Electronics',
  'Manufacturing - Food & Beverage',
  'Manufacturing - Textiles',
  'Retail - General',
  'Retail - E-commerce',
  'Services - Professional',
  'Services - IT',
  'Construction',
  'Trading - Import/Export',
  'Trading - Wholesale',
  'Agriculture',
  'Transportation & Logistics',
  'Healthcare',
  'Hospitality',
  'Real Estate',
]

const financingPurposes = [
  'Working Capital',
  'Equipment Purchase',
  'Business Expansion',
  'Property Purchase',
  'Refinancing',
  'Inventory Financing',
  'Project Financing',
  'Trade Financing',
]

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  category: string
  uploadedAt: Date
  status: 'uploading' | 'uploaded' | 'error'
}

const documentCategories = [
  { id: 'financial', label: 'Financial Statements', icon: FileSpreadsheet, required: true },
  { id: 'management', label: 'Management Accounts', icon: FileText, required: true },
  { id: 'bank', label: 'Bank Statements', icon: CreditCard, required: true },
  { id: 'bureau', label: 'Credit Bureau Reports', icon: FileCheck, required: false },
  { id: 'registration', label: 'Company Registration', icon: Building2, required: true },
  { id: 'other', label: 'Other Documents', icon: Briefcase, required: false },
]

export default function NewClientPage() {
  const router = useRouter()
  const { initializeNewCase } = useDashboardStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [dragActive, setDragActive] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    registrationNumber: '',
    incorporationDate: '',
    registeredAddress: '',
    businessAddress: '',
    industry: '',
    yearsOfOperation: '',
    numberOfEmployees: '',
    website: '',
    
    // Director/Owner Information
    directorName: '',
    directorIC: '',
    directorPhone: '',
    directorEmail: '',
    ownershipPercentage: '',
    
    // Financial Information
    estimatedTurnover: '',
    lastYearRevenue: '',
    lastYearProfit: '',
    existingFacilities: '',
    
    // Financing Request
    requestedLoanAmount: '',
    financingPurpose: '',
    requestedTenure: '',
    proposedCollateral: '',
    additionalNotes: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDrag = useCallback((e: React.DragEvent, category: string, active: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(active ? category : null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, category: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files, category)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files, category)
    }
  }

  const handleFiles = (files: File[], category: string) => {
    const newDocs: UploadedDocument[] = files.map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      category,
      uploadedAt: new Date(),
      status: 'uploading' as const,
    }))
    
    setDocuments(prev => [...prev, ...newDocs])
    
    // Simulate upload
    newDocs.forEach(doc => {
      setTimeout(() => {
        setDocuments(prev => 
          prev.map(d => d.id === doc.id ? { ...d, status: 'uploaded' as const } : d)
        )
      }, 1500 + Math.random() * 1000)
    })
  }

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getDocumentsByCategory = (category: string) => {
    return documents.filter(d => d.category === category)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Create prospect from form data
    const prospect: Prospect = {
      id: `PROSPECT-${Date.now()}`,
      companyName: formData.companyName,
      registrationNumber: formData.registrationNumber,
      industry: formData.industry,
      yearsOfOperation: parseInt(formData.yearsOfOperation) || 0,
      estimatedTurnover: parseFloat(formData.estimatedTurnover) || 0,
      financingPurpose: formData.financingPurpose,
      requestedLoanAmount: parseFloat(formData.requestedLoanAmount) || 0,
      directorName: formData.directorName,
      createdAt: new Date(),
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    initializeNewCase(prospect)
    // Navigate to the case detail page
    const caseId = `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
    router.push(`/cases/${caseId}`)
  }

  const getCompletionPercentage = () => {
    const requiredFields = [
      formData.companyName,
      formData.registrationNumber,
      formData.industry,
      formData.yearsOfOperation,
      formData.directorName,
      formData.estimatedTurnover,
      formData.requestedLoanAmount,
      formData.financingPurpose,
    ]
    const filledFields = requiredFields.filter(f => f && f.trim() !== '').length
    return Math.round((filledFields / requiredFields.length) * 100)
  }

  const steps = [
    { id: 1, label: 'Company Info', icon: Building2 },
    { id: 2, label: 'Director Info', icon: User },
    { id: 3, label: 'Financials', icon: DollarSign },
    { id: 4, label: 'Documents', icon: FileText },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-2" />
          
          <div className="flex-1 flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/cases')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container max-w-5xl mx-auto p-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">Create New Client</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter client information and upload required documents to begin credit assessment
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = currentStep === step.id
                    const isCompleted = currentStep > step.id
                    
                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <button
                          onClick={() => setCurrentStep(step.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : isCompleted 
                                ? 'bg-success/10 text-success' 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            isActive 
                              ? 'bg-primary-foreground/20' 
                              : isCompleted 
                                ? 'bg-success/20' 
                                : 'bg-muted-foreground/20'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Icon className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                        </button>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 ${
                            currentStep > step.id ? 'bg-success' : 'bg-border'
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Form Completion</span>
                    <span>{getCompletionPercentage()}%</span>
                  </div>
                  <Progress value={getCompletionPercentage()} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic company details and registration information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Business Registration No. *</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="registrationNumber"
                          className="pl-9"
                          value={formData.registrationNumber}
                          onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                          placeholder="e.g., 201901001234"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incorporationDate">Incorporation Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="incorporationDate"
                          type="date"
                          className="pl-9"
                          value={formData.incorporationDate}
                          onChange={(e) => handleInputChange('incorporationDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfOperation">Years of Operation *</Label>
                      <Input
                        id="yearsOfOperation"
                        type="number"
                        value={formData.yearsOfOperation}
                        onChange={(e) => handleInputChange('yearsOfOperation', e.target.value)}
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select 
                        value={formData.industry} 
                        onValueChange={(value) => handleInputChange('industry', value)}
                      >
                        <SelectTrigger>
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
                      <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                      <Input
                        id="numberOfEmployees"
                        type="number"
                        value={formData.numberOfEmployees}
                        onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="registeredAddress">Registered Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="registeredAddress"
                        className="pl-9 min-h-[80px]"
                        value={formData.registeredAddress}
                        onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                        placeholder="Enter registered business address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business/Operating Address (if different)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="businessAddress"
                        className="pl-9 min-h-[80px]"
                        value={formData.businessAddress}
                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                        placeholder="Enter business operating address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Company Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        className="pl-9"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Director/Owner Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Director / Owner Information
                  </CardTitle>
                  <CardDescription>
                    Enter the details of the company director or owner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="directorName">Director/Owner Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="directorName"
                          className="pl-9"
                          value={formData.directorName}
                          onChange={(e) => handleInputChange('directorName', e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="directorIC">IC/Passport Number</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="directorIC"
                          className="pl-9"
                          value={formData.directorIC}
                          onChange={(e) => handleInputChange('directorIC', e.target.value)}
                          placeholder="e.g., 880101-10-1234"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="directorPhone">Contact Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="directorPhone"
                          className="pl-9"
                          value={formData.directorPhone}
                          onChange={(e) => handleInputChange('directorPhone', e.target.value)}
                          placeholder="+60 12-345 6789"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="directorEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="directorEmail"
                          type="email"
                          className="pl-9"
                          value={formData.directorEmail}
                          onChange={(e) => handleInputChange('directorEmail', e.target.value)}
                          placeholder="director@company.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownershipPercentage">Ownership Percentage</Label>
                    <div className="relative">
                      <Input
                        id="ownershipPercentage"
                        type="number"
                        value={formData.ownershipPercentage}
                        onChange={(e) => handleInputChange('ownershipPercentage', e.target.value)}
                        placeholder="e.g., 51"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Director Screening Note</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The AI will automatically screen the director for bankruptcy records, litigation history,
                          AML/sanctions exposure, and directorship history during the Rapid Screening stage.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Financial Information */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financial Information & Financing Request
                  </CardTitle>
                  <CardDescription>
                    Enter the company financial overview and financing requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Current Financials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estimatedTurnover">Estimated Annual Turnover (MYR) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">RM</span>
                          <Input
                            id="estimatedTurnover"
                            type="number"
                            className="pl-10"
                            value={formData.estimatedTurnover}
                            onChange={(e) => handleInputChange('estimatedTurnover', e.target.value)}
                            placeholder="5,000,000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastYearRevenue">Last Year Revenue (MYR)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">RM</span>
                          <Input
                            id="lastYearRevenue"
                            type="number"
                            className="pl-10"
                            value={formData.lastYearRevenue}
                            onChange={(e) => handleInputChange('lastYearRevenue', e.target.value)}
                            placeholder="4,500,000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastYearProfit">Last Year Net Profit (MYR)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">RM</span>
                          <Input
                            id="lastYearProfit"
                            type="number"
                            className="pl-10"
                            value={formData.lastYearProfit}
                            onChange={(e) => handleInputChange('lastYearProfit', e.target.value)}
                            placeholder="500,000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Existing Banking Facilities</h3>
                    <div className="space-y-2">
                      <Label htmlFor="existingFacilities">Current Banking Facilities (if any)</Label>
                      <Textarea
                        id="existingFacilities"
                        value={formData.existingFacilities}
                        onChange={(e) => handleInputChange('existingFacilities', e.target.value)}
                        placeholder="e.g., Term Loan RM 500,000 with Bank A, Trade Line RM 200,000 with Bank B"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Financing Request</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requestedLoanAmount">Requested Loan Amount (MYR) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">RM</span>
                          <Input
                            id="requestedLoanAmount"
                            type="number"
                            className="pl-10"
                            value={formData.requestedLoanAmount}
                            onChange={(e) => handleInputChange('requestedLoanAmount', e.target.value)}
                            placeholder="1,000,000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="financingPurpose">Financing Purpose *</Label>
                        <Select 
                          value={formData.financingPurpose} 
                          onValueChange={(value) => handleInputChange('financingPurpose', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            {financingPurposes.map((purpose) => (
                              <SelectItem key={purpose} value={purpose}>
                                {purpose}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requestedTenure">Requested Tenure</Label>
                        <Select 
                          value={formData.requestedTenure} 
                          onValueChange={(value) => handleInputChange('requestedTenure', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 months</SelectItem>
                            <SelectItem value="24">24 months</SelectItem>
                            <SelectItem value="36">36 months</SelectItem>
                            <SelectItem value="48">48 months</SelectItem>
                            <SelectItem value="60">60 months</SelectItem>
                            <SelectItem value="84">84 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="proposedCollateral">Proposed Collateral</Label>
                        <Input
                          id="proposedCollateral"
                          value={formData.proposedCollateral}
                          onChange={(e) => handleInputChange('proposedCollateral', e.target.value)}
                          placeholder="e.g., Property, Equipment, Personal Guarantee"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                        placeholder="Any additional information relevant to the financing request"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Document Upload
                    </CardTitle>
                    <CardDescription>
                      Upload required documents for credit assessment. Accepted formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {documentCategories.map((category) => {
                      const categoryDocs = getDocumentsByCategory(category.id)
                      const Icon = category.icon
                      
                      return (
                        <div key={category.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">{category.label}</h3>
                            {category.required && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Required</Badge>
                            )}
                          </div>
                          
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                              dragActive === category.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/50'
                            }`}
                            onDragEnter={(e) => handleDrag(e, category.id, true)}
                            onDragLeave={(e) => handleDrag(e, category.id, false)}
                            onDragOver={(e) => handleDrag(e, category.id, true)}
                            onDrop={(e) => handleDrop(e, category.id)}
                          >
                            <div className="flex flex-col items-center gap-2 text-center">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-foreground">
                                  Drag and drop files here, or{' '}
                                  <label className="text-primary cursor-pointer hover:underline">
                                    browse
                                    <input
                                      type="file"
                                      className="hidden"
                                      multiple
                                      onChange={(e) => handleFileInput(e, category.id)}
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    />
                                  </label>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Maximum file size: 25MB per file
                                </p>
                              </div>
                            </div>
                          </div>

                          {categoryDocs.length > 0 && (
                            <div className="space-y-2">
                              {categoryDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                                >
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(doc.size)}
                                    </p>
                                  </div>
                                  {doc.status === 'uploading' && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                      <span className="text-xs text-muted-foreground">Uploading...</span>
                                    </div>
                                  )}
                                  {doc.status === 'uploaded' && (
                                    <Badge className="bg-success/10 text-success hover:bg-success/20">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Uploaded
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeDocument(doc.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-base">Submission Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Company</p>
                        <p className="text-sm font-medium">{formData.companyName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Industry</p>
                        <p className="text-sm font-medium">{formData.industry?.split(' - ')[0] || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Loan Amount</p>
                        <p className="text-sm font-medium">
                          {formData.requestedLoanAmount 
                            ? `RM ${parseInt(formData.requestedLoanAmount).toLocaleString()}`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Documents</p>
                        <p className="text-sm font-medium">{documents.filter(d => d.status === 'uploaded').length} files uploaded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                    className="gap-2"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || getCompletionPercentage() < 75}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Creating Case...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Create Case & Start Screening
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
