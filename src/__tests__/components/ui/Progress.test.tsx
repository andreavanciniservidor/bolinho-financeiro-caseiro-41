import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { Progress } from '@/components/ui/progress';

describe('Progress', () => {
  it('renders correctly with default props', () => {
    render(<Progress value={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });
  
  it('applies custom className', () => {
    render(<Progress value={50} className="custom-class" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('custom-class');
  });
  
  it('applies custom indicator className', () => {
    render(<Progress value={50} indicatorClassName="custom-indicator" />);
    
    const progressBar = screen.getByRole('progressbar');
    const indicator = progressBar.firstChild;
    expect(indicator).toHaveClass('custom-indicator');
  });
  
  it('uses custom label', () => {
    render(<Progress value={50} label="Download progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Download progress');
  });
  
  it('shows correct percentage in screen reader text', () => {
    render(<Progress value={75} />);
    
    const srText = screen.getByText('75% completo');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });
  
  it('handles zero value correctly', () => {
    render(<Progress value={0} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    
    const srText = screen.getByText('0% completo');
    expect(srText).toBeInTheDocument();
  });
  
  it('handles undefined value correctly', () => {
    render(<Progress />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    
    const srText = screen.getByText('0% completo');
    expect(srText).toBeInTheDocument();
  });
});