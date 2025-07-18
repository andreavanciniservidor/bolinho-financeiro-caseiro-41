/**
 * Utilitário para gerenciar o foco em componentes interativos
 * seguindo as diretrizes de acessibilidade WCAG 2.1
 * 
 * Implementa:
 * - Navegação por teclado
 * - Indicadores visuais de foco
 * - Trap focus para modais e dropdowns
 * - Skip links para navegação rápida
 */

import React from 'react';

/**
 * Foca o primeiro elemento focável dentro de um container
 * @param container Elemento HTML que contém elementos focáveis
 * @returns O elemento que recebeu o foco ou null se nenhum elemento focável foi encontrado
 */
export const focusFirstElement = (container: HTMLElement | null): HTMLElement | null => {
  if (!container) return null;

  // Seletores para elementos focáveis comuns
  const focusableSelectors = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex="0"]',
    'details:not([disabled]):not([tabindex="-1"])',
    'summary:not([disabled]):not([tabindex="-1"])'
  ].join(',');

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  );

  // Ordenar por tabindex (elementos com tabindex > 0 primeiro)
  const sortedElements = focusableElements.sort((a, b) => {
    const aTabIndex = a.tabIndex || 0;
    const bTabIndex = b.tabIndex || 0;
    
    if (aTabIndex === 0 && bTabIndex === 0) return 0;
    if (aTabIndex === 0) return 1;
    if (bTabIndex === 0) return -1;
    return aTabIndex - bTabIndex;
  });

  if (sortedElements.length > 0) {
    sortedElements[0].focus();
    return sortedElements[0];
  }

  return null;
};

/**
 * Foca o último elemento focável dentro de um container
 * @param container Elemento HTML que contém elementos focáveis
 * @returns O elemento que recebeu o foco ou null se nenhum elemento focável foi encontrado
 */
export const focusLastElement = (container: HTMLElement | null): HTMLElement | null => {
  if (!container) return null;

  const focusableSelectors = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex="0"]',
    'details:not([disabled]):not([tabindex="-1"])',
    'summary:not([disabled]):not([tabindex="-1"])'
  ].join(',');

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  );

  if (focusableElements.length > 0) {
    const lastElement = focusableElements[focusableElements.length - 1];
    lastElement.focus();
    return lastElement;
  }

  return null;
};

/**
 * Cria um trap de foco dentro de um container, impedindo que o foco saia dele
 * @param container Elemento HTML que deve conter o foco
 * @returns Uma função para remover o trap de foco
 */
export const createFocusTrap = (container: HTMLElement | null): (() => void) => {
  if (!container) return () => {};

  const focusableSelectors = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex="0"]',
    'details:not([disabled]):not([tabindex="-1"])',
    'summary:not([disabled]):not([tabindex="-1"])'
  ].join(',');

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  );

  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Salvar o elemento que tinha o foco antes de ativar o trap
  const previousActiveElement = document.activeElement as HTMLElement;

  // Focar o primeiro elemento ao ativar o trap
  firstElement.focus();

  // Handler para o evento keydown
  const handleKeyDown = (event: KeyboardEvent) => {
    // Se a tecla Tab for pressionada
    if (event.key === 'Tab') {
      // Shift + Tab pressionados
      if (event.shiftKey) {
        // Se o foco estiver no primeiro elemento, mova para o último
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } 
      // Apenas Tab pressionado
      else {
        // Se o foco estiver no último elemento, mova para o primeiro
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Se a tecla Escape for pressionada, remova o trap e restaure o foco
    if (event.key === 'Escape') {
      removeTrap();
    }
  };

  // Adicionar o event listener
  document.addEventListener('keydown', handleKeyDown);

  // Função para remover o trap
  const removeTrap = () => {
    document.removeEventListener('keydown', handleKeyDown);
    
    // Restaurar o foco para o elemento que tinha o foco antes
    if (previousActiveElement && previousActiveElement.focus) {
      previousActiveElement.focus();
    }
  };

  return removeTrap;
};

/**
 * Hook para gerenciar o foco em um componente React
 * @param ref Referência para o elemento que deve receber o foco
 * @param shouldFocus Booleano que indica se o elemento deve receber o foco
 */
export const useFocusManagement = (
  ref: React.RefObject<HTMLElement>,
  shouldFocus: boolean = false
) => {
  React.useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [ref, shouldFocus]);
};

