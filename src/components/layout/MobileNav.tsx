import { ReactNode } from 'react'
import { X, PiggyBank } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  children?: ReactNode
  title?: string
  className?: string
  showBranding?: boolean
}

export function MobileNav({ 
  isOpen, 
  onClose, 
  children, 
  title = "Menu de Navegação",
  className,
  showBranding = true
}: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className={cn(
          "w-[280px] sm:w-[320px] p-0 flex flex-col",
          className
        )}
      >
        {showBranding && (
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <PiggyBank className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <SheetTitle className="text-base font-semibold text-foreground truncate">
                    Finanças+
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground truncate">
                    Controle Financeiro
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fechar menu"
                className="flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
        )}
        
        <div className="flex-1 overflow-y-auto py-2">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MobileNavItemProps {
  children: ReactNode
  onClick?: () => void
  active?: boolean
  className?: string
  href?: string
  icon?: ReactNode
}

export function MobileNavItem({ 
  children, 
  onClick, 
  active = false, 
  className,
  href,
  icon
}: MobileNavItemProps) {
  const baseClasses = cn(
    "w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200",
    "hover:bg-accent hover:text-accent-foreground",
    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
    "active:scale-[0.98]",
    active && "bg-accent text-accent-foreground font-medium border-r-2 border-primary",
    className
  )

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </>
  )

  if (href) {
    return (
      <NavLink
        to={href}
        onClick={onClick}
        className={({ isActive }) => cn(baseClasses, isActive && "bg-accent text-accent-foreground font-medium border-r-2 border-primary")}
      >
        {content}
      </NavLink>
    )
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  )
}

interface MobileNavSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function MobileNavSection({ title, children, className }: MobileNavSectionProps) {
  return (
    <div className={cn("py-2", className)}>
      <div className="px-6 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="space-y-1">
        {children}
      </div>
      <Separator className="my-2" />
    </div>
  )
}