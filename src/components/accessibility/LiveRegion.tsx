import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
  role?: 'status' | 'alert' | 'log' | 'timer' | 'marquee' | 'progressbar';
}

/**
 * Componente que cria uma região "live" para leitores de tela
 * Útil para notificações, alertas e atualizações dinâmicas
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = false,
  relevant,
  className,
  role = 'status'
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  
  // Atualizar o conteúdo da região live quando os filhos mudarem
  useEffect(() => {
    if (regionRef.current) {
      // Alguns leitores de tela precisam de uma pequena mudança no DOM
      // para detectar alterações em regiões live
      const currentContent = regionRef.current.innerHTML;
      regionRef.current.innerHTML = '';
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.innerHTML = currentContent;
        }
      }, 100);
    }
  }, [children]);
  
  return (
    <div
      ref={regionRef}
      className={cn('sr-only', className)}
      aria-live={politeness}
      aria-atomic={atomic.toString() as 'true' | 'false'}
      aria-relevant={relevant}
      role={role}
    >
      {children}
    </div>
  );
}

/**
 * Componente para anúncios importantes que devem ser lidos imediatamente
 */
export function Alert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <LiveRegion politeness="assertive" atomic={true} role="alert" className={className}>
      {children}
    </LiveRegion>
  );
}

/**
 * Componente para atualizações de status que não são urgentes
 */
export function Status({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <LiveRegion politeness="polite" atomic={true} role="status" className={className}>
      {children}
    </LiveRegion>
  );
}