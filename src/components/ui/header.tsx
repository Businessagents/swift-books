import { Button } from "@/components/ui/button"
import { Bell, User, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <div className="mr-6 flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-gradient-primary"></div>
            <span className="font-bold text-lg">UFCH</span>
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
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
      </div>
    </header>
  )
}