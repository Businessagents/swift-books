import { useState } from "react"
import { Header } from "@/components/ui/header"
import {
  Box,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Heading,
  Button,
  Switch,
  Input,
  Field,
  Select,
  Separator,
  Badge,
  SimpleGrid,
  createToaster
} from "@chakra-ui/react"
import { FieldLabel } from "@chakra-ui/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useColorMode } from "@chakra-ui/color-mode"
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

const Settings = () => {
  const [loading, setLoading] = useState(false)
  
  // Simple toast replacement for now
  const toast = (options: { title: string; status: string; duration?: number }) => {
    console.log(`Toast: ${options.title} (${options.status})`)
  }
  
  const { colorMode } = useColorMode()
  const bg = colorMode === 'light' ? 'gray.50' : 'gray.800'

  // Settings state - TODO: Implement real data from context/API
  const [settings, setSettings] = useState({
    // Profile settings
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    
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
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save settings. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export will be ready shortly and sent to your email.",
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleImportData = () => {
    toast({
      title: "Import feature",
      description: "Data import functionality will be available in the next update.",
      status: "info", 
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Header />
      
      <Container as="main" maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Card>
            <CardBody>
              <HStack justify="space-between" align="start" flexWrap="wrap" spacing={4}>
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Box p={2} bg="primary.500" rounded="lg">
                      <SettingsIcon size={24} color="white" />
                    </Box>
                    <Heading size={{ base: "xl", md: "2xl" }}>
                      Settings
                    </Heading>
                  </HStack>
                  <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="2xl">
                    Customize your Swift Books experience and manage your business preferences
                  </Text>
                </VStack>
                
                <HStack spacing={2} display={{ base: "none", md: "flex" }}>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    size="sm"
                    leftIcon={<Download size={16} />}
                  >
                    Export Data
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    isLoading={loading}
                    loadingText="Saving..."
                    colorScheme="primary"
                    size="sm"
                    leftIcon={<Save size={16} />}
                  >
                    Save Changes
                  </Button>
                </HStack>
              </HStack>
            </CardBody>
          </Card>

          {/* Settings Content */}
          <Tabs defaultValue="profile">
            <TabsList overflowX="auto" overflowY="hidden">
              <TabsTrigger value="profile">
                <HStack spacing={2}>
                  <User size={16} />
                  <Text display={{ base: "none", sm: "inline" }}>Profile</Text>
                </HStack>
              </TabsTrigger>
              <TabsTrigger value="business">
                <HStack spacing={2}>
                  <Building size={16} />
                  <Text display={{ base: "none", sm: "inline" }}>Business</Text>
                </HStack>
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <HStack spacing={2}>
                  <Bell size={16} />
                  <Text display={{ base: "none", sm: "inline" }}>Notifications</Text>
                </HStack>
              </TabsTrigger>
              <TabsTrigger value="security">
                <HStack spacing={2}>
                  <Shield size={16} />
                  <Text display={{ base: "none", sm: "inline" }}>Security</Text>
                </HStack>
              </TabsTrigger>
              <TabsTrigger value="system">
                <HStack spacing={2}>
                  <Database size={16} />
                  <Text display={{ base: "none", sm: "inline" }}>System</Text>
                </HStack>
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <VStack align="start" spacing={1}>
                      <Heading size="md">Profile Information</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Update your business and contact information
                      </Text>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Field>
                          <FieldLabel>Business Name</FieldLabel>
                          <Input
                            value={settings.businessName}
                            onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Owner Name</FieldLabel>
                          <Input
                            value={settings.ownerName}
                            onChange={(e) => setSettings({...settings, ownerName: e.target.value})}
                          />
                        </Field>
                      </SimpleGrid>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Field>
                          <FieldLabel>Email Address</FieldLabel>
                          <Input
                            type="email"
                            value={settings.email}
                            onChange={(e) => setSettings({...settings, email: e.target.value})}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Phone Number</FieldLabel>
                          <Input
                            value={settings.phone}
                            onChange={(e) => setSettings({...settings, phone: e.target.value})}
                          />
                        </Field>
                      </SimpleGrid>
                      
                      <Field>
                        <FieldLabel>Business Address</FieldLabel>
                        <Input
                          value={settings.address}
                          onChange={(e) => setSettings({...settings, address: e.target.value})}
                        />
                      </Field>
                    </VStack>
                  </CardBody>
                </Card>
              </TabsContent>

              {/* Business Settings */}
              <TabsContent value="business">
                <Card>
                  <CardHeader>
                    <VStack align="start" spacing={1}>
                      <Heading size="md">Business Configuration</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Configure your business preferences and accounting settings
                      </Text>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Field>
                          <FieldLabel>Fiscal Year Start</FieldLabel>
                          <Select 
                            value={settings.fiscalYearStart} 
                            onChange={(e) => setSettings({...settings, fiscalYearStart: e.target.value})}
                          >
                            <option value="01-01">January 1st</option>
                            <option value="04-01">April 1st</option>
                            <option value="07-01">July 1st</option>
                            <option value="10-01">October 1st</option>
                          </Select>
                        </Field>
                        
                        <Field>
                          <FieldLabel>Default Currency</FieldLabel>
                          <Select 
                            value={settings.defaultCurrency} 
                            onChange={(e) => setSettings({...settings, defaultCurrency: e.target.value})}
                          >
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                          </Select>
                        </Field>
                      </SimpleGrid>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Field>
                          <FieldLabel>Time Zone</FieldLabel>
                          <Select 
                            value={settings.timeZone} 
                            onChange={(e) => setSettings({...settings, timeZone: e.target.value})}
                          >
                            <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                            <option value="America/Edmonton">Mountain Time (Calgary)</option>
                            <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                            <option value="America/Toronto">Eastern Time (Toronto)</option>
                          </Select>
                        </Field>
                        
                        <Field>
                          <FieldLabel>Business Number</FieldLabel>
                          <Input
                            value={settings.businessNumber}
                            onChange={(e) => setSettings({...settings, businessNumber: e.target.value})}
                            placeholder="123456789RT0001"
                          />
                        </Field>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <VStack align="start" spacing={1}>
                      <Heading size="md">Notification Preferences</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Configure how and when you receive notifications
                      </Text>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium">Email Notifications</Text>
                          <Text fontSize="sm" color="gray.600">
                            Receive important updates via email
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={settings.emailNotifications}
                          onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                        />
                      </HStack>
                      
                      <Separator />
                      
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium">Invoice Reminders</Text>
                          <Text fontSize="sm" color="gray.600">
                            Automatic reminders for overdue invoices
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={settings.invoiceReminders}
                          onChange={(e) => setSettings({...settings, invoiceReminders: e.target.checked})}
                        />
                      </HStack>
                      
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium">Expense Alerts</Text>
                          <Text fontSize="sm" color="gray.600">
                            Notifications for unusual spending patterns
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={settings.expenseAlerts}
                          onChange={(e) => setSettings({...settings, expenseAlerts: e.target.checked})}
                        />
                      </HStack>
                      
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium">Report Scheduling</Text>
                          <Text fontSize="sm" color="gray.600">
                            Weekly and monthly report delivery
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={settings.reportScheduling}
                          onChange={(e) => setSettings({...settings, reportScheduling: e.target.checked})}
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <VStack align="start" spacing={1}>
                      <Heading size="md">Security & Privacy</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Manage your account security and data privacy settings
                      </Text>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="medium">Two-Factor Authentication</Text>
                            <Text fontSize="sm" color="gray.600">
                              Add an extra layer of security to your account
                            </Text>
                          </VStack>
                          <HStack spacing={2}>
                            {settings.twoFactorAuth && (
                              <Badge colorScheme="green" variant="subtle">
                                Enabled
                              </Badge>
                            )}
                            <Switch
                              isChecked={settings.twoFactorAuth}
                              onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                            />
                          </HStack>
                        </HStack>
                        
                        <Separator />
                        
                        <Field>
                          <FieldLabel>Data Retention Policy</FieldLabel>
                          <Select 
                            value={settings.dataRetention} 
                            onChange={(e) => setSettings({...settings, dataRetention: e.target.value})}
                          >
                            <option value="1year">1 Year</option>
                            <option value="3years">3 Years</option>
                            <option value="7years">7 Years (CRA Recommended)</option>
                            <option value="indefinite">Indefinite</option>
                          </Select>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Canada Revenue Agency recommends keeping records for 7 years
                          </Text>
                        </Field>
                        
                        <Separator />
                        
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="medium">Privacy Mode</Text>
                            <HStack spacing={2}>
                              <Text fontSize="sm" color="gray.600">Hide sensitive financial data</Text>
                              <PrivacyToggle />
                            </HStack>
                          </VStack>
                        </HStack>
                      </VStack>
                      
                      <Separator />
                      
                      <VStack spacing={4} align="stretch">
                        <Heading size="sm">Data Management</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Button 
                            variant="outline" 
                            onClick={handleExportData} 
                            size="sm"
                            leftIcon={<Download size={16} />}
                          >
                            Export Data
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleImportData} 
                            size="sm"
                            leftIcon={<Upload size={16} />}
                          >
                            Import Data
                          </Button>
                          <Button 
                            colorScheme="red" 
                            variant="outline" 
                            size="sm"
                            leftIcon={<Trash2 size={16} />}
                          >
                            Delete Account
                          </Button>
                        </SimpleGrid>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <VStack align="start" spacing={1}>
                      <Heading size="md">System Preferences</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Configure application behavior and appearance
                      </Text>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="medium">Automatic Backups</Text>
                            <Text fontSize="sm" color="gray.600">
                              Automatically backup your data daily
                            </Text>
                          </VStack>
                          <Switch
                            isChecked={settings.autoBackup}
                            onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                          />
                        </HStack>
                        
                        <Separator />
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Field>
                            <FieldLabel>Theme</FieldLabel>
                            <HStack spacing={2}>
                              <ThemeToggle />
                              <Text fontSize="sm" color="gray.500">System default</Text>
                            </HStack>
                          </Field>
                          
                          <Field>
                            <FieldLabel>Language</FieldLabel>
                            <Select 
                              value={settings.language} 
                              onChange={(e) => setSettings({...settings, language: e.target.value})}
                            >
                              <option value="en-CA">English (Canada)</option>
                              <option value="fr-CA">Français (Canada)</option>
                              <option value="en-US">English (US)</option>
                            </Select>
                          </Field>
                        </SimpleGrid>
                        
                        <Field>
                          <FieldLabel>Date Format</FieldLabel>
                          <Select 
                            value={settings.dateFormat} 
                            onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                          >
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-31)</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (31/01/2024)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (01/31/2024)</option>
                          </Select>
                        </Field>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabsContent>
          </Tabs>

          {/* Mobile Save Button */}
          <Box display={{ base: "block", md: "none" }}>
            <Button 
              onClick={handleSave} 
              isLoading={loading}
              loadingText="Saving..."
              colorScheme="primary"
              w="full"
              size="lg"
              leftIcon={<Save size={16} />}
            >
              Save Changes
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default Settings