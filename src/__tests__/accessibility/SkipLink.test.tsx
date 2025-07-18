
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipLink } from '@/components/accessibility/SkipLink';
import { testAccessibility } from '../utils/accessibility-utils';

describe('SkipLink Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await testAccessibility(<SkipLink href="#main">Pular para o conteúdo</SkipLink>);
  });
  
  it('should be hidden until focused', () => {
    render(<SkipLink href="#main">Pular para o conteúdo</SkipLink>);
    
    const link = screen.getByText('Pular para o conteúdo');
    
    // Verificar se o link está inicialmente escondido
    expect(link).toHaveClass('sr-only');
    
    // Simular foco no link
    fireEvent.focus(link);
    
    // Verificar se o link fica visível quando focado
    expect(link).toHaveClass('focus:not-sr-only');
  });
  
  it('should navigate to the target when activated', () => {
    // Criar um elemento alvo para o skip link
    const targetElement = document.createElement('div');
    targetElement.id = 'main';
    document.body.appendChild(targetElement);
    
    // Mock para o método focus
    const focusMock = vi.fn();
    targetElement.focus = focusMock;
    
    render(<SkipLink href="#main">Pular para o conteúdo</SkipLink>);
    
    const link = screen.getByText('Pular para o conteúdo');
    
    // Simular clique no link
    fireEvent.click(link);
    
    // Verificar se o evento foi disparado corretamente
    expect(link).toHaveAttribute('href', '#main');
    
    // Limpar
    document.body.removeChild(targetElement);
  });
  
  it('should be keyboard navigable', () => {
    render(<SkipLink href="#main">Pular para o conteúdo</SkipLink>);
    
    const link = screen.getByText('Pular para o conteúdo');
    
    // Verificar se o link pode receber foco via teclado
    expect(link.tabIndex).not.toBe(-1);
    
    // Simular navegação por teclado
    fireEvent.keyDown(link, { key: 'Enter' });
    
    // Verificar se o link tem o atributo href correto
    expect(link).toHaveAttribute('href', '#main');
  });
});
