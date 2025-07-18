
import { ReactNode } from 'react'
import { Menu, ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ContrastToggle, FontSizeControl } from '@/components/accessibility/ContrastToggle'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
  children?: ReactNode
  className?: string
  title?: string
  breadcrumbs?: BreadcrumbItem[]
}

// Mapeamento de rotas para títulos e breadcrumbs
const routeConfig: Record<string, { title: string; breadcrumbs: BreadcrumbItem[] }> = {
  '/': { title: 'Dashboard', breadcrumbs: [{ label: 'Dashboard' }] },
  '/transactions': { title: 'Transações', breadcrumbs: [{ label: 'Dashboard', href: '/' }, { label: 'Transações' }] },
  '/categories': { title: 'Categorias', breadcrumbs: [{ label: 'Dashboard', href: '/' }, { label: 'Categorias' }] },
  '/budgets': { title: 'Orçamentos', breadcrumbs: [{ label: 'Dashboard', href: '/' }, { label: 'Orçamentos' }] },
  '/reports': { title: 'Relatórios', breadcrumbs: [{ label: 'Dashboard', href: '/' }, { label: 'Relatórios' }] },
}

export function Header({ 
  onMenuClick, 
  showMenuButton = true, 
  children, 
  className,
  title,
  breadcrumbs
}: HeaderProps) {
  const location = useLocation()
  const currentRoute = routeConfig[location.pathname]
  
  const displayTitle = title || currentRoute?.title || 'Finanças+'
  const displayBreadcrumbs = breadcrumbs || currentRoute?.breadcrumbs || []

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container-padding">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0"
                onClick={onMenuClick}
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              {/* Mobile: Apenas título */}
              <div className="lg:hidden">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {displayTitle}
                </h1>
              </div>
              
              {/* Desktop: Breadcrumb + Título */}
              <div className="hidden lg:block">
                {displayBreadcrumbs.length > 0 && (
                  <Breadcrumb className="mb-1">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to="/" className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            <span className="sr-only">Home</span>
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {displayBreadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                          </BreadcrumbSeparator>
                          <BreadcrumbItem>
                            {crumb.href ? (
                              <BreadcrumbLink asChild>
                                <Link to={crumb.href}>{crumb.label}</Link>
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        </div>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
                <h1 className="text-xl font-semibold text-foreground">
                  {displayTitle}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
            <FontSizeControl className="hidden sm:flex" />
            <ContrastToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
