import { Header } from "@/components/ui/header"
import { FloatingAiChat } from "@/components/ai/floating-ai-chat"
import { WidgetSystem } from "@/components/dashboard/widget-system"
import { Box, Container, VStack, HStack, Heading, Text, Badge, SimpleGrid, Center, Icon } from "@chakra-ui/react"
import { useColorMode } from "@chakra-ui/color-mode"
import { LayoutDashboard } from "lucide-react"

const Index = () => {
  const { colorMode } = useColorMode()
  const heroBg = colorMode === 'light' ? 'blue.500' : 'blue.600'
  const heroText = 'white'
  const bgColor = colorMode === 'light' ? 'gray.50' : 'gray.800'
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      
      <Container as="main" maxW="container.xl" py={{ base: 8, md: 12 }} px={{ base: 4, md: 8 }}>
        <VStack gap={12} align="stretch">
          {/* Hero Section */}
          <Box 
            bg={heroBg} 
            borderRadius="3xl" 
            p={{ base: 8, md: 12 }} 
            shadow="lg"
            className="animate-fade-in"
          >
            <VStack gap={6} align="start">
              <HStack gap={4} align="start">
                <Box p={3} bg="whiteAlpha.200" borderRadius="2xl">
                  <Icon as={LayoutDashboard} boxSize={8} color={heroText} />
                </Box>
                <VStack align="start" gap={2}>
                  <Heading 
                    size={{ base: '2xl', md: '4xl' }} 
                    fontWeight="bold" 
                    color={heroText}
                    letterSpacing="tight"
                  >
                    Dashboard
                  </Heading>
                  <HStack gap={2}>
                    <Badge colorScheme="whiteAlpha" variant="solid" bg="whiteAlpha.200" color={heroText}>
                      AI-Powered
                    </Badge>
                    <Badge colorScheme="whiteAlpha" variant="solid" bg="whiteAlpha.200" color={heroText}>
                      Real-time
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
              
              <Text 
                fontSize={{ base: 'lg', md: 'xl' }} 
                color="whiteAlpha.900" 
                maxW="3xl" 
                lineHeight="relaxed"
              >
                Your personalized business overview with customizable widgets, real-time insights, and quick actions.
              </Text>
              
              {/* Quick Stats */}
              <SimpleGrid columns={3} gap={6} pt={4} w="full">
                <Center flexDir="column">
                  <Text fontSize="3xl" fontWeight="bold" color={heroText}>$287K</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">Revenue YTD</Text>
                </Center>
                <Center flexDir="column">
                  <Text fontSize="3xl" fontWeight="bold" color={heroText}>+18%</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">Growth Rate</Text>
                </Center>
                <Center flexDir="column">
                  <Text fontSize="3xl" fontWeight="bold" color={heroText}>47</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">Active Clients</Text>
                </Center>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Widget Dashboard */}
          <Box className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <WidgetSystem />
          </Box>
        </VStack>
      </Container>
      
      {/* Floating AI Assistant */}
      <FloatingAiChat />
    </Box>
  );
};

export default Index;