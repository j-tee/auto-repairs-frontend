# Redux Setup Documentation

This project has been structured and optimized to use Redux Toolkit with async thunks for state management.

## Project Structure

```
src/
├── components/           # React components
│   ├── CounterComponent.tsx
│   ├── AutoRepairsDashboard.tsx
│   └── index.ts         # Barrel exports
├── hooks/               # Custom React hooks
│   ├── useCounter.ts    # Counter-related hooks
│   ├── useAutoRepairs.ts # Auto repairs hooks
│   └── index.ts         # Barrel exports
├── store/               # Redux store configuration
│   ├── index.ts         # Store setup and typed hooks
│   └── slices/          # Redux slices
│       ├── counterSlice.ts
│       └── autoRepairsSlice.ts
├── utils/               # Utility functions
│   └── api.ts          # API utilities
├── App.tsx
└── main.tsx            # Redux Provider setup
```

## Key Features

### 1. Redux Toolkit Setup
- Configured with `configureStore`
- TypeScript-first approach
- Custom typed hooks (`useAppDispatch`, `useAppSelector`)

### 2. Async Thunks
- Handles API calls with proper loading and error states
- Built-in error handling with `rejectWithValue`
- Type-safe async operations

### 3. Custom Hooks
- `useCounter`: Encapsulates counter state and actions
- `useAutoRepairs`: Handles auto repairs business logic
- Clean separation of concerns

### 4. API Utilities
- Centralized API configuration
- Generic API functions (`apiGet`, `apiPost`, `apiPatch`, etc.)
- Proper error handling with custom `ApiError` class
- Timeout support

### 5. Environment Configuration
- Environment variables for different deployments
- API base URL configuration
- Development/production settings

## Usage Examples

### Using the Counter
```tsx
import { useCounter } from './hooks';

function MyComponent() {
  const counter = useCounter();
  
  return (
    <div>
      <p>Value: {counter.value}</p>
      <button onClick={counter.increment}>+</button>
      <button onClick={() => counter.incrementAsync(5)}>+5 Async</button>
      {counter.loading && <p>Loading...</p>}
      {counter.error && <p>Error: {counter.error}</p>}
    </div>
  );
}
```

### Using Auto Repairs
```tsx
import { useAutoRepairs } from './hooks';

function RepairsComponent() {
  const repairs = useAutoRepairs();
  
  useEffect(() => {
    repairs.loadAllData();
  }, []);
  
  return (
    <div>
      <p>Vehicles: {repairs.vehicles.length}</p>
      <p>Jobs: {repairs.repairJobs.length}</p>
      <button onClick={() => repairs.createJob(jobData)}>
        Create Job
      </button>
    </div>
  );
}
```

## Async Thunk Patterns

### Basic Async Thunk
```ts
export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      return await apiGet<DataType>('/endpoint');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Async Thunk with Parameters
```ts
export const updateItem = createAsyncThunk(
  'slice/updateItem',
  async ({ id, data }: { id: string; data: UpdateData }, { rejectWithValue }) => {
    try {
      return await apiPatch<ItemType>(`/items/${id}`, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Slice Structure

### State Interface
```ts
interface SliceState {
  data: DataType[];
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
  };
  error: {
    fetch: string | null;
    create: string | null;
    update: string | null;
  };
}
```

### Extra Reducers Pattern
```ts
extraReducers: (builder) => {
  builder
    .addCase(asyncThunk.pending, (state) => {
      state.loading.operation = true;
      state.error.operation = null;
    })
    .addCase(asyncThunk.fulfilled, (state, action) => {
      state.loading.operation = false;
      // Update state with action.payload
    })
    .addCase(asyncThunk.rejected, (state, action) => {
      state.loading.operation = false;
      state.error.operation = action.payload as string;
    });
}
```

## API Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEV_MODE=true
```

### API Utilities
- `apiGet<T>(endpoint)`: GET requests
- `apiPost<T>(endpoint, data)`: POST requests
- `apiPatch<T>(endpoint, data)`: PATCH requests
- `apiPut<T>(endpoint, data)`: PUT requests
- `apiDelete<T>(endpoint)`: DELETE requests

## Best Practices

1. **Type Safety**: Always use TypeScript interfaces for state and API responses
2. **Error Handling**: Use `rejectWithValue` for consistent error handling
3. **Loading States**: Track loading states for different operations separately
4. **Custom Hooks**: Encapsulate Redux logic in custom hooks
5. **Barrel Exports**: Use index files for cleaner imports
6. **API Utilities**: Centralize API logic for reusability
7. **Environment Config**: Use environment variables for configuration

## Testing Considerations

- Mock async thunks in tests
- Test custom hooks with `@testing-library/react-hooks`
- Use Redux testing utilities
- Mock API calls in component tests

## Performance Optimizations

- Use `useCallback` in custom hooks to prevent unnecessary re-renders
- Memoize selectors with `createSelector` when needed
- Consider using `RTK Query` for complex data fetching scenarios
- Implement optimistic updates where appropriate
