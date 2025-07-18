import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SkipLink } from '@/components/accessibility/SkipLink'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background font-sans antialiased",
      "flex flex-col lg:flex-row",
      className
    )}>
      {/* Skip links para acessibilidade */}
      <SkipLink href="#main-content">Pular para o conteúdo principal</SkipLink>
      <SkipLink href="#main-navigation">Pular para a navegação</SkipLink>
      {children}
    </div>
  )
}

interface MainContentProps {
  children: ReactNode
  className?: string
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main 
      id="main-content"
      className={cn(
        "flex-1 overflow-hidden",
        "container-padding section-spacing",
        "w-full max-w-none",
        className
      )}
      tabIndex={-1} // Permite receber foco quando acessado via skip link
    >
      {children}
    </main>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col gap-4 pb-6 border-b border-border",
      "sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-responsive">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}

interface ContentSectionProps {
  children: ReactNode
  className?: string
}

export function ContentSection({ children, className }: ContentSectionProps) {
  return (
    <section className={cn(
      "space-y-6 pt-6",
      className
    )}>
      {children}
    </section>
  )
}

// Grid Layout Components
interface GridLayoutProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

export function GridLayout({ 
  children, 
  className, 
  cols = 1, 
  gap = 'md' 
}: GridLayoutProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    12: 'grid-cols-12'
  }

  const gridGap = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10'
  }

  return (
    <div className={cn(
      "grid",
      gridCols[cols],
      gridGap[gap],
      className
    )}>
      {children}
    </div>
  )
}

interface FlexLayoutProps {
  children: ReactNode
  className?: string
  direction?: 'row' | 'col'
  wrap?: boolean
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'center' | 'end' | 'stretch'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

export function FlexLayout({ 
  children, 
  className,
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 'md'
}: FlexLayoutProps) {
  const flexDirection = {
    row: 'flex-row',
    col: 'flex-col'
  }

  const flexJustify = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const flexAlign = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const flexGap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  return (
    <div className={cn(
      "flex",
      flexDirection[direction],
      wrap && 'flex-wrap',
      flexJustify[justify],
      flexAlign[align],
      flexGap[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Container Components
interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
}

export function Container({ 
  children, 
  className, 
  size = 'lg',
  padding = true 
}: ContainerProps) {
  const containerSizes = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <div className={cn(
      "mx-auto w-full",
      containerSizes[size],
      padding && "container-padding",
      className
    )}>
      {children}
    </div>
  )
}

// Card Layout Components
interface CardLayoutProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: boolean
  border?: boolean
}

export function CardLayout({ 
  children, 
  className,
  padding = 'md',
  shadow = true,
  border = true
}: CardLayoutProps) {
  const cardPadding = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div className={cn(
      "bg-card text-card-foreground rounded-lg",
      cardPadding[padding],
      shadow && "shadow-sm hover:shadow-md transition-shadow duration-200",
      border && "border border-border",
      className
    )}>
      {children}
    </div>
  )
}

// Stack Layout Component
interface StackProps {
  children: ReactNode
  className?: string
  space?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Stack({ children, className, space = 'md' }: StackProps) {
  const stackSpace = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  }

  return (
    <div className={cn(
      "flex flex-col",
      stackSpace[space],
      className
    )}>
      {children}
    </div>
  )
}