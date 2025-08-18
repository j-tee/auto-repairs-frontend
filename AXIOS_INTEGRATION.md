# Axios + Query String Integration Guide

## Overview

This project now uses **Axios** for HTTP requests and **qs** for advanced query string formatting, providing a more robust and feature-rich API integration compared to the native fetch API.

## 🚀 Key Features Added

### 1. **Axios HTTP Client**
- Professional-grade HTTP client with interceptors
- Automatic request/response transformation
- Built-in timeout and retry capabilities
- Comprehensive error handling
- Request/response logging in development

### 2. **Advanced Query String Formatting**
- Support for arrays: `?tags[]=tag1&tags[]=tag2`
- Nested objects: `?user.name=John&user.age=30`
- Complex filtering with multiple parameters
- Automatic encoding and URL building

### 3. **Enhanced API Services**
- Domain-specific service functions
- Pagination, filtering, and sorting support
- Type-safe API operations
- Centralized error handling

## 📁 Project Structure

```
src/
├── utils/
│   └── api.ts                    # Axios client and utilities
├── services/
│   └── autoRepairsService.ts     # Domain-specific API services
├── hooks/
│   ├── useAutoRepairs.ts         # Basic Redux hooks
│   └── useEnhancedAutoRepairs.ts # Advanced hooks with filtering
└── components/
    └── AxiosQueryDemo.tsx        # Interactive demo component
```

## 🔧 Axios Configuration

### Client Setup
```typescript
// Axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Use qs for query string serialization
  paramsSerializer: (params) => {
    return qs.stringify(params, QS_CONFIG);
  },
});
```

### Request Interceptors
- **Authentication**: Automatically adds Bearer tokens
- **Logging**: Logs requests in development
- **Metadata**: Tracks request timing

### Response Interceptors
- **Error Handling**: Converts errors to custom ApiError class
- **Logging**: Logs responses with timing
- **Data Extraction**: Simplifies response handling

## 🔍 Query String Formatting

### Configuration
```typescript
export const QS_CONFIG = {
  arrayFormat: 'brackets' as const, // ?tags[]=tag1&tags[]=tag2
  encode: true,
  addQueryPrefix: true,
  allowDots: true, // Support nested objects
};
```

### Examples

#### Array Parameters
```typescript
// Input: { status: ['pending', 'in-progress'] }
// Output: ?status[]=pending&status[]=in-progress
```

#### Nested Objects
```typescript
// Input: { filter: { price: { min: 100, max: 500 } } }
// Output: ?filter.price.min=100&filter.price.max=500
```

#### Complex Filtering
```typescript
// Input: { 
//   page: 1, 
//   limit: 20, 
//   search: 'toyota',
//   status: ['pending', 'completed'],
//   dateRange: { from: '2024-01-01', to: '2024-12-31' }
// }
// Output: ?page=1&limit=20&search=toyota&status[]=pending&status[]=completed&dateRange.from=2024-01-01&dateRange.to=2024-12-31
```

## 🛠 API Service Functions

### Generic Functions
```typescript
// Basic CRUD operations
apiGet<T>(endpoint, params?, config?)
apiPost<T>(endpoint, data?, config?)
apiPatch<T>(endpoint, data?, config?)
apiPut<T>(endpoint, data?, config?)
apiDelete<T>(endpoint, config?)

// Enhanced operations
apiGetWithPagination<T>(endpoint, pagination, filters, sort)
apiGetById<T>(endpoint, id, params?)
apiUpdateById<T>(endpoint, id, data)
apiDeleteById<T>(endpoint, id)
```

### Domain-Specific Services
```typescript
// Vehicle operations
vehicles.getAll(pagination, filters, sort)
vehicles.getByCustomerId(customerId)
vehicles.search(query)
vehicles.create(vehicleData)
vehicles.update(id, vehicleData)

// Repair job operations
repairJobs.getAll(pagination, filters, sort)
repairJobs.getByStatus(status)
repairJobs.getByDateRange(dateFrom, dateTo)
repairJobs.getStatistics(filters)
repairJobs.updateStatus(id, status)

// Customer operations
customers.getAll(pagination, filters, sort)
customers.search(query)
customers.getRepairHistory(customerId)
customers.getVehicles(customerId)
```

## 🎯 Usage Examples

### Basic Filtering
```typescript
const useVehicleManagement = () => {
  const { loadVehiclesWithFilters } = useEnhancedAutoRepairs();
  
  const filterVehicles = async () => {
    const result = await loadVehiclesWithFilters(
      { make: 'Toyota', year: 2020 },          // Filters
      { page: 1, limit: 20 },                  // Pagination
      { sortBy: 'year', sortOrder: 'desc' }    // Sorting
    );
    
    // Query string: ?make=Toyota&year=2020&page=1&limit=20&sortBy=year&sortOrder=desc
    console.log(result);
  };
};
```

