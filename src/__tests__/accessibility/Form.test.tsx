import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { testAccessibility } from '../utils/accessibility-utils';

// Test component that uses the Form components
const TestForm = () => {
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                Your username must be at least 4 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

// Mock the Input component since we don't have access to it
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

describe('Form Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await testAccessibility(<TestForm />);
  });

  it('should associate labels with form controls', () => {
    render(<TestForm />);
    
    const usernameLabel = screen.getByText('Username');
    const usernameInput = screen.getByPlaceholderText('Enter username');
    
    expect(usernameLabel).toHaveAttribute('for');
    expect(usernameInput).toHaveAttribute('id');
    expect(usernameLabel.getAttribute('for')).toBe(usernameInput.getAttribute('id'));
  });

  it('should provide descriptions for form fields', () => {
    render(<TestForm />);
    
    const usernameInput = screen.getByPlaceholderText('Enter username');
    const description = screen.getByText('Your username must be at least 4 characters.');
    
    expect(description).toHaveAttribute('id');
    expect(usernameInput).toHaveAttribute('aria-describedby');
    expect(usernameInput.getAttribute('aria-describedby')).toContain(description.getAttribute('id'));
  });

  it('should mark invalid fields appropriately', () => {
    const { rerender } = render(<TestForm />);
    
    // Initially the field should not be marked as invalid
    const usernameInput = screen.getByPlaceholderText('Enter username');
    expect(usernameInput).not.toHaveAttribute('aria-invalid', 'true');
    
    // Mock a form with errors
    const TestFormWithErrors = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
        mode: 'onChange',
      });
      
      form.setError('username', { 
        type: 'required', 
        message: 'Username is required' 
      });

      return (
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      );
    };
    
    // Rerender with the form that has errors
    rerender(<TestFormWithErrors />);
    
    // Now the error message should be displayed and the field marked as invalid
    const errorMessage = screen.getByText('Username is required');
    expect(errorMessage).toBeInTheDocument();
    
    // Get the input again after rerender
    const invalidInput = screen.getByPlaceholderText('Enter username');
    expect(invalidInput).toHaveAttribute('aria-invalid', 'true');
    expect(invalidInput).toHaveAttribute('aria-describedby');
    expect(invalidInput.getAttribute('aria-describedby')).toContain(errorMessage.getAttribute('id'));
  });
});