/**
 * Adiciona indicadores visuais de foco a todos os elementos interativos
 * Esta função deve ser chamada uma vez na inicialização da aplicação
 */
export const setupFocusIndicators = () => {
  // Adicionar classe ao body quando o usuário estiver navegando por teclado
  const handleFirstTab = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      
      // Remover o event listener após detectar o primeiro Tab
      window.removeEventListener('keydown', handleFirstTab);
      
      // Adicionar event listener para detectar quando o usuário volta a usar o mouse
      window.addEventListener('mousedown', handleMouseDown);
    }
  };

  // Remover classe quando o usuário usar o mouse
  const handleMouseDown = () => {
    document.body.classList.remove('user-is-tabbing');
    
    // Remover o event listener do mouse
    window.removeEventListener('mousedown', handleMouseDown);
    
    // Readicionar o event listener para Tab
    window.addEventListener('keydown', handleFirstTab);
  };

  // Iniciar a detecção
  window.addEventListener('keydown', handleFirstTab);

  // Retornar função de limpeza
  return () => {
    window.removeEventListener('keydown', handleFirstTab);
    window.removeEventListener('mousedown', handleMouseDown);
  };
};

/**
 * Gerencia a navegação por teclas de seta dentro de um container
 * @param container Elemento HTML que contém elementos navegáveis
 * @param direction Direção da navegação ('horizontal' ou 'vertical')
 * @returns Uma função para remover os event listeners
 */
export const setupArrowKeyNavigation = (
  container: HTMLElement | null,
  direction: 'horizontal' | 'vertical' = 'horizontal'
): (() => void) => {
  if (!container) return () => {};

  const navigableSelectors = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    '[role="button"]:not([disabled]):not([tabindex="-1"])',
    '[tabindex="0"]'
  ].join(',');

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignorar se teclas modificadoras estiverem pressionadas
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    const navigableElements = Array.from(
      container.querySelectorAll<HTMLElement>(navigableSelectors)
    );

    if (navigableElements.length === 0) return;

    const currentIndex = navigableElements.findIndex(
      el => el === document.activeElement
    );

    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    if (direction === 'horizontal') {
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % navigableElements.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + navigableElements.length) % navigableElements.length;
      }
    } else {
      if (event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % navigableElements.length;
      } else if (event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + navigableElements.length) % navigableElements.length;
      }
    }

    if (nextIndex !== null) {
      event.preventDefault();
      navigableElements[nextIndex].focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Gerencia a navegação por teclas Home e End dentro de um container
 * @param container Elemento HTML que contém elementos navegáveis
 * @returns Uma função para remover os event listeners
 */
export const setupHomeEndNavigation = (
  container: HTMLElement | null
): (() => void) => {
  if (!container) return () => {};

  const navigableSelectors = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    '[role="button"]:not([disabled]):not([tabindex="-1"])',
    '[tabindex="0"]'
  ].join(',');

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignorar se teclas modificadoras estiverem pressionadas
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    const navigableElements = Array.from(
      container.querySelectorAll<HTMLElement>(navigableSelectors)
    );

    if (navigableElements.length === 0) return;

    if (event.key === 'Home') {
      event.preventDefault();
      navigableElements[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      navigableElements[navigableElements.length - 1].focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

// Exportar um objeto com todas as funções
export const FocusManager = {
  focusFirstElement,
  focusLastElement,
  createFocusTrap,
  setupFocusIndicators,
  setupArrowKeyNavigation,
  setupHomeEndNavigation
};