import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { usePrivacy } from "@/hooks/use-privacy"
import { Box, VStack, HStack, Text, Circle, Icon, Flex } from "@chakra-ui/react"

interface HealthMetric {
  name: string
  score: number
  weight: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  trend: 'up' | 'down' | 'stable'
  description: string
  recommendation?: string
}

export function FinancialHealthScore() {
  const { maskValue, isPrivacyMode } = usePrivacy()

  const metrics: HealthMetric[] = [
    {
      name: "Cash Flow",
      score: 92,
      weight: 0.3,
      status: 'excellent',
      trend: 'up',
      description: "Strong positive cash flow trend",
      recommendation: "Continue monitoring monthly patterns"
    },
    {
      name: "Revenue Growth",
      score: 78,
      weight: 0.25,
      status: 'good',
      trend: 'up',
      description: "Steady growth over past 3 months",
      recommendation: "Focus on client retention strategies"
    },
    {
      name: "Expense Control",
      score: 65,
      weight: 0.2,
      status: 'fair',
      trend: 'down',
      description: "Expenses increasing faster than revenue",
      recommendation: "Review and optimize recurring expenses"
    },
    {
      name: "Payment Collection",
      score: 88,
      weight: 0.15,
      status: 'excellent',
      trend: 'stable',
      description: "Low outstanding receivables",
      recommendation: "Maintain current collection processes"
    },
    {
      name: "Tax Compliance",
      score: 95,
      weight: 0.1,
      status: 'excellent',
      trend: 'stable',
      description: "All filings up to date",
      recommendation: "Continue quarterly reviews"
    }
  ]

  // Calculate overall health score
  const overallScore = Math.round(
    metrics.reduce((total, metric) => total + (metric.score * metric.weight), 0)
  )

  const getScoreColor = (score: number) => {
    if (score >= 85) return "green.600"
    if (score >= 70) return "yellow.600"
    if (score >= 55) return "orange.600"
    return "red.600"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "linear-gradient(135deg, #48bb78, #38a169)"
    if (score >= 70) return "linear-gradient(135deg, #ed8936, #dd6b20)"
    if (score >= 55) return "linear-gradient(135deg, #ed8936, #dd6b20)"
    return "linear-gradient(135deg, #f56565, #e53e3e)"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge colorScheme="green">Excellent</Badge>
      case 'good':
        return <Badge colorScheme="blue">Good</Badge>
      case 'fair':
        return <Badge colorScheme="yellow">Fair</Badge>
      case 'poor':
        return <Badge colorScheme="red">Poor</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <Icon as={TrendingUp} boxSize={4} color="green.500" />
      case 'down':
        return <Icon as={TrendingDown} boxSize={4} color="red.500" />
      default:
        return <Box boxSize={4} />
    }
  }

  return (
    <Card bg="white" border="1px" borderColor="gray.200">
      <CardHeader>
        <HStack justify="space-between">
          <CardTitle>
            <HStack gap={2}>
              <Icon as={CheckCircle} boxSize={5} color="blue.500" />
              <Text>Financial Health Score</Text>
            </HStack>
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Icon as={Info} boxSize={4} />
          </Button>
        </HStack>
      </CardHeader>
      <CardContent>
        <VStack gap={6}>
          {/* Overall Score */}
          <VStack gap={4} textAlign="center">
            <Box position="relative">
              <Circle
                size={32}
                bg="linear-gradient(135deg, #f7fafc, #edf2f7)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Circle
                  size={28}
                  bg={getScoreGradient(overallScore)}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Circle
                    size={24}
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <VStack gap={0}>
                      <Text
                        fontSize="3xl"
                        fontWeight="bold"
                        color={getScoreColor(overallScore)}
                      >
                        {isPrivacyMode ? '••' : overallScore}
                      </Text>
                      <Text fontSize="xs" color="gray.500">/ 100</Text>
                    </VStack>
                  </Circle>
                </Circle>
              </Circle>
            </Box>
            <VStack gap={1}>
              <Text fontSize="lg" fontWeight="semibold">
                {overallScore >= 85 ? 'Excellent' : overallScore >= 70 ? 'Good' : overallScore >= 55 ? 'Fair' : 'Needs Attention'}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Your business is {overallScore >= 70 ? 'financially healthy' : 'showing areas for improvement'}
              </Text>
            </VStack>
          </VStack>

          {/* Metric Breakdown */}
          <VStack gap={4} align="stretch">
            <Text fontSize="sm" fontWeight="medium">Health Metrics</Text>
            <VStack gap={3} align="stretch">
              {metrics.map((metric) => (
                <VStack key={metric.name} gap={2} align="stretch">
                  <HStack justify="space-between" fontSize="sm">
                    <HStack gap={2}>
                      <Text fontWeight="medium">{metric.name}</Text>
                      {getTrendIcon(metric.trend)}
                    </HStack>
                    <HStack gap={2}>
                      {getStatusBadge(metric.status)}
                      <Text
                        fontWeight="medium"
                        color={getScoreColor(metric.score)}
                      >
                        {isPrivacyMode ? '••' : metric.score}
                      </Text>
                    </HStack>
                  </HStack>
                  <Progress 
                    value={isPrivacyMode ? 75 : metric.score} 
                    size="sm"
                  />
                  <Text fontSize="xs" color="gray.500">
                    {metric.description}
                  </Text>
                  {metric.recommendation && metric.score < 80 && (
                    <HStack
                      align="start"
                      gap={2}
                      p={2}
                      bg="gray.50"
                      borderRadius="lg"
                    >
                      <Icon as={AlertTriangle} boxSize={4} color="orange.500" mt={0.5} flexShrink={0} />
                      <Text fontSize="xs" color="gray.500">
                        <Text as="span" fontWeight="medium">Recommendation:</Text> {metric.recommendation}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              ))}
            </VStack>
          </VStack>

          {/* Action Buttons */}
          <HStack gap={2} pt={2}>
            <Button variant="outline" size="sm" flex={1}>
              View Details
            </Button>
            <Button size="sm" flex={1}>
              Get Recommendations
            </Button>
          </HStack>
        </VStack>
      </CardContent>
    </Card>
  )
}