# Chakra UI v3 Migration Guide

This project has been migrated from shadcn/ui to Chakra UI v3 for better component consistency and maintenance.

## Overview

The application now uses **Chakra UI v3** as the primary UI component library. All components in the `src/components/ui/` directory are wrapper components that provide API compatibility while using Chakra UI underneath.

## Key Changes

### Dependencies
- **Added**: `@chakra-ui/react` v3.24.1
- **Added**: `@emotion/react` and `@emotion/styled` for Chakra UI styling
- **Removed**: All shadcn/ui and Tailwind CSS dependencies

### Component Architecture

The UI components follow this pattern:

```typescript
/**
 * Component - Chakra UI v3 wrapper
 * 
 * Brief description of the component's purpose.
 * Usage examples and API notes.
 * 
 * @example
 * <Component prop="value">Content</Component>
 */
import * as React from "react"
import { ChakraComponent } from "@chakra-ui/react"

// Component implementation using Chakra UI
```

### Key Components

#### Button (`src/components/ui/button.tsx`)
- Maps variant props (`default`, `destructive`, `outline`, etc.) to Chakra button styles
- Supports all standard button variants with appropriate color schemes

#### Card (`src/components/ui/card.tsx`)
- Uses Chakra's Card components (CardRoot, CardHeader, CardBody, CardFooter)
- Supports `elevated` and `outline` variants

#### Form Components
- **Input**: Styled Chakra Input with consistent focus and validation states
- **Textarea**: Styled Chakra Textarea with minimum height and validation states
- **Select**: Chakra Select with compatibility wrapper components

## Usage Guidelines

### Importing Components

```typescript
// UI components from the wrapper library
import { Button, Card, CardHeader, CardContent } from "@/components/ui"

// Direct Chakra UI components for advanced usage
import { Box, Flex, Text, Heading } from "@chakra-ui/react"
```

### Theme Integration

The application uses Chakra UI's theme system defined in `src/theme/`. Key theme features:

- Color modes (light/dark) support
- Consistent color palette with primary, secondary, success, warning color schemes
- Mobile-responsive breakpoints
- Custom component variants and sizes

### Best Practices

1. **Use wrapper components** when available for consistency
2. **Use Chakra components directly** for layout (Box, Flex, Grid, Stack)
3. **Follow Chakra naming conventions** for props and styling
4. **Leverage theme tokens** for colors, spacing, and typography
5. **Use responsive props** for mobile-first design

## Migration Benefits

1. **Better TypeScript support** with comprehensive type definitions
2. **Improved accessibility** with built-in ARIA attributes
3. **Consistent theming** across the entire application
4. **Better mobile responsiveness** with responsive props
5. **Reduced bundle size** compared to the previous setup

## Resources

- [Chakra UI v3 Documentation](https://v3.chakra-ui.com/)
- [Component API Reference](https://v3.chakra-ui.com/docs/components)
- [Theming Guide](https://v3.chakra-ui.com/docs/styled-system/theming)
- [Migration from v2 to v3](https://v3.chakra-ui.com/docs/migration)