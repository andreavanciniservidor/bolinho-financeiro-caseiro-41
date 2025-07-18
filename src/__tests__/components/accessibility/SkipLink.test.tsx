import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { SkipLink } from '@/components/accessibility/SkipLink';

describe('SkipLink', () => {
  it('renders correctly with default props', () => {
    render(<SkipLink href="#main">Pular para o conteúdo</SkipLink>);
    
    const link = screen.getByText('Pular para o conteúdo');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main');
    expect(link).toHaveClass('sr-only');
  });
  
  it('applies custom className', () => {
    render(
      <SkipLink href="#main" className="custom-class">
        Pular para o conteúdo
      </SkipLink>
    );
    
    const link = screen.getByText('Pular para o conteúdo');
    expect(link).toHaveClass('custom-class');
  });
  
  it('passes additional props to the anchor element', () => {
    render(
      <SkipLink href="#main" data-testid="skip-link" aria-label="Skip to main content">
        Pular para o conteúdo
      </SkipLink>
    );
    
    const link = screen.getByTestId('skip-link');
    expect(link).toHaveAttribute('aria-label', 'Skip to main content');
  });
});