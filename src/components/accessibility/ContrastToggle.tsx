import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasEnoughContrast } from '@/utils/contrastChecker';

interface ContrastToggleProps {
  className?: string;
}

/**
 * Verifica se as cores da aplicação têm contraste suficiente
 * @returns Objeto com resultados da verificação
 */
export function checkApplicationContrast(): { 
  passed: boolean; 
  issues: Array<{ element: string; foreground: string; background: string; ratio: number }> 
} {
  const issues: Array<{ element: string; foreground: string; background: string; ratio: number }> = [];
  
  // Obter variáveis CSS de cores
  const styles = getComputedStyle(document.documentElement);
  const foreground = styles.getPropertyValue('--foreground').trim() || '#000000';
  const background = styles.getPropertyValue('--background').trim() || '#ffffff';
  const primary = styles.getPropertyValue('--primary').trim() || '#3b82f6';
  const primaryForeground = styles.getPropertyValue('--primary-foreground').trim() || '#ffffff';
  const secondary = styles.getPropertyValue('--secondary').trim() || '#f3f4f6';
  const secondaryForeground = styles.getPropertyValue('--secondary-foreground').trim() || '#111827';
  const muted = styles.getPropertyValue('--muted').trim() || '#f3f4f6';
  const mutedForeground = styles.getPropertyValue('--muted-foreground').trim() || '#6b7280';
  
  // Verificar contraste de texto normal
  if (!hasEnoughContrast(foreground, background, 'AA', false)) {
    issues.push({
      element: 'Texto normal',
      foreground,
      background,
      ratio: 0 // Calcular razão real aqui
    });
  }
  
  // Verificar contraste de botões primários
  if (!hasEnoughContrast(primaryForeground, primary, 'AA', false)) {
    issues.push({
      element: 'Botões primários',
      foreground: primaryForeground,
      background: primary,
      ratio: 0
    });
  }
  
  // Verificar contraste de botões secundários
  if (!hasEnoughContrast(secondaryForeground, secondary, 'AA', false)) {
    issues.push({
      element: 'Botões secundários',
      foreground: secondaryForeground,
      background: secondary,
      ratio: 0
    });
  }
  
  // Verificar contraste de texto muted
  if (!hasEnoughContrast(mutedForeground, background, 'AA', false)) {
    issues.push({
      element: 'Texto muted',
      foreground: mutedForeground,
      background,
      ratio: 0
    });
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Componente para alternar entre modo de alto contraste
 */
export function ContrastToggle({ className }: ContrastToggleProps) {
  const [highContrast, setHighContrast] = React.useState(false);
  const [contrastIssues, setContrastIssues] = React.useState<number>(0);

  // Verificar contraste ao montar o componente
  React.useEffect(() => {
    const { issues } = checkApplicationContrast();
    setContrastIssues(issues.length);
  }, []);

  // Aplicar classe ao body quando o modo de alto contraste estiver ativo
  React.useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setHighContrast(!highContrast)}
      className={cn(className)}
      aria-pressed={highContrast}
      aria-label={highContrast ? "Desativar modo de alto contraste" : "Ativar modo de alto contraste"}
    >
      <Eye className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">
        {highContrast ? "Desativar modo de alto contraste" : "Ativar modo de alto contraste"}
      </span>
    </Button>
  );
}

interface FontSizeControlProps {
  className?: string;
}

/**
 * Componente para controlar o tamanho da fonte
 */
export function FontSizeControl({ className }: FontSizeControlProps) {
  // Tamanhos de fonte disponíveis: normal (100%), grande (120%), extra grande (140%)
  const fontSizes = ['normal', 'large', 'x-large'];
  const [currentSize, setCurrentSize] = React.useState('normal');

  // Aplicar classe ao body quando o tamanho da fonte mudar
  React.useEffect(() => {
    // Remover todas as classes de tamanho de fonte
    document.documentElement.classList.remove('font-size-normal', 'font-size-large', 'font-size-x-large');
    // Adicionar a classe atual
    document.documentElement.classList.add(`font-size-${currentSize}`);
  }, [currentSize]);

  const increaseSize = () => {
    const currentIndex = fontSizes.indexOf(currentSize);
    if (currentIndex < fontSizes.length - 1) {
      setCurrentSize(fontSizes[currentIndex + 1]);
    }
  };

  const decreaseSize = () => {
    const currentIndex = fontSizes.indexOf(currentSize);
    if (currentIndex > 0) {
      setCurrentSize(fontSizes[currentIndex - 1]);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={decreaseSize}
        disabled={currentSize === fontSizes[0]}
        aria-label="Diminuir tamanho da fonte"
      >
        <ZoomOut className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Diminuir tamanho da fonte</span>
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={increaseSize}
        disabled={currentSize === fontSizes[fontSizes.length - 1]}
        aria-label="Aumentar tamanho da fonte"
      >
        <ZoomIn className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Aumentar tamanho da fonte</span>
      </Button>
    </div>
  );
}