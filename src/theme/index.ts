import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// Define the color scheme with the specified colors
const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  colors: {
    // Primary: Trust Blue (#2B6CB0)
    primary: {
      50: '#E6F3FF',
      100: '#B3DEFF',
      200: '#80C9FF',
      300: '#4DB4FF',
      400: '#1A9FFF',
      500: '#2B6CB0', // Main primary color
      600: '#225896',
      700: '#19447C',
      800: '#103062',
      900: '#071C48',
    },
    // Secondary: Dark Blue (#1A365D)
    secondary: {
      50: '#EDF2F7',
      100: '#E2E8F0',
      200: '#CBD5E0',
      300: '#A0AEC0',
      400: '#718096',
      500: '#1A365D', // Main secondary color
      600: '#152E4F',
      700: '#112641',
      800: '#0D1E33',
      900: '#081625',
    },
    // Success: Green (#38A169)
    success: {
      50: '#F0FFF4',
      100: '#C6F6D5',
      200: '#9AE6B4',
      300: '#68D391',
      400: '#48BB78',
      500: '#38A169', // Main success color
      600: '#2F855A',
      700: '#276749',
      800: '#22543D',
      900: '#1C4532',
    },
    // Custom grays for backgrounds
    gray: {
      50: '#F7FAFC',  // Light background
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C', // Dark background
      900: '#171923',
    },
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
        fontFamily: 'body',
        lineHeight: 'base',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      sizes: {
        sm: {
          fontSize: 'sm',
          px: 3,
          py: 2,
        },
        md: {
          fontSize: 'md',
          px: 4,
          py: 2.5,
        },
        lg: {
          fontSize: 'lg',
          px: 6,
          py: 3,
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: `${props.colorScheme}.600`,
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: `${props.colorScheme}.700`,
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease-in-out',
        }),
        outline: (props: any) => ({
          border: '2px solid',
          borderColor: `${props.colorScheme}.500`,
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.50`,
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: `${props.colorScheme}.100`,
          },
          transition: 'all 0.2s ease-in-out',
        }),
        ghost: (props: any) => ({
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.50`,
          },
          _active: {
            bg: `${props.colorScheme}.100`,
          },
          transition: 'all 0.2s ease-in-out',
        }),
      },
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          overflow: 'hidden',
        },
        body: {
          p: 6,
        },
        header: {
          p: 6,
          pb: 0,
        },
        footer: {
          p: 6,
          pt: 0,
        },
      },
      variants: {
        elevated: (props: any) => ({
          container: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
            boxShadow: 'xl',
            border: '1px solid',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
          },
        }),
        outline: (props: any) => ({
          container: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            border: '1px solid',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
          },
        }),
      },
      defaultProps: {
        variant: 'elevated',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
        },
      },
      variants: {
        filled: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
            _hover: {
              bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            },
            _focus: {
              bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            },
          },
        }),
        outline: (props: any) => ({
          field: {
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
            },
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            },
          },
        }),
      },
      defaultProps: {
        variant: 'outline',
      },
    },
  },
  transitions: {
    property: {
      common: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
    duration: {
      ultraFast: '50ms',
      faster: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      slowest: '500ms',
    },
  },
})

export default theme