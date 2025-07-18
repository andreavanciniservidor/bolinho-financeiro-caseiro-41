import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMemoizedValue, useMemoizedCallback } from '@/hooks/useMemoizedValue';

describe('useMemoizedValue', () => {
  it('should return the same value for the same dependencies', () => {
    const factory = vi.fn(() => 'test');
    const deps = [1, 2, 3];
    
    const { result, rerender } = renderHook(() => useMemoizedValue(factory, deps));
    
    expect(result.current).toBe('test');
    expect(factory).toHaveBeenCalledTimes(1);
    
    // Rerender with the same deps
    rerender();
    
    expect(result.current).toBe('test');
    expect(factory).toHaveBeenCalledTimes(1); // Factory should not be called again
  });
  
  it('should recalculate value when dependencies change', () => {
    const factory = vi.fn(() => Math.random());
    let deps = [1, 2, 3];
    
    const { result, rerender } = renderHook(() => useMemoizedValue(factory, deps));
    
    const firstValue = result.current;
    expect(factory).toHaveBeenCalledTimes(1);
    
    // Change deps
    deps = [1, 2, 4];
    rerender();
    
    const secondValue = result.current;
    expect(factory).toHaveBeenCalledTimes(2);
    expect(secondValue).not.toBe(firstValue);
  });
  
  it('should use custom equality function if provided', () => {
    const factory = vi.fn(() => 'test');
    const equalityFn = vi.fn(() => true); // Always return true
    const deps = [{ id: 1 }];
    
    const { result, rerender } = renderHook(() => 
      useMemoizedValue(factory, deps, equalityFn)
    );
    
    expect(result.current).toBe('test');
    expect(factory).toHaveBeenCalledTimes(1);
    
    // Change deps object reference but keep same structure
    const newDeps = [{ id: 1 }];
    renderHook(() => useMemoizedValue(factory, newDeps, equalityFn));
    
    expect(equalityFn).toHaveBeenCalled();
    expect(factory).toHaveBeenCalledTimes(1); // Factory should not be called again
  });
});

describe('useMemoizedCallback', () => {
  it('should return the same callback for the same dependencies', () => {
    const callback = vi.fn();
    const deps = [1, 2, 3];
    
    const { result, rerender } = renderHook(() => useMemoizedCallback(callback, deps));
    
    const firstCallback = result.current;
    
    // Rerender with the same deps
    rerender();
    
    const secondCallback = result.current;
    expect(secondCallback).toBe(firstCallback);
  });
  
  it('should return a new callback when dependencies change', () => {
    const callback = vi.fn();
    let deps = [1, 2, 3];
    
    const { result, rerender } = renderHook(() => useMemoizedCallback(callback, deps));
    
    const firstCallback = result.current;
    
    // Change deps
    deps = [1, 2, 4];
    rerender();
    
    const secondCallback = result.current;
    expect(secondCallback).not.toBe(firstCallback);
  });
});