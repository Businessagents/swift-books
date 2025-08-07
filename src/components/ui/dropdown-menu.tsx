import * as React from "react"
import { 
  MenuRoot, 
  MenuTrigger, 
  MenuContent, 
  MenuItem, 
  MenuSeparator,
  MenuItemGroup,
  MenuItemGroupLabel
} from "@chakra-ui/react"
import { Check, ChevronRight, Circle } from "lucide-react"

const DropdownMenu = ({ children, ...props }: { children: React.ReactNode }) => (
  <MenuRoot {...props}>{children}</MenuRoot>
)

const DropdownMenuTrigger = ({ children, asChild, ...props }: { 
  children: React.ReactNode
  asChild?: boolean 
}) => (
  <MenuTrigger asChild={asChild} {...props}>{children}</MenuTrigger>
)

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => (
  <MenuItemGroup>{children}</MenuItemGroup>
)

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => (
  <MenuItemGroup>{children}</MenuItemGroup>
)

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
  inset?: boolean
}>(({ children, inset, ...props }, ref) => (
  <MenuItem ref={ref} {...props}>
    {children}
    <ChevronRight style={{ marginLeft: 'auto', width: '16px', height: '16px' }} />
  </MenuItem>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
}>(({ children, ...props }, ref) => (
  <MenuContent ref={ref} {...props}>
    {children}
  </MenuContent>
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
}>(({ children, sideOffset = 4, align = "center", ...props }, ref) => (
  <MenuContent
    ref={ref}
    borderRadius="md"
    boxShadow="lg"
    border="1px solid"
    borderColor="gray.200"
    _dark={{ borderColor: "gray.600" }}
    {...props}
  >
    {children}
  </MenuContent>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
  inset?: boolean
}>(({ children, inset, ...props }, ref) => (
  <MenuItem ref={ref} paddingLeft={inset ? 8 : 2} {...props}>
    {children}
  </MenuItem>
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
  checked?: boolean
}>(({ children, checked, ...props }, ref) => (
  <MenuItem ref={ref} {...props}>
    <span style={{ marginRight: '8px', width: '16px', height: '16px' }}>
      {checked && <Check style={{ width: '16px', height: '16px' }} />}
    </span>
    {children}
  </MenuItem>
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
  value: string
}>(({ children, ...props }, ref) => (
  <MenuItem ref={ref} {...props}>
    <span style={{ marginRight: '8px', width: '16px', height: '16px' }}>
      <Circle style={{ width: '16px', height: '16px' }} />
    </span>
    {children}
  </MenuItem>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
  inset?: boolean
}>(({ children, inset, ...props }, ref) => (
  <div ref={ref} style={{ padding: '6px 8px', paddingLeft: inset ? 32 : 8, fontSize: '12px', fontWeight: 'bold' }} {...props}>
    {children}
  </div>
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => (
    <MenuSeparator ref={ref} {...props} />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => (
  <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.6 }}>
    {children}
  </span>
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
