import { Header } from "@/components/ui/header"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  SimpleGrid,
  Icon,
  Flex
} from "@chakra-ui/react"
import { useColorMode } from "@chakra-ui/color-mode"
import { Card, CardHeader, CardBody } from "@/components/ui/card"
import { GSTHSTReporting } from "@/components/reports/gst-hst-reporting"
import { BarChart3, TrendingUp, Download, Calendar, FileText, PieChart, Calculator, Brain } from "lucide-react"

const reports = [
  {
    title: "Profit & Loss Statement",
    description: "Comprehensive P&L for Q4 2023",
    type: "Financial",
    lastGenerated: "2024-01-15",
    status: "Ready"
  },
  {
    title: "Cash Flow Report",
    description: "Monthly cash flow analysis",
    type: "Financial", 
    lastGenerated: "2024-01-30",
    status: "Ready"
  },
  {
    title: "Tax Summary (CRA T4A)",
    description: "Annual tax preparation summary",
    type: "Tax",
    lastGenerated: "2024-01-10",
    status: "Ready"
  },
  {
    title: "Expense Analysis by Category",
    description: "Detailed expense breakdown and trends",
    type: "Operational",
    lastGenerated: "2024-01-28",
    status: "Processing"
  },
  {
    title: "Client Revenue Analysis",
    description: "Revenue by client and project performance",
    type: "Revenue",
    lastGenerated: "2024-01-25",
    status: "Ready"
  },
  {
    title: "Business Intelligence Dashboard",
    description: "KPI overview and business metrics",
    type: "Analytics",
    lastGenerated: "2024-01-30",
    status: "Ready"
  }
]

const quickInsights = [
  {
    title: "Revenue Growth",
    value: "+23.5%",
    description: "vs. previous quarter",
    trend: "up",
    icon: TrendingUp
  },
  {
    title: "Top Expense Category",
    value: "Software & Technology",
    description: "32% of total expenses",
    trend: "neutral",
    icon: PieChart
  },
  {
    title: "Outstanding Receivables",
    value: "$156,700 CAD",
    description: "Average 18 days overdue",
    trend: "down",
    icon: BarChart3
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Ready":
      return <Badge colorScheme="green">Ready</Badge>
    case "Processing":
      return <Badge colorScheme="yellow">Processing</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getTypeColorScheme = (type: string) => {
  switch (type) {
    case "Financial":
      return "blue"
    case "Tax":
      return "red"
    case "Operational":
      return "green"
    case "Revenue":
      return "purple"
    case "Analytics":
      return "orange"
    default:
      return "gray"
  }
}

const Reports = () => {
  const { colorMode } = useColorMode()
  const bg = colorMode === 'light' ? 'gray.50' : 'gray.800'

  return (
    <Box minH="100vh" bg={bg}>
      <Header />
      
      <Container as="main" maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Clean Header */}
          <Card>
            <CardBody>
              <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                <VStack align="start" spacing={3}>
                  <HStack spacing={3}>
                    <Box p={2} bg="primary.500" rounded="lg">
                      <Icon as={BarChart3} boxSize={6} color="white" />
                    </Box>
                    <Heading size={{ base: "xl", md: "2xl" }}>
                      Financial Reports
                    </Heading>
                  </HStack>
                  <Text color="gray.600" maxW="2xl">
                    AI-powered business intelligence reports and CRA-compliant tax reporting with real-time insights
                  </Text>
                </VStack>
                <HStack spacing={2} display={{ base: "none", md: "flex" }}>
                  <Button 
                    variant="outline"
                    onClick={() => {
                    console.log("AI Insights clicked - TODO: Implement AI insights modal")
                  }}
                  >
                    <Icon as={Brain} boxSize={4} mr={2} />
                    AI Insights
                  </Button>
                  <Button variant="outline">
                    <Icon as={FileText} boxSize={4} mr={2} />
                    Generate Report
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Quick Insights */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {quickInsights.map((insight) => {
              const IconComponent = insight.icon
              return (
                <Card 
                  key={insight.title} 
                  _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.3s"
                >
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between" align="start">
                        <Box 
                          p={2} 
                          bg="primary.100" 
                          rounded="lg"
                          _groupHover={{ bg: "primary.200" }}
                          transition="colors 0.2s"
                        >
                          <Icon as={IconComponent} boxSize={5} color="primary.600" />
                        </Box>
                        {insight.trend === "up" && (
                          <HStack spacing={1}>
                            <Icon as={TrendingUp} boxSize={4} color="green.500" />
                            <Badge colorScheme="green" variant="outline">
                              Improving
                            </Badge>
                          </HStack>
                        )}
                      </Flex>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="2xl" fontWeight="bold">{insight.value}</Text>
                        <Text fontSize="sm" fontWeight="medium">{insight.title}</Text>
                        <Text fontSize="xs" color="gray.500">{insight.description}</Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>

          {/* Tax Reports Section */}
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <HStack spacing={2}>
                  <Icon as={Calculator} boxSize={5} />
                  <Heading size="md">Tax & Compliance Reports</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <GSTHSTReporting />
              </CardBody>
            </Card>
            
            {/* Business Reports Section */}
            <Card>
              <CardHeader>
                <HStack spacing={2}>
                  <Icon as={FileText} boxSize={5} />
                  <Heading size="md">Business Reports</Heading>
                </HStack>
                <Text color="gray.600">
                  Generate, view, and download business reports
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {reports.map((report) => (
                    <Box
                      key={report.title}
                      p={4}
                      borderWidth={1}
                      rounded="lg"
                      _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.700' }}
                      transition="colors 0.2s"
                    >
                      <Flex 
                        direction={{ base: "column", md: "row" }}
                        align={{ base: "stretch", md: "center" }}
                        justify="space-between"
                        gap={4}
                      >
                        <HStack spacing={4} align="start">
                          <Box bg="primary.100" p={2} rounded="lg">
                            <Icon as={FileText} boxSize={5} color="primary.600" />
                          </Box>
                          <VStack align="start" spacing={2}>
                            <HStack spacing={2} wrap="wrap">
                              <Text fontWeight="semibold">{report.title}</Text>
                              <Badge colorScheme={getTypeColorScheme(report.type)}>{report.type}</Badge>
                              {getStatusBadge(report.status)}
                            </HStack>
                            <Text fontSize="sm" color="gray.600">{report.description}</Text>
                            <HStack spacing={2} fontSize="sm" color="gray.500">
                              <Icon as={Calendar} boxSize={4} />
                              <Text>Last generated: {report.lastGenerated}</Text>
                            </HStack>
                          </VStack>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log(`Viewing report: ${report.title}`)
                              // TODO: Implement proper report viewing modal
                            }}
                          >
                            <Icon as={BarChart3} boxSize={4} mr={2} />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            isDisabled={report.status !== "Ready"}
                            onClick={() => {
                              console.log(`Downloading report: ${report.title}`)
                              // TODO: Implement actual CSV/PDF download
                            }}
                          >
                            <Icon as={Download} boxSize={4} mr={2} />
                            Download
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Reports;