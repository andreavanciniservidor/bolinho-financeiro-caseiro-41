import { useEffect, useRef } from 'react';
import { setupArrowKeyNavigation, setupHomeEndNavigation } from '@/utils/focusManagement';

interface FocusNavigationOptions {
  arrowKeys?: boolean;
  arrowKeyDirection?: 'horizontal' | 'vertical';
  homeEndKeys?: boolean;
  enabled?: boolean;
}

/**
 * Hook para implementar navegação por teclado em componentes
 * Permite navegação com teclas de seta, Home e End
 * 
 * @param options Opções de configuração
 * @returns Ref para ser aplicado ao container
 */
export function useFocusNavigation({
  arrowKeys = true,
  arrowKeyDirection = 'horizontal',
  homeEndKeys = true,
  enabled = true
}: FocusNavigationOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const cleanupFunctions: Array<() => void> = [];
    
    if (arrowKeys) {
      const cleanup = setupArrowKeyNavigation(containerRef.current, arrowKeyDirection);
      cleanupFunctions.push(cleanup);
    }
    
    if (homeEndKeys) {
      const cleanup = setupHomeEndNavigation(containerRef.current);
      cleanupFunctions.push(cleanup);
    }
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [arrowKeys, arrowKeyDirection, homeEndKeys, enabled]);
  
  return containerRef;
}