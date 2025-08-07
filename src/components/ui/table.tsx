import * as React from "react"
import { 
  Table as ChakraTable,
  TableRoot,
  TableHeader as ChakraTableHeader,
  TableBody as ChakraTableBody,
  TableFooter as ChakraTableFooter,
  TableRow as ChakraTableRow,
  TableCell as ChakraTableCell,
  TableColumnHeader,
  TableCaption as ChakraTableCaption,
  TableScrollArea
} from "@chakra-ui/react"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ children, ...props }, ref) => (
  <TableScrollArea>
    <TableRoot ref={ref} variant="simple" size="sm" {...props}>
      {children}
    </TableRoot>
  </TableScrollArea>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, ...props }, ref) => (
  <ChakraTableHeader ref={ref} {...props}>
    {children}
  </ChakraTableHeader>
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, ...props }, ref) => (
  <ChakraTableBody ref={ref} {...props}>
    {children}
  </ChakraTableBody>
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, ...props }, ref) => (
  <ChakraTableFooter 
    ref={ref} 
    bg="gray.50" 
    _dark={{ bg: "gray.700" }}
    fontWeight="medium"
    {...props}
  >
    {children}
  </ChakraTableFooter>
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ children, ...props }, ref) => (
  <ChakraTableRow
    ref={ref}
    _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
    {...props}
  >
    {children}
  </ChakraTableRow>
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ children, ...props }, ref) => (
  <TableColumnHeader
    ref={ref}
    color="gray.600"
    _dark={{ color: "gray.300" }}
    fontWeight="medium"
    fontSize="sm"
    {...props}
  >
    {children}
  </TableColumnHeader>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ children, ...props }, ref) => (
  <ChakraTableCell
    ref={ref}
    fontSize="sm"
    {...props}
  >
    {children}
  </ChakraTableCell>
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ children, ...props }, ref) => (
  <ChakraTableCaption
    ref={ref}
    color="gray.600"
    _dark={{ color: "gray.400" }}
    fontSize="sm"
    {...props}
  >
    {children}
  </ChakraTableCaption>
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
