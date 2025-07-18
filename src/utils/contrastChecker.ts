/**
 * Utilitário para verificar o contraste de cores de acordo com as diretrizes WCAG 2.1
 * 
 * Baseado nas fórmulas do W3C:
 * https://www.w3.org/TR/WCAG21/#contrast-minimum
 */

/**
 * Converte uma cor hexadecimal para RGB
 * @param hex Cor em formato hexadecimal (#RRGGBB)
 * @returns Array com valores RGB [r, g, b]
 */
export function hexToRgb(hex: string): [number, number, number] {
  // Remover o # se existir
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Converter para RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return [r, g, b];
}

/**
 * Calcula a luminância relativa de uma cor
 * @param rgb Array com valores RGB [r, g, b]
 * @returns Luminância relativa (0-1)
 */
export function calculateLuminance(rgb: [number, number, number]): number {
  // Normalizar valores RGB para 0-1
  const [r, g, b] = rgb.map(value => {
    const normalized = value / 255;
    
    // Aplicar correção gamma
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  // Calcular luminância usando fórmula WCAG
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calcula a razão de contraste entre duas cores
 * @param color1 Primeira cor em formato hexadecimal
 * @param color2 Segunda cor em formato hexadecimal
 * @returns Razão de contraste (1-21)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateLuminance(hexToRgb(color1));
  const luminance2 = calculateLuminance(hexToRgb(color2));
  
  // Garantir que a cor mais clara seja usada como L1
  const lighterLuminance = Math.max(luminance1, luminance2);
  const darkerLuminance = Math.min(luminance1, luminance2);
  
  // Calcular razão de contraste
  return (lighterLuminance + 0.05) / (darkerLuminance + 0.05);
}

/**
 * Verifica se o contraste atende aos critérios WCAG 2.1
 * @param contrastRatio Razão de contraste
 * @param level Nível de conformidade ('AA' ou 'AAA')
 * @param isLargeText Se o texto é considerado grande (>=18pt ou >=14pt bold)
 * @returns Se o contraste atende aos critérios
 */
export function meetsContrastRequirements(
  contrastRatio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  if (level === 'AA') {
    return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
  } else {
    return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
  }
}

/**
 * Verifica se uma cor tem contraste suficiente com outra cor
 * @param foreground Cor do texto em formato hexadecimal
 * @param background Cor do fundo em formato hexadecimal
 * @param level Nível de conformidade ('AA' ou 'AAA')
 * @param isLargeText Se o texto é considerado grande (>=18pt ou >=14pt bold)
 * @returns Se o contraste atende aos critérios
 */
export function hasEnoughContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const contrastRatio = calculateContrastRatio(foreground, background);
  return meetsContrastRequirements(contrastRatio, level, isLargeText);
}

/**
 * Gera uma cor de texto com contraste adequado para um fundo
 * @param backgroundColor Cor de fundo em formato hexadecimal
 * @param preferredColor Cor preferida para o texto (opcional)
 * @returns Cor com contraste adequado (#RRGGBB)
 */
export function getAccessibleTextColor(
  backgroundColor: string,
  preferredColor?: string
): string {
  // Se uma cor preferida foi fornecida e tem contraste suficiente, use-a
  if (preferredColor && hasEnoughContrast(preferredColor, backgroundColor)) {
    return preferredColor;
  }
  
  // Calcular luminância do fundo
  const backgroundLuminance = calculateLuminance(hexToRgb(backgroundColor));
  
  // Escolher entre preto ou branco com base na luminância
  return backgroundLuminance > 0.5 ? '#000000' : '#FFFFFF';
}