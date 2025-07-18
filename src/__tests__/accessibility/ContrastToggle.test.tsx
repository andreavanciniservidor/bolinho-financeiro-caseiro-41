
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { ContrastToggle, FontSizeControl, checkApplicationContrast } from '@/components/accessibility/ContrastToggle';
import { testAccessibility } from '../utils/accessibility-utils';
import { hasEnoughContrast } from '@/utils/contrastChecker';

// Mock the contrastChecker utility
vi.mock('@/utils/contrastChecker', () => ({
  hasEnoughContrast: vi.fn().mockReturnValue(true)
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  ZoomIn: () => <div data-testid="zoom-in-icon">ZoomIn</div>,
  ZoomOut: () => <div data-testid="zoom-out-icon">ZoomOut</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>
}));

describe('ContrastToggle Accessibility', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock document methods
    document.documentElement.classList.add = vi.fn();
    document.documentElement.classList.remove = vi.fn();
  });

  it('should have no accessibility violations', async () => {
    await testAccessibility(<ContrastToggle />);
  });

  it('should have proper ARIA attributes', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('aria-label', 'Ativar modo de alto contraste');
  });

  it('should update ARIA attributes when toggled', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-label', 'Desativar modo de alto contraste');
  });

  it('should include screen reader text', () => {
    render(<ContrastToggle />);
    
    const srText = screen.getByText('Ativar modo de alto contraste');
    expect(srText).toHaveClass('sr-only');
  });

  it('should toggle high contrast mode when clicked', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('high-contrast');
    
    fireEvent.click(button);
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('high-contrast');
  });
});

describe('FontSizeControl Accessibility', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock document methods
    document.documentElement.classList.add = vi.fn();
    document.documentElement.classList.remove = vi.fn();
  });

  it('should have no accessibility violations', async () => {
    await testAccessibility(<FontSizeControl />);
  });

  it('should have proper ARIA attributes on buttons', () => {
    render(<FontSizeControl />);
    
    const decreaseButton = screen.getByLabelText('Diminuir tamanho da fonte');
    const increaseButton = screen.getByLabelText('Aumentar tamanho da fonte');
    
    expect(decreaseButton).toHaveAttribute('aria-label', 'Diminuir tamanho da fonte');
    expect(increaseButton).toHaveAttribute('aria-label', 'Aumentar tamanho da fonte');
  });

  it('should include screen reader text', () => {
    render(<FontSizeControl />);
    
    const decreaseSrText = screen.getByText('Diminuir tamanho da fonte');
    const increaseSrText = screen.getByText('Aumentar tamanho da fonte');
    
    expect(decreaseSrText).toHaveClass('sr-only');
    expect(increaseSrText).toHaveClass('sr-only');
  });

  it('should disable decrease button when at minimum font size', () => {
    render(<FontSizeControl />);
    
    const decreaseButton = screen.getByLabelText('Diminuir tamanho da fonte');
    expect(decreaseButton).toBeDisabled();
  });

  it('should enable decrease button after increasing font size', () => {
    render(<FontSizeControl />);
    
    const increaseButton = screen.getByLabelText('Aumentar tamanho da fonte');
    fireEvent.click(increaseButton);
    
    const decreaseButton = screen.getByLabelText('Diminuir tamanho da fonte');
    expect(decreaseButton).not.toBeDisabled();
  });

  it('should disable increase button when at maximum font size', () => {
    render(<FontSizeControl />);
    
    const increaseButton = screen.getByLabelText('Aumentar tamanho da fonte');
    
    // Click twice to reach maximum size
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    
    expect(increaseButton).toBeDisabled();
  });
});
