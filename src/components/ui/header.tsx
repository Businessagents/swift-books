import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PrivacyToggle } from "@/components/ui/privacy-toggle"
import { Bell, User, Settings, Brain, Menu, X, LogOut, Banknote } from "lucide-react"
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg shadow-sm">
      <div className="container flex h-16 items-center">
        {/* Clean Logo */}
        <div className="mr-6 flex">
          <div className="mr-8 flex items-center space-x-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary">
              <div className="h-8 w-8 rounded-lg bg-primary-foreground flex items-center justify-center">
                <span className="text-xs font-bold text-primary">SB</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-foreground">Swift Books</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Smart Business Finance</span>
            </div>
          </div>
        </div>
        
        {/* Clean Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-between space-x-4">
          <nav className="flex items-center space-x-8 text-sm font-medium">
            <Link className="px-3 py-2 rounded-lg transition-all duration-200 bg-primary/10 text-primary font-semibold" to="/">
              Dashboard
            </Link>
            <Link className="px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground" to="/invoices">
              Invoices
            </Link>
            <Link className="px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground" to="/expenses">
              Expenses
            </Link>
            <Link className="px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground" to="/banking">
              Banking
            </Link>
            <Link className="px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground" to="/reports">
              Reports
            </Link>
          </nav>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <PrivacyToggle />
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse"></span>
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out" className="hover:bg-destructive/10 hover:text-destructive transition-colors">
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
              to="/banking"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Banking
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