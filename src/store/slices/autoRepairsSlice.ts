import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { vehicles, repairJobs, customers } from '../../services/autoRepairsService';

// Types for auto repairs
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  customerId: string;
}

export interface RepairJob {
  id: string;
  vehicleId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  completedAt?: string;
  mechanicId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// API Base URL - in a real app this would come from environment variables
// const API_BASE_URL = 'http://localhost:3000/api';

// Async thunks for API calls
export const fetchVehicles = createAsyncThunk(
  'autoRepairs/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicles.getAll();
      return response.data; // Extract data from paginated response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchRepairJobs = createAsyncThunk(
  'autoRepairs/fetchRepairJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await repairJobs.getAll();
      return response.data; // Extract data from paginated response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  'autoRepairs/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customers.getAll();
      return response.data; // Extract data from paginated response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createRepairJob = createAsyncThunk(
  'autoRepairs/createRepairJob',
  async (jobData: Omit<RepairJob, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      return await repairJobs.create(jobData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateRepairJobStatus = createAsyncThunk(
  'autoRepairs/updateRepairJobStatus',
  async ({ id, status }: { id: string; status: RepairJob['status'] }, { rejectWithValue }) => {
    try {
      return await repairJobs.updateStatus(id, status);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

interface AutoRepairsState {
  vehicles: Vehicle[];
  repairJobs: RepairJob[];
  customers: Customer[];
  loading: {
    vehicles: boolean;
    repairJobs: boolean;
    customers: boolean;
    createJob: boolean;
    updateJob: boolean;
  };
  error: {
    vehicles: string | null;
    repairJobs: string | null;
    customers: string | null;
    createJob: string | null;
    updateJob: string | null;
  };
}

const initialState: AutoRepairsState = {
  vehicles: [],
  repairJobs: [],
  customers: [],
  loading: {
    vehicles: false,
    repairJobs: false,
    customers: false,
    createJob: false,
    updateJob: false,
  },
  error: {
    vehicles: null,
    repairJobs: null,
    customers: null,
    createJob: null,
    updateJob: null,
  },
};

const autoRepairsSlice = createSlice({
  name: 'autoRepairs',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        vehicles: null,
        repairJobs: null,
        customers: null,
        createJob: null,
        updateJob: null,
      };
    },
    clearError: (state, action: PayloadAction<keyof AutoRepairsState['error']>) => {
      state.error[action.payload] = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchVehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading.vehicles = true;
        state.error.vehicles = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading.vehicles = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading.vehicles = false;
        state.error.vehicles = action.payload as string;
      })
      // fetchRepairJobs
      .addCase(fetchRepairJobs.pending, (state) => {
        state.loading.repairJobs = true;
        state.error.repairJobs = null;
      })
      .addCase(fetchRepairJobs.fulfilled, (state, action) => {
        state.loading.repairJobs = false;
        state.repairJobs = action.payload;
      })
      .addCase(fetchRepairJobs.rejected, (state, action) => {
        state.loading.repairJobs = false;
        state.error.repairJobs = action.payload as string;
      })
      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading.customers = true;
        state.error.customers = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading.customers = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading.customers = false;
        state.error.customers = action.payload as string;
      })
      // createRepairJob
      .addCase(createRepairJob.pending, (state) => {
        state.loading.createJob = true;
        state.error.createJob = null;
      })
      .addCase(createRepairJob.fulfilled, (state, action) => {
        state.loading.createJob = false;
        state.repairJobs.push(action.payload);
      })
      .addCase(createRepairJob.rejected, (state, action) => {
        state.loading.createJob = false;
        state.error.createJob = action.payload as string;
      })
      // updateRepairJobStatus
      .addCase(updateRepairJobStatus.pending, (state) => {
        state.loading.updateJob = true;
        state.error.updateJob = null;
      })
      .addCase(updateRepairJobStatus.fulfilled, (state, action) => {
        state.loading.updateJob = false;
        const index = state.repairJobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.repairJobs[index] = action.payload;
        }
      })
      .addCase(updateRepairJobStatus.rejected, (state, action) => {
        state.loading.updateJob = false;
        state.error.updateJob = action.payload as string;
      });
  },
});

export const { clearErrors, clearError } = autoRepairsSlice.actions;
export default autoRepairsSlice.reducer;
