import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Backend API response interfaces - exact match to actual backend
export interface Service {
  id: number;
  shop: number;
  name: string;
  description: string;
  labor_cost: string;
  taxable: boolean;
  warranty_months: number;
}

export interface Part {
  id: number;
  shop: number;
  name: string;
  category: string;
  part_number: string;
  description: string;
  manufacturer: string;
  unit_price: string;
  taxable: boolean;
  warranty_months: number;
  stock_quantity: number;
  total_cost: string;
  created_at: string;
}

export interface Employee {
  id: number;
  shop: number;
  name: string;
  role: string;
  phone_number: string;
  email: string;
  picture: string;
  user: number;
}

export interface ShopAPIResponse {
  id: number;
  name: string;
  address: string;              // Single field, not structured
  phone: string;
  email: string;
  bay_count: number;            // NOT totalBays, NOT camelCase
  is_active: boolean;           // NOT isActive, NOT camelCase  
  created_at: string;           // NOT createdAt, NOT camelCase
  updated_at: string;           // NOT updatedAt, NOT camelCase
  services: Service[];          // Array of Service objects
  parts: Part[];               // Array of Part objects
  employees: Employee[];        // Array of Employee objects
  customers: unknown[];        // Always empty array
  appointments: unknown[];     // Always empty array
  repair_orders: unknown[];    // Always empty array
}

export interface ShopListAPIResponse {
  results: ShopAPIResponse[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ShopStatsAPIResponse {
  total_shops: number;
  active_shops: number;
  total_bays: number;
  available_bays: number;
  utilization_rate: number;
  monthly_appointments: number;
  monthly_revenue: number;     // Number, not string
  average_rating: number;
  top_services: Array<{
    service: string;
    count: number;
  }>;
}

export interface ShopCreateRequest {
  name: string;
  address: string;             // Single field for full address
  phone: string;
  email?: string;
  bay_count?: number;          // snake_case
  is_active?: boolean;         // snake_case
}

// Frontend interfaces - transformed from backend data
export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  full: string;
}

export interface BusinessHours {
  monday: { open: string; close: string; isClosed: boolean };
  tuesday: { open: string; close: string; isClosed: boolean };
  wednesday: { open: string; close: string; isClosed: boolean };
  thursday: { open: string; close: string; isClosed: boolean };
  friday: { open: string; close: string; isClosed: boolean };
  saturday: { open: string; close: string; isClosed: boolean };
  sunday: { open: string; close: string; isClosed: boolean };
}

export interface ShopCapacity {
  totalBays: number;
  availableBays: number;
  maxDailyAppointments: number;
}

export interface ShopSettings {
  allowOnlineBooking: boolean;
  requireApproval: boolean;
  sendReminders: boolean;
  reminderHours: number;
  bufferTime: number;
  advanceBookingDays: number;
}

export interface Shop {
  id: number;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  totalBays: number;
  createdAt: string;
  updatedAt: string;
  address: AddressComponents;
  services: string[];
  employees: Employee[];
  availableParts: Part[];
  businessHours: BusinessHours;
  capacity: ShopCapacity;
  settings: ShopSettings;
  // Mock missing fields with defaults
  isMainLocation: boolean;
  taxRate: number;
  timeZone: string;
  logoUrl: string | null;
  images: string[];
  socialMedia: Record<string, string>;
}

export interface ShopQuery {
  name?: string;
  search?: string;
  ordering?: string;
  page?: number;
  [key: string]: string | number | undefined;
}

export interface ShopStats {
  totalShops: number;
  activeShops: number;
  totalBays: number;
  availableBays: number;
  utilizationRate: number;
  monthlyAppointments: number;
  monthlyRevenue: number;
  averageRating: number;
  topServices: Array<{
    service: string;
    count: number;
  }>;
}

// Transformation helper functions
const parseAddress = (addressString: string): AddressComponents => {
  const parts = addressString.split(', ');
  const lastPart = parts[parts.length - 1] || '';
  const stateZip = lastPart.split(' ');
  
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    state: stateZip[0] || '',
    zipCode: stateZip[1] || '',
    country: 'USA',
    full: addressString
  };
};

const getDefaultBusinessHours = (): BusinessHours => {
  const defaultDay = { open: "08:00", close: "18:00", isClosed: false };
  return {
    monday: defaultDay,
    tuesday: defaultDay,
    wednesday: defaultDay,
    thursday: defaultDay,
    friday: defaultDay,
    saturday: { open: "09:00", close: "17:00", isClosed: false },
    sunday: { open: "00:00", close: "00:00", isClosed: true }
  };
};

const getDefaultSettings = (): ShopSettings => {
  return {
    allowOnlineBooking: true,
    requireApproval: false,
    sendReminders: true,
    reminderHours: 24,
    bufferTime: 15,
    advanceBookingDays: 30
  };
};

const transformShopData = (backendData: ShopAPIResponse): Shop => {
  return {
    // Direct mappings
    id: backendData.id,
    name: backendData.name,
    phone: backendData.phone,
    email: backendData.email,
    
    // Transform field names (snake_case → camelCase)
    isActive: backendData.is_active,
    totalBays: backendData.bay_count,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
    
    // Parse single address field into components
    address: parseAddress(backendData.address),
    
    // Transform services array (objects → names)
    services: backendData.services.map(s => s.name),
    
    // Use related data
    employees: backendData.employees,
    availableParts: backendData.parts,
    
    // Provide defaults for missing complex fields
    businessHours: getDefaultBusinessHours(),
    capacity: {
      totalBays: backendData.bay_count,
      availableBays: backendData.bay_count, // Default - no real tracking
      maxDailyAppointments: backendData.bay_count * 4
    },
    settings: getDefaultSettings(),
    
    // Mock missing fields
    isMainLocation: false,               // Not in backend
    taxRate: 0.0825,                    // Default
    timeZone: 'America/New_York',       // Default
    logoUrl: null,                      // Not implemented
    images: [],                         // Not implemented
    socialMedia: {}                     // Not implemented
  };
};

