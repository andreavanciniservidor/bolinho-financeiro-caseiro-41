import { useState, useEffect } from 'react';

/**
 * Hook para detectar se a aplicação está sendo executada em um dispositivo móvel
 * Útil para otimizar a renderização de componentes pesados em dispositivos com menos recursos
 * 
 * @param mobileBreakpoint Largura máxima da tela para considerar como dispositivo móvel (em pixels)
 * @returns Booleano indicando se é um dispositivo móvel
 */
export function useMobile(mobileBreakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    // Verificar inicialmente
    checkMobile();

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkMobile);

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [mobileBreakpoint]);

  return isMobile;
}

/**
 * Hook para detectar o tipo de dispositivo com mais detalhes
 * 
 * @returns Objeto com informações sobre o tipo de dispositivo
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    width: 0
  });

  useEffect(() => {
    // Função para verificar o tipo de dispositivo
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setDeviceType({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLargeDesktop: width >= 1280,
        width
      });
    };

    // Verificar inicialmente
    checkDeviceType();

    // Adicionar listener para redimensionamento com throttling
    let timeoutId: number | null = null;
    const handleResize = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(checkDeviceType, 200);
    };

    window.addEventListener('resize', handleResize);

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return deviceType;
}