### Advanced Filtering
```typescript
const filterRepairJobs = async () => {
  const filters = {
    status: ['pending', 'in-progress'],
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    estimatedCostMin: 100,
    estimatedCostMax: 1000,
    search: 'brake'
  };
  
  const result = await repairJobs.getAll(
    { page: 1, limit: 50 },
    filters,
    { sortBy: 'createdAt', sortOrder: 'desc' }
  );
  
  // Query string: ?status[]=pending&status[]=in-progress&dateFrom=2024-01-01&dateTo=2024-12-31&estimatedCostMin=100&estimatedCostMax=1000&search=brake&page=1&limit=50&sortBy=createdAt&sortOrder=desc
};
```

### Search Operations
```typescript
const searchEverything = async (query: string) => {
  const { searchAll } = useEnhancedAutoRepairs();
  
  // Searches across vehicles, customers, and jobs
  await searchAll(query);
  
  // Individual searches
  const vehicleResults = await vehicles.search(query);
  const customerResults = await customers.search(query);
};
```

### File Upload
```typescript
const uploadDocument = async (file: File) => {
  const result = await apiUploadFile(
    '/documents/upload',
    file,
    'document',
    { category: 'invoice', jobId: 'job-123' },
    (progress) => console.log(`Upload: ${progress}%`)
  );
};
```

## 🔐 Authentication

### Token Management
```typescript
// Set authentication token
setAuthToken('your-jwt-token');

// Remove token
removeAuthToken();

// Get current token
const token = getAuthToken();
```

### Automatic Token Injection
- Tokens are automatically added to requests via interceptors
- Stored in localStorage for persistence
- Automatically removed on logout

## 🚫 Error Handling

### Custom Error Class
```typescript
export class ApiError extends Error {
  public status?: number;
  public response?: AxiosResponse;
  public code?: string;
  public isNetworkError: boolean;
  public isTimeoutError: boolean;
}
```

### Error Types
- **Network Errors**: No internet connection
- **Timeout Errors**: Request took too long
- **HTTP Errors**: 4xx/5xx status codes
- **Validation Errors**: Malformed requests

### Usage
```typescript
try {
  const result = await vehicles.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      console.log('Check your internet connection');
    } else if (error.status === 401) {
      console.log('Authentication required');
    } else if (error.status >= 500) {
      console.log('Server error, please try again');
    }
  }
}
```

## ⚡ Performance Features

### Retry with Exponential Backoff
```typescript
const result = await withRetry(
  () => vehicles.getAll(),
  3,    // attempts
  1000  // initial delay
);
```

### Request Cancellation
```typescript
const controller = new AbortController();

const result = await apiGet('/vehicles', {}, {
  signal: controller.signal
});

// Cancel request
controller.abort();
```

### Caching (Future Enhancement)
- Response caching with TTL
- Optimistic updates
- Background refresh

## 🧪 Interactive Demo

The `AxiosQueryDemo` component demonstrates:

1. **Global Search**: Search across all entities
2. **Advanced Filtering**: Multiple filter criteria
3. **Quick Filters**: Predefined filter shortcuts
4. **Reporting**: Generate reports with complex queries
5. **Real-time Feedback**: Loading states and error handling

### Demo Features
- 🔍 **Search**: Global search across vehicles, customers, jobs
- 🚗 **Vehicle Filters**: Make, model, year, VIN/license search
- 🔧 **Job Filters**: Status, date range, price range, description search
- 👤 **Customer Filters**: Name/email/phone search, location filters
- ⚡ **Quick Filters**: Common filter combinations
- 📊 **Reports**: Revenue and statistics generation

## 🌐 Environment Configuration

### Environment Variables
```env
# .env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEV_MODE=true

# .env.production
VITE_API_BASE_URL=https://api.autorepairs.com/api
VITE_DEV_MODE=false
```

### Configuration Object
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};
```

## 🔮 Future Enhancements

### 1. **RTK Query Integration**
- Replace manual async thunks with RTK Query
- Automatic caching and synchronization
- Optimistic updates

### 2. **Real-time Updates**
- WebSocket integration
- Live data synchronization
- Real-time notifications

### 3. **Advanced Caching**
- Response caching strategies
- Cache invalidation
- Offline support

### 4. **Request Batching**
- Batch multiple requests
- Reduce network overhead
- Improve performance

## 📋 Migration Notes

### From Fetch to Axios
1. ✅ **Automatic**: Existing async thunks work unchanged
2. ✅ **Enhanced**: Better error handling and retry logic
3. ✅ **Compatible**: Same API surface with added features

### Benefits
- **Reliability**: Better error handling and retry mechanisms
- **Developer Experience**: Request/response logging and debugging
- **Flexibility**: Advanced query string formatting
- **Performance**: Request/response interceptors and optimization
- **Maintenance**: Centralized configuration and error handling

The integration provides a solid foundation for building complex data-driven applications with robust API communication!
