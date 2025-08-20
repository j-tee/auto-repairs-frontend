import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  Appointment, 
  CreateAppointmentData, 
  UpdateAppointmentData, 
  AppointmentFilters 
} from '../types/appointments';

export const appointmentsApi = createApi({
  reducerPath: 'appointmentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/appointments/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Appointment'],
  endpoints: (builder) => ({
    // Get all appointments with filtering
    getAppointments: builder.query<
      { results: Appointment[]; count: number; next?: string; previous?: string },
      AppointmentFilters & { page?: number; page_size?: number }
    >({
      query: (params) => ({
        url: '',
        params: {
          ...params,
          // Convert array filters to comma-separated strings
          status: params.status?.join(','),
        },
      }),
      providesTags: ['Appointment'],
    }),

    // Get single appointment
    getAppointment: builder.query<Appointment, string>({
      query: (id) => `${id}/`,
      providesTags: (_, __, id) => [{ type: 'Appointment', id }],
    }),

    // Create appointment
    createAppointment: builder.mutation<Appointment, CreateAppointmentData>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Update appointment
    updateAppointment: builder.mutation<
      Appointment,
      { id: string; data: UpdateAppointmentData }
    >({
      query: ({ id, data }) => ({
        url: `${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Appointment', id }],
    }),

    // Delete appointment
    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Update appointment status
    updateAppointmentStatus: builder.mutation<
      Appointment,
      { id: string; status: Appointment['status'] }
    >({
      query: ({ id, status }) => ({
        url: `${id}/status/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Appointment', id }],
    }),

    // Get appointments for specific vehicle
    getVehicleAppointments: builder.query<Appointment[], string>({
      query: (vehicleId) => `?vehicle=${vehicleId}`,
      providesTags: ['Appointment'],
    }),

    // Get appointments for specific customer
    getCustomerAppointments: builder.query<Appointment[], string>({
      query: (customerId) => `?customer=${customerId}`,
      providesTags: ['Appointment'],
    }),

    // Get today's appointments
    getTodaysAppointments: builder.query<Appointment[], void>({
      query: () => {
        const today = new Date().toISOString().split('T')[0];
        return `?date_from=${today}&date_to=${today}`;
      },
      providesTags: ['Appointment'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useGetVehicleAppointmentsQuery,
  useGetCustomerAppointmentsQuery,
  useGetTodaysAppointmentsQuery,
} = appointmentsApi;
