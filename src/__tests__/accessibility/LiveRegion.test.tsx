
import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { LiveRegion, Alert, Status } from '@/components/accessibility/LiveRegion';
import { testAccessibility } from '../utils/accessibility-utils';

describe('LiveRegion Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await testAccessibility(<LiveRegion>Notification message</LiveRegion>);
  });

  it('should render with correct ARIA attributes for polite announcements', () => {
    render(<LiveRegion>Status update</LiveRegion>);
    
    const region = screen.getByText('Status update');
    expect(region.parentElement).toHaveAttribute('aria-live', 'polite');
    expect(region.parentElement).toHaveAttribute('role', 'status');
    expect(region.parentElement).toHaveAttribute('aria-atomic', 'false');
    expect(region.parentElement).toHaveClass('sr-only');
  });

  it('should render with correct ARIA attributes for assertive announcements', () => {
    render(<LiveRegion politeness="assertive" role="alert">Important alert</LiveRegion>);
    
    const region = screen.getByText('Important alert');
    expect(region.parentElement).toHaveAttribute('aria-live', 'assertive');
    expect(region.parentElement).toHaveAttribute('role', 'alert');
  });

  it('should set atomic attribute correctly', () => {
    render(<LiveRegion atomic={true}>Full update</LiveRegion>);
    
    const region = screen.getByText('Full update');
    expect(region.parentElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('should set relevant attribute correctly', () => {
    render(<LiveRegion relevant="additions">New items</LiveRegion>);
    
    const region = screen.getByText('New items');
    expect(region.parentElement).toHaveAttribute('aria-relevant', 'additions');
  });

  it('Alert component should have assertive politeness and alert role', () => {
    render(<Alert>Critical error</Alert>);
    
    const alert = screen.getByText('Critical error');
    expect(alert.parentElement).toHaveAttribute('aria-live', 'assertive');
    expect(alert.parentElement).toHaveAttribute('role', 'alert');
    expect(alert.parentElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('Status component should have polite politeness and status role', () => {
    render(<Status>Operation completed</Status>);
    
    const status = screen.getByText('Operation completed');
    expect(status.parentElement).toHaveAttribute('aria-live', 'polite');
    expect(status.parentElement).toHaveAttribute('role', 'status');
    expect(status.parentElement).toHaveAttribute('aria-atomic', 'true');
  });
});
