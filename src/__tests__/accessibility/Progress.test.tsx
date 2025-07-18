import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/progress';
import { testAccessibility, checkColorContrast } from '../utils/accessibility-utils';

describe('Progress Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await testAccessibility(<Progress value={50} />);
  });

  it('should have proper ARIA attributes', () => {
    render(<Progress value={75} />);
    const progressBar = screen.getByRole('progressbar');
    
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label', 'Progresso');
  });

  it('should have sufficient color contrast', () => {
    render(<Progress value={50} />);
    const progressBar = screen.getByRole('progressbar');
    const contrastInfo = checkColorContrast(progressBar);
    
    expect(contrastInfo.passesAA).toBe(true);
  });

  it('should provide screen reader text with percentage', () => {
    render(<Progress value={33} />);
    const srText = screen.getByText('33% completo');
    
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('should accept custom label for better accessibility', () => {
    render(<Progress value={50} label="Download progress" />);
    const progressBar = screen.getByRole('progressbar');
    
    expect(progressBar).toHaveAttribute('aria-label', 'Download progress');
  });
});