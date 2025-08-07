import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Clock, FileText, AlertCircle } from "lucide-react"
import { Box, SimpleGrid, HStack, VStack, Text, Icon } from "@chakra-ui/react"

const stats = [
  {
    title: "Monthly Revenue",
    value: "$287,650",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    description: "CAD - Current month"
  },
  {
    title: "Collection Period",
    value: "24 days",
    change: "-6%",
    trend: "down",
    icon: Clock,
    description: "Average DSO this quarter"
  },
  {
    title: "Active Clients",
    value: "47",
    change: "+12%",
    trend: "up",
    icon: FileText,
    description: "Ongoing projects"
  },
  {
    title: "Outstanding Balance",
    value: "$43,280",
    change: "-15%",
    trend: "down",
    icon: AlertCircle,
    description: "Past due accounts"
  }
]

export function StatsCards() {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        const isPositive = stat.trend === "up" ? stat.title.includes("Outstanding") || stat.title.includes("Overdue") ? false : true : true
        
        // Determine colors based on stat type
        const getIconBg = (title: string) => {
          if (title.includes("Revenue")) return "green.500"
          if (title.includes("Collection")) return "blue.500"
          if (title.includes("Clients")) return "orange.500"
          if (title.includes("Outstanding")) return "red.500"
          return "gray.500"
        }
        
        const getValueColor = (title: string) => {
          if (title.includes("Revenue")) return "green.500"
          if (title.includes("Collection")) return "blue.500"
          if (title.includes("Clients")) return "orange.500"
          if (title.includes("Outstanding")) return "red.500"
          return "gray.900"
        }
        
        return (
          <Card 
            key={stat.title}
            position="relative"
            overflow="hidden"
            bg="white"
            border="1px"
            borderColor="gray.200"
            _hover={{ shadow: "xl", transform: "scale(1.05)" }}
            transition="all 0.3s"
          >
            <CardHeader>
              <HStack justify="space-between" align="center" gap={0} pb={3}>
                <CardTitle fontSize="sm" fontWeight="medium" color="gray.600">
                  {stat.title}
                </CardTitle>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={getIconBg(stat.title)}
                  transition="all 0.2s"
                  _groupHover={{ transform: "scale(1.1)" }}
                >
                  <Icon as={IconComponent} boxSize={4} color="white" />
                </Box>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="start">
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color={getValueColor(stat.title)}
                  transition="all 0.2s"
                >
                  {stat.value}
                </Text>
                <HStack justify="space-between" w="full">
                  <Badge 
                    variant={isPositive ? "solid" : "solid"} 
                    colorScheme={isPositive ? "green" : "red"}
                    fontSize="xs"
                    transition="all 0.2s"
                  >
                    <HStack gap={1}>
                      <Icon as={isPositive ? TrendingUp : TrendingDown} boxSize={3} />
                      <Text>{stat.change}</Text>
                    </HStack>
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500" lineHeight="relaxed">
                  {stat.description}
                </Text>
              </VStack>
            </CardBody>
            
            {/* Subtle gradient overlay */}
            <Box
              position="absolute"
              inset={0}
              bg="linear-gradient(to bottom right, transparent, transparent, rgba(66, 153, 225, 0.05))"
              pointerEvents="none"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.3s"
            />
          </Card>
        )
      })}
    </SimpleGrid>
  )
}