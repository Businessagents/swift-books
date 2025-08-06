import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PrivacyToggle } from "@/components/ui/privacy-toggle"
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  CreditCard, 
  FileText, 
  MapPin, 
  Mail,
  Phone,
  Building,
  Save,
  Download,
  Upload,
  Trash2,
  Key,
  Globe,
  Calendar,
  Clock,
  DollarSign
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Settings = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock settings state - in real app, this would come from context/API
  const [settings, setSettings] = useState({
    // Profile settings
    businessName: "Swift Consulting Inc.",
    ownerName: "John Smith",
    email: "john@swiftconsulting.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, Vancouver, BC V6B 1A1",
    
    // Business settings
    fiscalYearStart: "01-01",
    defaultCurrency: "CAD",
    timeZone: "America/Vancouver",
    businessNumber: "123456789RT0001",
    
    // Notification settings
    emailNotifications: true,
    invoiceReminders: true,
    expenseAlerts: true,
    reportScheduling: false,
    
    // Privacy & Security
    twoFactorAuth: false,
    dataRetention: "7years",
    privacyMode: false,
    
    // System settings
    autoBackup: true,
    darkMode: "system",
    language: "en-CA",
    dateFormat: "YYYY-MM-DD"
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // In real app, save settings via API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export will be ready shortly and sent to your email.",
    })
  }

  const handleImportData = () => {
    toast({
      title: "Import feature",
      description: "Data import functionality will be available in the next update.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-card rounded-xl p-6 md:p-8 border shadow-sm animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <SettingsIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Settings
                  </h1>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Customize your Swift Books experience and manage your business preferences
                </p>
              </div>
              
              <div className="hidden md:flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Business</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your business and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={settings.businessName}
                        onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input
                        id="ownerName"
                        value={settings.ownerName}
                        onChange={(e) => setSettings({...settings, ownerName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Settings */}
            <TabsContent value="business" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Business Configuration</CardTitle>
                  <CardDescription>
                    Configure your business preferences and accounting settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                      <Select value={settings.fiscalYearStart} onValueChange={(value) => setSettings({...settings, fiscalYearStart: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01-01">January 1st</SelectItem>
                          <SelectItem value="04-01">April 1st</SelectItem>
                          <SelectItem value="07-01">July 1st</SelectItem>
                          <SelectItem value="10-01">October 1st</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select value={settings.defaultCurrency} onValueChange={(value) => setSettings({...settings, defaultCurrency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select value={settings.timeZone} onValueChange={(value) => setSettings({...settings, timeZone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                          <SelectItem value="America/Edmonton">Mountain Time (Calgary)</SelectItem>
                          <SelectItem value="America/Winnipeg">Central Time (Winnipeg)</SelectItem>
                          <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">Business Number</Label>
                      <Input
                        id="businessNumber"
                        value={settings.businessNumber}
                        onChange={(e) => setSettings({...settings, businessNumber: e.target.value})}
                        placeholder="123456789RT0001"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive important updates via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Invoice Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatic reminders for overdue invoices
                        </p>
                      </div>
                      <Switch
                        checked={settings.invoiceReminders}
                        onCheckedChange={(checked) => setSettings({...settings, invoiceReminders: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Expense Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for unusual spending patterns
                        </p>
                      </div>
                      <Switch
                        checked={settings.expenseAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, expenseAlerts: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Report Scheduling</Label>
                        <p className="text-sm text-muted-foreground">
                          Weekly and monthly report delivery
                        </p>
                      </div>
                      <Switch
                        checked={settings.reportScheduling}
                        onCheckedChange={(checked) => setSettings({...settings, reportScheduling: checked})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security & Privacy</CardTitle>
                  <CardDescription>
                    Manage your account security and data privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings.twoFactorAuth && (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            Enabled
                          </Badge>
                        )}
                        <Switch
                          checked={settings.twoFactorAuth}
                          onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Data Retention Policy</Label>
                      <Select value={settings.dataRetention} onValueChange={(value) => setSettings({...settings, dataRetention: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="3years">3 Years</SelectItem>
                          <SelectItem value="7years">7 Years (CRA Recommended)</SelectItem>
                          <SelectItem value="indefinite">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Canada Revenue Agency recommends keeping records for 7 years
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Privacy Mode</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Hide sensitive financial data</p>
                          <PrivacyToggle />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Data Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                      <Button variant="outline" onClick={handleImportData} className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Import Data
                      </Button>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Preferences</CardTitle>
                  <CardDescription>
                    Configure application behavior and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically backup your data daily
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoBackup}
                        onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="flex items-center gap-2">
                          <ThemeToggle />
                          <span className="text-sm text-muted-foreground">System default</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-CA">English (Canada)</SelectItem>
                            <SelectItem value="fr-CA">Français (Canada)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-01-31)</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/01/2024)</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (01/31/2024)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Mobile Save Button */}
          <div className="md:hidden">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings