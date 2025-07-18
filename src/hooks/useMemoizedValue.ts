import { useMemo, useRef, useEffect } from 'react';

/**
 * Hook para memoizar valores com dependências profundas
 * Útil para evitar recálculos desnecessários em componentes pesados
 * 
 * @param factory Função que calcula o valor
 * @param deps Array de dependências
 * @param equalityFn Função opcional para comparar dependências (deep equality)
 * @returns Valor memoizado
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  equalityFn?: (prev: React.DependencyList, next: React.DependencyList) => boolean
): T {
  // Referência para as dependências anteriores
  const prevDepsRef = useRef<React.DependencyList | undefined>(undefined);
  
  // Referência para o valor calculado
  const valueRef = useRef<T | undefined>(undefined);
  
  // Função padrão de comparação (shallow equality)
  const defaultEqualityFn = (prev: React.DependencyList, next: React.DependencyList): boolean => {
    if (prev.length !== next.length) return false;
    return prev.every((val, i) => Object.is(val, next[i]));
  };
  
  // Usar a função de comparação fornecida ou a padrão
  const areEqual = equalityFn || defaultEqualityFn;
  
  // Verificar se as dependências mudaram
  const depsChanged = !prevDepsRef.current || !areEqual(prevDepsRef.current, deps);
  
  // Atualizar o valor se as dependências mudaram
  if (depsChanged) {
    valueRef.current = factory();
    prevDepsRef.current = deps;
  }
  
  // Atualizar a referência das dependências
  useEffect(() => {
    prevDepsRef.current = deps;
  }, deps);
  
  return valueRef.current as T;
}

/**
 * Hook para memoizar funções com dependências profundas
 * Similar ao useCallback, mas com suporte a comparação profunda
 * 
 * @param callback Função a ser memoizada
 * @param deps Array de dependências
 * @param equalityFn Função opcional para comparar dependências (deep equality)
 * @returns Função memoizada
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  equalityFn?: (prev: React.DependencyList, next: React.DependencyList) => boolean
): T {
  return useMemoizedValue(() => callback, deps, equalityFn);
}

/**
 * Hook para memoizar valores com comparação profunda de objetos
 * 
 * @param value Valor a ser memoizado
 * @param deps Array de dependências
 * @returns Valor memoizado
 */
export function useDeepMemo<T>(value: T, deps: React.DependencyList): T {
  return useMemo(() => value, deps);
}