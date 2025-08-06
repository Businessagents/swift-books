import { Header } from "@/components/ui/header"
import { FloatingAiChat } from "@/components/ai/floating-ai-chat"
import { WidgetSystem } from "@/components/dashboard/widget-system"
import { Box, Container, VStack, HStack, Heading, Text, Badge, SimpleGrid, Center, Icon, useColorModeValue } from "@chakra-ui/react"
import { Brain, LayoutDashboard } from "lucide-react"

const Index = () => {
  const heroBg = useColorModeValue('primary.500', 'primary.600')
  const heroText = useColorModeValue('white', 'white')
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Header />
      
      <Container as="main" maxW="container.xl" py={{ base: 8, md: 12 }} px={{ base: 4, md: 8 }}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <Box 
            bg={heroBg} 
            borderRadius="3xl" 
            p={{ base: 8, md: 12 }} 
            shadow="lg"
            className="animate-fade-in"
          >
            <VStack spacing={6} align="start">
              <HStack spacing={4} align="start">
                <Box p={3} bg="whiteAlpha.200" borderRadius="2xl">
                  <Icon as={LayoutDashboard} boxSize={8} color={heroText} />
                </Box>
                <VStack align="start" spacing={2}>
                  <Heading 
                    size={{ base: '2xl', md: '4xl' }} 
                    fontWeight="bold" 
                    color={heroText}
                    letterSpacing="tight"
                  >
                    Dashboard
                  </Heading>
                  <HStack spacing={2}>
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
              <SimpleGrid columns={3} spacing={6} pt={4} w="full">
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
