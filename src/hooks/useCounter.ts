import { useAppSelector, useAppDispatch } from '../store';
import { 
  increment, 
  decrement, 
  incrementByAmount, 
  reset,
  fetchCounterValue,
  incrementAsync 
} from '../store/slices/counterSlice';
import { useCallback } from 'react';

export const useCounter = () => {
  const dispatch = useAppDispatch();
  const { value, loading, error } = useAppSelector(state => state.counter);

  const handleIncrement = useCallback(() => {
    dispatch(increment());
  }, [dispatch]);

  const handleDecrement = useCallback(() => {
    dispatch(decrement());
  }, [dispatch]);

  const handleIncrementByAmount = useCallback((amount: number) => {
    dispatch(incrementByAmount(amount));
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(reset());
  }, [dispatch]);

  const handleFetchValue = useCallback((delay: number = 1000) => {
    return dispatch(fetchCounterValue(delay));
  }, [dispatch]);

  const handleIncrementAsync = useCallback((amount: number) => {
    return dispatch(incrementAsync(amount));
  }, [dispatch]);

  return {
    // State
    value,
    loading,
    error,
    
    // Actions
    increment: handleIncrement,
    decrement: handleDecrement,
    incrementByAmount: handleIncrementByAmount,
    reset: handleReset,
    fetchValue: handleFetchValue,
    incrementAsync: handleIncrementAsync,
  };
};
