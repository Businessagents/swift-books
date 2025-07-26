import { Button } from "@/components/ui/button"
import { Bell, User, Settings, Brain, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <div className="mr-6 flex items-center space-x-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">finwize.ai</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-between space-x-2">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a className="transition-colors hover:text-foreground/80 text-foreground" href="/">
              Dashboard
            </a>
            <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/invoices">
              Invoices
            </a>
            <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/expenses">
              Expenses
            </a>
            <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/reports">
              Reports
            </a>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container py-4 space-y-2">
            <a 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground rounded-md hover:bg-muted"
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            <a 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground rounded-md hover:bg-muted"
              href="/invoices"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Invoices
            </a>
            <a 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground rounded-md hover:bg-muted"
              href="/expenses"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Expenses
            </a>
            <a 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground rounded-md hover:bg-muted"
              href="/reports"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reports
            </a>
            <div className="px-4 py-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}