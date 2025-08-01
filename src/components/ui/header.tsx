import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PrivacyToggle } from "@/components/ui/privacy-toggle"
import { Bell, User, Settings, Brain, Menu, X, LogOut } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <div className="mr-6 flex items-center space-x-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Swift Books</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-between space-x-2">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link className="transition-colors hover:text-foreground/80 text-foreground" to="/">
              Dashboard
            </Link>
            <Link className="transition-colors hover:text-foreground/80 text-muted-foreground" to="/invoices">
              Invoices
            </Link>
            <Link className="transition-colors hover:text-foreground/80 text-muted-foreground" to="/expenses">
              Expenses
            </Link>
            <Link className="transition-colors hover:text-foreground/80 text-muted-foreground" to="/reports">
              Reports
            </Link>
          </nav>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <PrivacyToggle />
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <PrivacyToggle />
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="h-4 w-4" />
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
            <Link 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground rounded-md hover:bg-muted"
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground rounded-md hover:bg-muted"
              to="/invoices"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Invoices
            </Link>
            <Link 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground rounded-md hover:bg-muted"
              to="/expenses"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Expenses
            </Link>
            <Link 
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground rounded-md hover:bg-muted"
              to="/reports"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reports
            </Link>
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