import { useState } from "react"
import {
  Box,
  Button,
  Card,
  CardBody,
  Badge,
  HStack,
  VStack,
  Text,
  IconButton,
  Icon
} from "@chakra-ui/react"
import { useColorMode } from "@chakra-ui/color-mode"
import { AiChat } from "@/components/ai/ai-chat"
import { MessageCircle, X, Minimize2, Maximize2 } from "lucide-react"

export function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const { colorMode } = useColorMode()

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Box
          position="fixed"
          bottom={6}
          right={6}
          zIndex={50}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            rounded="full"
            w={14}
            h={14}
            bg="primary.500"
            _hover={{
              bg: "primary.600",
              shadow: "xl",
              transform: "translateY(-1px)"
            }}
            shadow="lg"
            transition="all 0.3s"
            color="white"
            position="relative"
          >
            <Icon as={MessageCircle} boxSize={6} />
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              rounded="full"
              w={5}
              h={5}
              fontSize="xs"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              3
            </Badge>
          </Button>
        </Box>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          position="fixed"
          bottom={6}
          right={6}
          zIndex={50}
          shadow="2xl"
          borderWidth="1px"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          w={isMinimized ? "320px" : "384px"}
          h={isMinimized ? "64px" : "500px"}
          transition="all 0.3s"
          overflow="hidden"
        >
          <Box
            bg="primary.500"
            color="white"
            p={4}
            borderTopRadius="md"
            borderBottomWidth={isMinimized ? 0 : 1}
            borderColor="primary.600"
          >
            <HStack justify="space-between">
              <HStack gap={2}>
                <Icon as={MessageCircle} boxSize={5} />
                <Text fontWeight="semibold">AI Assistant</Text>
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  size="sm"
                >
                  Online
                </Badge>
              </HStack>
              <HStack gap={1}>
                <IconButton
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={handleToggleMinimize}
                >
                  <Icon as={isMinimized ? Maximize2 : Minimize2} boxSize={4} />
                </IconButton>
                <IconButton
                  aria-label="Close"
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={handleClose}
                >
                  <Icon as={X} boxSize={4} />
                </IconButton>
              </HStack>
            </HStack>
          </Box>
          {!isMinimized && (
            <CardBody p={0} h="calc(500px - 73px)">
              <AiChat />
            </CardBody>
          )}
        </Card>
      )}
    </>
  )
}