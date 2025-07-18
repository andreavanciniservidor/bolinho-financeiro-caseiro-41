import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  /**
   * Dados a serem renderizados na lista
   */
  data: T[];
  
  /**
   * Função de renderização para cada item
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /**
   * Altura de cada item em pixels
   */
  itemHeight: number;
  
  /**
   * Altura do container em pixels ou string CSS
   */
  height: number | string;
  
  /**
   * Número de itens para renderizar além da área visível (buffer)
   */
  overscan?: number;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
  
  /**
   * ID único para a lista
   */
  id?: string;
  
  /**
   * Função chamada quando o scroll chega próximo ao fim da lista
   */
  onEndReached?: () => void;
  
  /**
   * Distância do fim da lista para acionar onEndReached (em pixels)
   */
  endReachedThreshold?: number;
}

/**
 * Componente de lista virtualizada para renderizar grandes volumes de dados
 * com melhor performance
 */
export function VirtualList<T>({
  data,
  renderItem,
  itemHeight,
  height,
  overscan = 5,
  className,
  id,
  onEndReached,
  endReachedThreshold = 200
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Calcular índices visíveis
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  // Itens visíveis
  const visibleItems = data.slice(startIndex, endIndex + 1);
  
  // Altura total da lista
  const totalHeight = data.length * itemHeight;
  
  // Offset para posicionar os itens visíveis
  const offsetY = startIndex * itemHeight;
  
  // Manipulador de scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
      setScrollTop(scrollTop);
      
      // Verificar se chegou próximo ao fim da lista
      if (
        onEndReached &&
        scrollHeight - scrollTop - clientHeight < endReachedThreshold
      ) {
        onEndReached();
      }
    }
  }, [onEndReached, endReachedThreshold]);
  
  // Atualizar altura do container quando montado
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
      
      // Observar redimensionamento
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }
  }, []);
  
  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      style={{ height }}
      onScroll={handleScroll}
      id={id}
      role="list"
      aria-label="Lista virtualizada"
    >
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: totalHeight }}
      >
        <div
          className="absolute top-0 left-0 right-0"
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              role="listitem"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}