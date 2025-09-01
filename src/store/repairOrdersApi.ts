import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  RepairOrder, 
  CreateRepairOrderData, 
  UpdateRepairOrderData, 
  RepairOrderFilters,
  Service,
  Part
} from '../types/repairOrders';

export const repairOrdersApi = createApi({
  reducerPath: 'repairOrdersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['RepairOrder', 'Service', 'Part'],
  endpoints: (builder) => ({
    // ========== REPAIR ORDERS ==========
    
    // Get all repair orders with filtering
    getRepairOrders: builder.query<
      { results: RepairOrder[]; count: number; next?: string; previous?: string },
      RepairOrderFilters & { page?: number; page_size?: number }
    >({
      query: (params) => ({
        url: 'repair-orders/',
        params: {
          ...params,
          status: params.status?.join(','),
        },
      }),
      providesTags: ['RepairOrder'],
    }),

    // Get single repair order
    getRepairOrder: builder.query<RepairOrder, string>({
      query: (id) => `repair-orders/${id}/`,
      providesTags: (_, __, id) => [{ type: 'RepairOrder', id }],
    }),

    // Create repair order
    createRepairOrder: builder.mutation<RepairOrder, CreateRepairOrderData>({
      query: (data) => ({
        url: 'repair-orders/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RepairOrder'],
    }),

    // Update repair order
    updateRepairOrder: builder.mutation<
      RepairOrder,
      { id: string; data: UpdateRepairOrderData }
    >({
      query: ({ id, data }) => ({
        url: `repair-orders/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'RepairOrder', id }],
    }),

    // Delete repair order
    deleteRepairOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `repair-orders/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RepairOrder'],
    }),

    // Update repair order status
    updateRepairOrderStatus: builder.mutation<
      RepairOrder,
      { id: string; status: RepairOrder['status'] }
    >({
      query: ({ id, status }) => ({
        url: `repair-orders/${id}/status/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'RepairOrder', id }],
    }),

    // Get repair orders for specific vehicle
    getVehicleRepairOrders: builder.query<RepairOrder[], string>({
      query: (vehicleId) => `repair-orders/?vehicle=${vehicleId}`,
      providesTags: ['RepairOrder'],
    }),

    // Get repair orders for specific customer
    getCustomerRepairOrders: builder.query<RepairOrder[], string>({
      query: (customerId) => `repair-orders/?customer=${customerId}`,
      providesTags: ['RepairOrder'],
    }),

    // Get active repair orders
    getActiveRepairOrders: builder.query<RepairOrder[], void>({
      query: () => 'repair-orders/?status=pending,pending_parts,on_hold',
      providesTags: ['RepairOrder'],
    }),

    // ========== SERVICES ==========
    
    // Get all services
    getServices: builder.query<Service[], void>({
      query: () => 'services/',
      providesTags: ['Service'],
    }),

    // Get single service
    getService: builder.query<Service, string>({
      query: (id) => `services/${id}/`,
      providesTags: (_, __, id) => [{ type: 'Service', id }],
    }),

    // Create service
    createService: builder.mutation<Service, Omit<Service, 'id' | 'created_at' | 'updated_at'>>({
      query: (data) => ({
        url: 'services/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),

    // Update service
    updateService: builder.mutation<
      Service,
      { id: string; data: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>> }
    >({
      query: ({ id, data }) => ({
        url: `services/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Service', id }],
    }),

    // Delete service
    deleteService: builder.mutation<void, string>({
      query: (id) => ({
        url: `services/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),

    // ========== PARTS ==========
    
    // Get all parts
    getParts: builder.query<Part[], { search?: string; category?: string; in_stock?: boolean }>({
      query: (params) => ({
        url: 'parts/',
        params,
      }),
      providesTags: ['Part'],
    }),

    // Get single part
    getPart: builder.query<Part, string>({
      query: (id) => `parts/${id}/`,
      providesTags: (_, __, id) => [{ type: 'Part', id }],
    }),

    // Create part
    createPart: builder.mutation<Part, Omit<Part, 'id' | 'created_at' | 'updated_at'>>({
      query: (data) => ({
        url: 'parts/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Part'],
    }),

    // Update part
    updatePart: builder.mutation<
      Part,
      { id: string; data: Partial<Omit<Part, 'id' | 'created_at' | 'updated_at'>> }
    >({
      query: ({ id, data }) => ({
        url: `parts/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Part', id }],
    }),

    // Delete part
    deletePart: builder.mutation<void, string>({
      query: (id) => ({
        url: `parts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Part'],
    }),

    // Update part stock
    updatePartStock: builder.mutation<
      Part,
      { id: string; quantity: number; operation: 'add' | 'set' | 'subtract' }
    >({
      query: ({ id, quantity, operation }) => ({
        url: `parts/${id}/stock/`,
        method: 'PATCH',
        body: { quantity, operation },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Part', id }],
    }),

    // Get low stock parts
    getLowStockParts: builder.query<Part[], { threshold?: number }>({
      query: (params = { threshold: 10 }) => ({
        url: 'parts/low-stock/',
        params,
      }),
      providesTags: ['Part'],
    }),
  }),
});

export const {
  // Repair Orders
  useGetRepairOrdersQuery,
  useGetRepairOrderQuery,
  useCreateRepairOrderMutation,
  useUpdateRepairOrderMutation,
  useDeleteRepairOrderMutation,
  useUpdateRepairOrderStatusMutation,
  useGetVehicleRepairOrdersQuery,
  useGetCustomerRepairOrdersQuery,
  useGetActiveRepairOrdersQuery,
  
  // Services
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  
  // Parts
  useGetPartsQuery,
  useGetPartQuery,
  useCreatePartMutation,
  useUpdatePartMutation,
  useDeletePartMutation,
  useUpdatePartStockMutation,
  useGetLowStockPartsQuery,
} = repairOrdersApi;
