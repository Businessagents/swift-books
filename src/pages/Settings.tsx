import { useState } from "react"
import { Header } from "@/components/ui/header"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Switch,
  Input,
  FormControl,
  FormLabel,
  Select,
  Divider,
  Badge,
  SimpleGrid
} from "@chakra-ui/react"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { useColorMode } from "@/hooks/use-color-mode"
import { showToast } from "@/lib/toast"
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
      showToast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      showToast({
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
    showToast({
      title: "Export started",
      description: "Your data export will be ready shortly and sent to your email.",
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }
  const handleImportData = () => {
    showToast({
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
        <VStack gap={8} align="stretch">
          {/* Header Section */}
          <Card.Root>
            <Card.Body>
              <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
                <VStack align="start" gap={2}>
                  <HStack gap={3}>
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
                <HStack gap={2} display={{ base: "none", md: "flex" }}>
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
            </Card.Body>
          </Card.Root>
          {/* Settings Content */}
          <Card.Root>
            <Card.Body>
              <VStack gap={4}>
                <Heading size="md">Settings</Heading>
                <Text>Settings page is being migrated to Chakra UI v3. Full functionality will be restored soon.</Text>
                <HStack gap={4}>
                  <ThemeToggle />
                  <PrivacyToggle />
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

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