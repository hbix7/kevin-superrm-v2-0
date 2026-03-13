'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  User,
  Bell,
  Shield,
  Palette,
  Zap,
  Building2,
  Mail,
  Phone,
  Save,
  CheckCircle2
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

export function SettingsDialog() {
  const { settingsOpen, toggleSettings, settings, updateSettings } = useDashboardStore()
  const [saved, setSaved] = useState(false)
  
  const [formState, setFormState] = useState({
    fullName: settings.user.fullName,
    email: settings.user.email,
    phone: settings.user.phone,
    department: settings.user.department,
    branch: settings.user.branch,
  })

  const handleSave = () => {
    updateSettings({
      user: {
        ...settings.user,
        ...formState,
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Dialog open={settingsOpen} onOpenChange={toggleSettings}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">AI Settings</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {formState.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{formState.fullName}</p>
                    <p className="text-sm text-muted-foreground">Relationship Manager</p>
                    <Badge variant="outline" className="mt-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Level 2 Approver
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formState.fullName}
                      onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formState.department}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select 
                      value={formState.branch} 
                      onValueChange={(value) => setFormState({ ...formState, branch: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kuala Lumpur HQ">Kuala Lumpur HQ</SelectItem>
                        <SelectItem value="Petaling Jaya">Petaling Jaya</SelectItem>
                        <SelectItem value="Johor Bahru">Johor Bahru</SelectItem>
                        <SelectItem value="Penang">Penang</SelectItem>
                        <SelectItem value="Ipoh">Ipoh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your cases
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        notifications: { ...settings.notifications, email: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Case Status Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when case status changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.caseUpdates}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        notifications: { ...settings.notifications, caseUpdates: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Analysis Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when AI finishes processing
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.aiComplete}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        notifications: { ...settings.notifications, aiComplete: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Approval Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of pending approvals
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.approvalRequests}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        notifications: { ...settings.notifications, approvalRequests: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Copilot Settings</CardTitle>
                <CardDescription>Configure AI assistant behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-suggest Questions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show AI suggested questions based on context
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.autoSuggest}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        ai: { ...settings.ai, autoSuggest: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Explanations</Label>
                    <p className="text-sm text-muted-foreground">
                      Include detailed reasoning in AI responses
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.showExplanations}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        ai: { ...settings.ai, showExplanations: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Response Detail Level</Label>
                  <Select 
                    value={settings.ai.detailLevel}
                    onValueChange={(value: 'brief' | 'standard' | 'detailed') => 
                      updateSettings({
                        ai: { ...settings.ai, detailLevel: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief - Quick summaries</SelectItem>
                      <SelectItem value="standard">Standard - Balanced detail</SelectItem>
                      <SelectItem value="detailed">Detailed - In-depth analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Assessment Settings</CardTitle>
                <CardDescription>Configure AI risk analysis parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Risk Appetite</Label>
                  <Select 
                    value={settings.ai.riskAppetite}
                    onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
                      updateSettings({
                        ai: { ...settings.ai, riskAppetite: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative - Lower risk tolerance</SelectItem>
                      <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                      <SelectItem value="aggressive">Aggressive - Higher risk tolerance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-run Screening</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start screening when prospect is added
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.autoRunScreening}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        ai: { ...settings.ai, autoRunScreening: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Display Preferences</CardTitle>
                <CardDescription>Customize your dashboard appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={settings.preferences.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      updateSettings({
                        preferences: { ...settings.preferences, theme: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select 
                    value={settings.preferences.currency}
                    onValueChange={(value) => 
                      updateSettings({
                        preferences: { ...settings.preferences, currency: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => 
                      updateSettings({
                        preferences: { ...settings.preferences, dateFormat: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show more data with less spacing
                    </p>
                  </div>
                  <Switch
                    checked={settings.preferences.compactMode}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        preferences: { ...settings.preferences, compactMode: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Risk Indicators</Label>
                    <p className="text-sm text-muted-foreground">
                      Display color-coded risk badges
                    </p>
                  </div>
                  <Switch
                    checked={settings.preferences.showRiskIndicators}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        preferences: { ...settings.preferences, showRiskIndicators: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={toggleSettings}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
