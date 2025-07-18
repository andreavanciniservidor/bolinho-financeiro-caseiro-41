import React, { useEffect, useRef } from 'react';
import { createFocusTrap } from '@/utils/focusManagement';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

/**
 * Componente que cria um trap de foco para acessibilidade
 * Útil para modais, dropdowns e outros componentes que precisam manter o foco dentro deles
 */
export function FocusTrap({ children, active = true, className }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) return;
    
    // Criar trap de foco quando o componente for montado e estiver ativo
    const removeTrap = createFocusTrap(containerRef.current);
    
    // Adicionar atributo para estilização
    if (containerRef.current) {
      containerRef.current.setAttribute('data-focus-trap', 'active');
    }
    
    // Remover trap quando o componente for desmontado ou desativado
    return () => {
      removeTrap();
      if (containerRef.current) {
        containerRef.current.removeAttribute('data-focus-trap');
      }
    };
  }, [active]);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}