const transformToBackend = (frontendData: Partial<Shop>): ShopCreateRequest => {
  return {
    name: frontendData.name || '',
    address: frontendData.address?.full || 
             `${frontendData.address?.street || ''}, ${frontendData.address?.city || ''}, ${frontendData.address?.state || ''} ${frontendData.address?.zipCode || ''}`.trim(),
    phone: frontendData.phone || '',
    email: frontendData.email,
    bay_count: frontendData.totalBays,
    is_active: frontendData.isActive
  };
};

const transformStatsData = (backendData: ShopStatsAPIResponse): ShopStats => {
  return {
    totalShops: backendData.total_shops,
    activeShops: backendData.active_shops,
    totalBays: backendData.total_bays,
    availableBays: backendData.available_bays,
    utilizationRate: backendData.utilization_rate,
    monthlyAppointments: backendData.monthly_appointments,
    monthlyRevenue: backendData.monthly_revenue,
    averageRating: backendData.average_rating,
    topServices: backendData.top_services
  };
};

// Shop Management Service
export const shopMngtService = {
  // Get all shops with filtering and pagination
  getShops: async (query: ShopQuery = {}): Promise<Shop[]> => {
    try {
      console.log('🔄 Loading shops from backend...');
      
      const response = await apiGet<ShopListAPIResponse>('/shop/shops/', query);
      
      console.log(`✅ Loaded ${response.results.length} shops from backend`);
      return response.results.map(transformShopData);
      
    } catch (error: unknown) {
      console.error('❌ Error loading shops:', error);
      throw error;
    }
  },

  // Get single shop by ID
  getShopById: async (shopId: number): Promise<Shop> => {
    try {
      console.log(`🔄 Loading shop ${shopId} from backend...`);
      
      const response = await apiGet<ShopAPIResponse>(`/shop/shops/${shopId}/`);
      
      console.log(`✅ Loaded shop ${shopId} from backend`);
      return transformShopData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error loading shop ${shopId}:`, error);
      throw error;
    }
  },

  // Create new shop
  createShop: async (shopData: Partial<Shop>): Promise<Shop> => {
    try {
      console.log('🔄 Creating shop...');
      
      const backendData = transformToBackend(shopData);
      const response = await apiPost<ShopAPIResponse>('/shop/shops/', backendData);
      
      console.log(`✅ Created shop ${response.id}`);
      return transformShopData(response);
      
    } catch (error: unknown) {
      console.error('❌ Error creating shop:', error);
      throw error;
    }
  },

  // Update existing shop
  updateShop: async (shopId: number, shopData: Partial<Shop>): Promise<Shop> => {
    try {
      console.log(`🔄 Updating shop ${shopId}...`);
      
      const backendData = transformToBackend(shopData);
      const response = await apiPut<ShopAPIResponse>(`/shop/shops/${shopId}/`, backendData);
      
      console.log(`✅ Updated shop ${shopId}`);
      return transformShopData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error updating shop ${shopId}:`, error);
      throw error;
    }
  },

  // Delete shop
  deleteShop: async (shopId: number): Promise<void> => {
    try {
      console.log(`🔄 Deleting shop ${shopId}...`);
      
      await apiDelete(`/shop/shops/${shopId}/`);
      
      console.log(`✅ Deleted shop ${shopId}`);
      
    } catch (error: unknown) {
      console.error(`❌ Error deleting shop ${shopId}:`, error);
      throw error;
    }
  },

  // Get shop employees
  getShopEmployees: async (shopId: number): Promise<Employee[]> => {
    try {
      console.log(`🔄 Loading employees for shop ${shopId}...`);
      
      const response = await apiGet<Employee[]>(`/shop/shops/${shopId}/employees/`);
      
      console.log(`✅ Loaded ${response.length} employees for shop ${shopId}`);
      return response;
      
    } catch (error: unknown) {
      console.error(`❌ Error loading shop employees:`, error);
      throw error;
    }
  },

  // Get shop services
  getShopServices: async (shopId: number): Promise<Service[]> => {
    try {
      console.log(`🔄 Loading services for shop ${shopId}...`);
      
      const response = await apiGet<Service[]>(`/shop/shops/${shopId}/services/`);
      
      console.log(`✅ Loaded ${response.length} services for shop ${shopId}`);
      return response;
      
    } catch (error: unknown) {
      console.error(`❌ Error loading shop services:`, error);
      throw error;
    }
  },

  // Get shop statistics (the only complex endpoint that works)
  getShopStats: async (): Promise<ShopStats> => {
    try {
      console.log('🔄 Loading shop statistics...');
      
      const response = await apiGet<ShopStatsAPIResponse>('/shop/shops/stats/');
      
      console.log('✅ Loaded shop statistics');
      return transformStatsData(response);
      
    } catch (error: unknown) {
      console.error('❌ Error loading shop statistics:', error);
      throw error;
    }
  }
};
