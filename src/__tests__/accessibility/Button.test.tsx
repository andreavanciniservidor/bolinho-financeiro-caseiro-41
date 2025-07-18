
import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { Button } from '@/components/ui/button';
import { testAccessibility, checkColorContrast } from '../utils/accessibility-utils';

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await testAccessibility(<Button>Click me</Button>);
  });

  it('should have sufficient color contrast', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    const contrastInfo = checkColorContrast(button);
    
    expect(contrastInfo.passesAA).toBe(true);
  });

  it('should be keyboard navigable', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    
    // Verify the button can receive keyboard focus
    expect(button.tabIndex).not.toBe(-1);
  });

  it('should have proper ARIA attributes when disabled', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should maintain accessibility with different variants', async () => {
    await testAccessibility(
      <>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </>
    );
  });

  it('should maintain accessibility with different sizes', async () => {
    await testAccessibility(
      <>
        <Button size="default">Default</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">Icon</Button>
      </>
    );
  });
});
