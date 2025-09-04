'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Building2, 
  FileText, 
  Home, 
  Users, 
  TrendingUp, 
  Menu, 
  X,
  Plus,
  Settings,
  BarChart3,
  LogOut,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Übersicht und Schnellzugriff'
  },
  {
    title: 'Kunden',
    href: '/customers',
    icon: Building2,
    description: 'Kunden verwalten',
    subItems: [
      {
        title: 'Alle Kunden',
        href: '/customers',
        icon: Building2
      },
      {
        title: 'Neuer Kunde',
        href: '/customers/create',
        icon: Plus
      }
    ]
  },
  {
    title: 'Tally Formulare',
    href: '/tally',
    icon: FileText,
    description: 'Formulare und Vorlagen',
    subItems: [
      {
        title: 'Alle Formulare',
        href: '/tally',
        icon: FileText
      },
      {
        title: 'AI Formular erstellen',
        href: '/tally/ai-create',
        icon: Plus
      },
      {
        title: 'Analysen',
        href: '/tally/analytics',
        icon: BarChart3
      }
    ]
  },
  {
    title: 'Einstellungen',
    href: '/settings',
    icon: Settings,
    description: 'Konfiguration und API-Schlüssel',
    subItems: [
      {
        title: 'API-Schlüssel',
        href: '/settings/api-keys',
        icon: Settings
      },
      {
        title: 'Benutzer',
        href: '/settings/users',
        icon: Users
      }
    ]
  }
]

interface NavigationProps {
  customerCount?: number
  surveyCount?: number
}

export function Navigation({ customerCount = 0, surveyCount = 0 }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<{email: string, role: string} | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const isSubItemActive = (href: string) => {
    return pathname === href
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-slate-200/50 lg:bg-white/60 lg:backdrop-blur-sm">
        <div className="flex flex-col flex-grow pt-8 overflow-y-auto">
          {/* Logo/Header */}
          <div className="px-6 mb-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Survey Platform</h1>
                <p className="text-sm text-slate-600">Management System</p>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-lg font-bold text-blue-900">{customerCount}</p>
                <p className="text-xs text-blue-600">Kunden</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-lg font-bold text-purple-900">{surveyCount}</p>
                <p className="text-xs text-purple-600">Formulare</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isItemActive = isActive(item.href)
              const isExpanded = expandedItems.includes(item.href)
              
              return (
                <div key={item.href}>
                  {/* Main Item */}
                  <div className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isItemActive ? 'bg-blue-100' : 'hover:bg-slate-100'
                  )}>
                    <Link 
                      href={item.href} 
                      className={cn(
                        "flex items-center gap-3 flex-1 rounded-md px-0 py-0 transition-colors",
                        isItemActive
                          ? 'text-blue-900'
                          : 'text-slate-700 hover:text-slate-900'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                    {item.subItems && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleExpanded(item.href)
                        }}
                        className={cn(
                          "ml-2 p-1 rounded hover:bg-slate-200 transition-colors",
                          isItemActive
                            ? 'text-blue-700 hover:bg-blue-200'
                            : 'text-slate-500 hover:text-slate-700'
                        )}
                      >
                        {isExpanded ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Sub Items */}
                  {item.subItems && isExpanded && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                              isSubItemActive(subItem.href)
                                ? 'bg-blue-50 text-blue-800 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                            )}
                          >
                            <SubIcon className="w-4 h-4" />
                            {subItem.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User Footer */}
          <div className="p-6 border-t border-slate-200/50 space-y-4">
            {/* Current User */}
            {currentUser && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {currentUser.email}
                  </p>
                  <p className="text-xs text-slate-600">
                    {currentUser.role === 'ADMIN' ? 'Administrator' : 'Benutzer'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full text-slate-700 hover:text-red-600 hover:border-red-300"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2"></div>
                  Abmelden...
                </div>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </>
              )}
            </Button>
            
            <div className="text-xs text-center text-slate-500">
              Survey Management v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="font-bold text-slate-900">Survey Platform</h1>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-900">{customerCount}</p>
                    <p className="text-xs text-blue-600">Kunden</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-purple-900">{surveyCount}</p>
                    <p className="text-xs text-purple-600">Formulare</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto">
                <nav className="px-6 py-4 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isItemActive = isActive(item.href)
                    
                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isItemActive
                              ? 'bg-blue-100 text-blue-900'
                              : 'text-slate-700 hover:bg-slate-100'
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.title}</span>
                          {isItemActive && (
                            <Badge variant="secondary" className="ml-auto">
                              Active
                            </Badge>
                          )}
                        </Link>

                        {/* Mobile Sub Items */}
                        {item.subItems && isItemActive && (
                          <div className="ml-8 mt-2 space-y-1">
                            {item.subItems.map((subItem) => {
                              const SubIcon = subItem.icon
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={cn(
                                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                                    isSubItemActive(subItem.href)
                                      ? 'bg-blue-50 text-blue-800 font-medium'
                                      : 'text-slate-600 hover:bg-slate-50'
                                  )}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <SubIcon className="w-4 h-4" />
                                  {subItem.title}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </nav>
              </div>

              {/* Mobile User Footer */}
              <div className="px-6 py-4 border-t border-slate-200 space-y-4">
                {/* Current User */}
                {currentUser && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {currentUser.email}
                      </p>
                      <p className="text-xs text-slate-600">
                        {currentUser.role === 'ADMIN' ? 'Administrator' : 'Benutzer'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Mobile Logout Button */}
                <Button
                  variant="outline"
                  className="w-full text-slate-700 hover:text-red-600 hover:border-red-300"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2"></div>
                      Abmelden...
                    </div>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Abmelden
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}