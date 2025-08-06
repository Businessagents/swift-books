import { 
  Box, 
  Flex, 
  HStack, 
  VStack,
  Text, 
  IconButton, 
  useColorModeValue,
  useDisclosure,
  Button,
  Badge
} from "@chakra-ui/react"
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/modal"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PrivacyToggle } from "@/components/ui/privacy-toggle"
import { Bell, Settings, LayoutDashboard, Menu, X, LogOut, CreditCard, BarChart3 } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const { isOpen: isMobileMenuOpen, onOpen, onClose } = useDisclosure()
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const logoColor = useColorModeValue('primary.500', 'primary.400')

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
      as={Link}
      to={to}
      variant={isActive ? 'solid' : 'ghost'}
      colorScheme={isActive ? 'primary' : 'gray'}
      leftIcon={<Icon size={18} />}
      size="sm"
      fontWeight="semibold"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
      {...props}
    >
      {children}
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
        <HStack spacing={3} mr={8}>
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
          <VStack align="start" spacing={0}>
            <Text fontSize="xl" fontWeight="bold">
              Swift Books
            </Text>
            <Text fontSize="xs" color="gray.500" display={{ base: 'none', sm: 'block' }}>
              Smart Business Finance
            </Text>
          </VStack>
        </HStack>

        {/* Desktop Navigation */}
        <HStack spacing={2} flex="1" display={{ base: 'none', md: 'flex' }}>
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
        <HStack spacing={2} ml="auto">
          <ThemeToggle />
          <PrivacyToggle />
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<Bell size={18} />}
              variant="ghost"
              size="sm"
            />
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
            icon={<LogOut size={18} />}
            variant="ghost"
            size="sm"
            colorScheme="red"
            onClick={handleSignOut}
          />
          <IconButton
            aria-label="Menu"
            icon={<Menu size={18} />}
            variant="ghost"
            size="sm"
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
          />
        </HStack>
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isMobileMenuOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold">Navigation</Text>
              <IconButton
                aria-label="Close menu"
                icon={<X size={18} />}
                variant="ghost"
                size="sm"
                onClick={onClose}
              />
            </HStack>
          </DrawerHeader>
          <DrawerBody pt={4}>
            <VStack spacing={3} align="stretch">
              <Button
                as={Link}
                to="/"
                variant={isActiveRoute('/') ? 'solid' : 'ghost'}
                colorScheme="primary"
                leftIcon={<LayoutDashboard size={18} />}
                justifyContent="flex-start"
                onClick={onClose}
              >
                Dashboard
              </Button>
              <Button
                as={Link}
                to="/transactions"
                variant={isActiveRoute('/transactions') ? 'solid' : 'ghost'}
                colorScheme="primary"
                leftIcon={<CreditCard size={18} />}
                justifyContent="flex-start"
                onClick={onClose}
              >
                Transactions
              </Button>
              <Button
                as={Link}
                to="/reports"
                variant={isActiveRoute('/reports') ? 'solid' : 'ghost'}
                colorScheme="primary"
                leftIcon={<BarChart3 size={18} />}
                justifyContent="flex-start"
                onClick={onClose}
              >
                Reports
              </Button>
              <Button
                as={Link}
                to="/settings"
                variant={isActiveRoute('/settings') ? 'solid' : 'ghost'}
                colorScheme="primary"
                leftIcon={<Settings size={18} />}
                justifyContent="flex-start"
                onClick={onClose}
              >
                Settings
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}