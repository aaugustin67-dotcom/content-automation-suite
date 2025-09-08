import { Button } from '@/components/ui/button.jsx'
import { Zap, User, Settings, HelpCircle } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ContentFlow
            </h1>
            <p className="text-xs text-muted-foreground">AI-Powered Content Automation</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Analytics
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Help
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Account
          </Button>
        </div>
      </div>
    </header>
  )
}

