
import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

// Estender o expect do Vitest para incluir o matcher toHaveNoViolations
expect.extend(toHaveNoViolations);

/**
 * Testa a acessibilidade de um componente usando axe-core
 * @param ui Componente React a ser testado
 * @param options Opções para o axe
 * @returns Resultado do teste de acessibilidade
 */
export async function testAccessibility(
  ui: ReactElement,
  options?: Parameters<typeof axe>[1]
) {
  const container = render(ui).container;
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Verifica se um elemento é acessível via teclado
 * @param element Elemento a ser testado
 * @returns Booleano indicando se o elemento é acessível via teclado
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  // Verificar se o elemento é focável
  const isFocusable = element.tabIndex >= 0 || 
    ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
  
  // Verificar se o elemento tem role apropriado
  const hasRole = element.getAttribute('role') !== null;
  
  // Verificar se o elemento tem label ou aria-label
  const hasLabel = element.getAttribute('aria-label') !== null || 
    element.getAttribute('aria-labelledby') !== null;
  
  return isFocusable && (hasRole || hasLabel);
}

/**
 * Verifica o contraste de cores de um elemento
 * @param element Elemento a ser testado
 * @returns Objeto com informações sobre o contraste
 */
export function checkColorContrast(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  const foreground = styles.color;
  const background = styles.backgroundColor;
  
  // Converter cores para RGB
  const getRGB = (color: string) => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (!match) return [0, 0, 0];
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  };
  
  const fgRGB = getRGB(foreground);
  const bgRGB = getRGB(background);
  
  // Calcular luminância relativa
  const getLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map(c => {
      const val = c / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const fgLuminance = getLuminance(fgRGB);
  const bgLuminance = getLuminance(bgRGB);
  
  // Calcular razão de contraste
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const contrast = (lighter + 0.05) / (darker + 0.05);
  
  // Verificar se atende aos critérios WCAG
  const isLargeText = parseInt(styles.fontSize) >= 18 || 
    (parseInt(styles.fontSize) >= 14 && styles.fontWeight === 'bold');
  
  const passesAA = isLargeText ? contrast >= 3 : contrast >= 4.5;
  const passesAAA = isLargeText ? contrast >= 4.5 : contrast >= 7;
  
  return {
    contrast,
    passesAA,
    passesAAA,
    foreground,
    background,
    isLargeText
  };
}
