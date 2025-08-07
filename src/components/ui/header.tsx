import { 
  Box, 
  Flex, 
  HStack, 
  VStack,
  Text, 
  IconButton, 
  useDisclosure,
  Button,
  Badge
} from "@chakra-ui/react"
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerTrigger,
  DrawerTitle,
  DrawerCloseTrigger
} from "@chakra-ui/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PrivacyToggle } from "@/components/ui/privacy-toggle"
import { Bell, Settings, LayoutDashboard, Menu, X, LogOut, CreditCard, BarChart3 } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useColorMode } from "@/hooks/use-color-mode"

export function Header() {
  const { open: isMobileMenuOpen, onOpen, onClose } = useDisclosure()
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()

  const bg = colorMode === 'light' ? 'white' : 'gray.800'
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.600'
  const logoColor = colorMode === 'light' ? 'primary.500' : 'primary.400'

  // Keyboard shortcuts for navigation (already includes shortcuts)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.altKey) {
        switch (event.key) {
          case '1':
          case 'd':
            event.preventDefault()
            navigate('/')
            break
          case '2':
          case 't':
            event.preventDefault()
            navigate('/transactions')
            break
          case '3':
          case 'r':
            event.preventDefault()
            navigate('/reports')
            break
          case '4':
          case 's':
            event.preventDefault()
            navigate('/settings')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path || 
           (path === '/' && (location.pathname === '/dashboard'))
  }

  const NavLink = ({ to, icon: Icon, children, isActive, ...props }: any) => (
    <Button
      onClick={() => navigate(to)}
      variant={isActive ? 'solid' : 'ghost'}
      colorScheme={isActive ? 'primary' : 'gray'}
      size="sm"
      fontWeight="semibold"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
      {...props}
    >
      <HStack gap={2}>
        <Icon size={18} />
        <Text>{children}</Text>
      </HStack>
    </Button>
  )

  return (
    <Box 
      as="header" 
      position="sticky" 
      top="0" 
      zIndex="50" 
      bg={`${bg}95`} 
      backdropFilter="blur(10px)"
      borderBottomWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Flex h="16" px={6} align="center" maxW="container.xl" mx="auto">
        {/* Logo */}
        <HStack gap={3} mr={8}>
          <Box
            w={10}
            h={10}
            bg={logoColor}
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              w={8}
              h={8}
              bg="white"
              rounded="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xs" fontWeight="bold" color={logoColor}>
                SB
              </Text>
            </Box>
          </Box>
          <VStack align="start" gap={0}>
            <Text fontSize="xl" fontWeight="bold">
              Swift Books
            </Text>
            <Text fontSize="xs" color="gray.500" display={{ base: 'none', sm: 'block' }}>
              Smart Business Finance
            </Text>
          </VStack>
        </HStack>

        {/* Desktop Navigation */}
        <HStack gap={2} flex="1" display={{ base: 'none', md: 'flex' }}>
          <NavLink
            to="/"
            icon={LayoutDashboard}
            isActive={isActiveRoute('/')}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            icon={CreditCard}
            isActive={isActiveRoute('/transactions') || isActiveRoute('/expenses') || isActiveRoute('/invoices') || isActiveRoute('/receipts')}
          >
            Transactions
          </NavLink>
          <NavLink
            to="/reports"
            icon={BarChart3}
            isActive={isActiveRoute('/reports')}
          >
            Reports
          </NavLink>
          <NavLink
            to="/settings"
            icon={Settings}
            isActive={isActiveRoute('/settings')}
          >
            Settings
          </NavLink>
        </HStack>

        {/* Right Side Controls */}
        <HStack gap={2} ml="auto">
          <ThemeToggle />
          <PrivacyToggle />
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              variant="ghost"
              size="sm"
            >
              <Bell size={18} />
            </IconButton>
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              rounded="full"
              w={3}
              h={3}
              p={0}
            />
          </Box>
          <IconButton
            aria-label="Sign Out"
            variant="ghost"
            size="sm"
            colorScheme="red"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
          </IconButton>
          <IconButton
            aria-label="Menu"
            variant="ghost"
            size="sm"
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
          >
            <Menu size={18} />
          </IconButton>
        </HStack>
      </Flex>

      {/* Mobile Navigation Drawer */}
      <DrawerRoot open={isMobileMenuOpen} onOpenChange={(details) => details.open ? onOpen() : onClose()} placement="end">
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <HStack justify="space-between" align="center">
              <DrawerTitle fontSize="lg" fontWeight="bold">Navigation</DrawerTitle>
              <DrawerCloseTrigger asChild>
                <IconButton
                  aria-label="Close menu"
                  variant="ghost"
                  size="sm"
                >
                  <X size={18} />
                </IconButton>
              </DrawerCloseTrigger>
            </HStack>
          </DrawerHeader>
          <DrawerBody pt={4}>
            <VStack gap={3} align="stretch">
              <Button
                onClick={() => {navigate('/'); onClose()}}
                variant={isActiveRoute('/') ? 'solid' : 'ghost'}
                colorScheme="primary"
                justifyContent="flex-start"
              >
                <HStack gap={2}>
                  <LayoutDashboard size={18} />
                  <Text>Dashboard</Text>
                </HStack>
              </Button>
              <Button
                onClick={() => {navigate('/transactions'); onClose()}}
                variant={isActiveRoute('/transactions') ? 'solid' : 'ghost'}
                colorScheme="primary"
                justifyContent="flex-start"
              >
                <HStack gap={2}>
                  <CreditCard size={18} />
                  <Text>Transactions</Text>
                </HStack>
              </Button>
              <Button
                onClick={() => {navigate('/reports'); onClose()}}
                variant={isActiveRoute('/reports') ? 'solid' : 'ghost'}
                colorScheme="primary"
                justifyContent="flex-start"
              >
                <HStack gap={2}>
                  <BarChart3 size={18} />
                  <Text>Reports</Text>
                </HStack>
              </Button>
              <Button
                onClick={() => {navigate('/settings'); onClose()}}
                variant={isActiveRoute('/settings') ? 'solid' : 'ghost'}
                colorScheme="primary"
                justifyContent="flex-start"
              >
                <HStack gap={2}>
                  <Settings size={18} />
                  <Text>Settings</Text>
                </HStack>
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  )
}