import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

// Async thunk example - simulating an API call
export const fetchCounterValue = createAsyncThunk(
  'counter/fetchValue',
  async (delay: number = 1000) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, delay));
    return Math.floor(Math.random() * 100);
  }
);

export const incrementAsync = createAsyncThunk(
  'counter/incrementAsync',
  async (amount: number) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    return amount;
  }
);

interface CounterState {
  value: number;
  loading: boolean;
  error: string | null;
}

const initialState: CounterState = {
  value: 0,
  loading: false,
  error: null,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCounterValue
      .addCase(fetchCounterValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCounterValue.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(fetchCounterValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch counter value';
      })
      // incrementAsync
      .addCase(incrementAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.value += action.payload;
      })
      .addCase(incrementAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to increment';
      });
  },
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;
export default counterSlice.reducer;
