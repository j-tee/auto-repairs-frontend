
// Shop types
export interface Shop {
  operatingHours: Record<string, { open: string; close: string; closed?: boolean }>;
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  businessHours: {
    monday: { open: string; close: string; isClosed?: boolean };
    tuesday: { open: string; close: string; isClosed?: boolean };
    wednesday: { open: string; close: string; isClosed?: boolean };
    thursday: { open: string; close: string; isClosed?: boolean };
    friday: { open: string; close: string; isClosed?: boolean };
    saturday: { open: string; close: string; isClosed?: boolean };
    sunday: { open: string; close: string; isClosed?: boolean };
  };
  services: string[];
  specialties: string[];
  certifications: string[];
  equipment: string[];
  capacity: {
    totalBays: number;
    availableBays: number;
    maxDailyAppointments: number;
  };
  isActive: boolean;
  isMainLocation: boolean;
  taxRate: number;
  currency: string;
  timeZone: string;
  logoUrl?: string;
  images?: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  settings: {
    allowOnlineBooking: boolean;
    requireApproval: boolean;
    sendReminders: boolean;
    reminderHours: number;
    autoConfirmAppointments: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  manager?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface ShopResponse {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone: string;
    email: string;
    website?: string;
    description?: string;
    business_hours: {
        monday: { open: string; close: string; is_closed?: boolean };
        tuesday: { open: string; close: string; is_closed?: boolean };
        wednesday: { open: string; close: string; is_closed?: boolean };
        thursday: { open: string; close: string; is_closed?: boolean };
        friday: { open: string; close: string; is_closed?: boolean };
        saturday: { open: string; close: string; is_closed?: boolean };
        sunday: { open: string; close: string; is_closed?: boolean };
    };
    services: string[];
    specialties: string[];
    certifications: string[];
    equipment: string[];
    capacity: {
        totalBays: number;
        availableBays: number;
        maxDailyAppointments: number;
    };
    is_active: boolean;
    is_main_location: boolean;
    tax_rate: number;
    currency: string;
    time_zone: string;
    logo_url?: string;
    images?: string[];
    social_media?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
    settings: {
        allowOnlineBooking: boolean;
        requireApproval: boolean;
        sendReminders: boolean;
        reminderHours: number;
        autoConfirmAppointments: boolean;
        emailNotifications: boolean;
        smsNotifications: boolean;
    };
    manager?: {
        name: string;
        email: string;
        phone: string;
    };
    created_at: string;
    updated_at: string;
}

export interface CreateShopData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  businessHours: Shop['businessHours'];
  services?: string[];
  specialties?: string[];
  certifications?: string[];
  equipment?: string[];
  capacity: Shop['capacity'];
  taxRate?: number;
  currency?: string;
  timeZone?: string;
  isMainLocation?: boolean;
  settings?: Shop['settings'];
  manager?: Shop['manager'];
}

export interface UpdateShopData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  businessHours?: Shop['businessHours'];
  services?: string[];
  specialties?: string[];
  certifications?: string[];
  equipment?: string[];
  capacity?: Shop['capacity'];
  isActive?: boolean;
  taxRate?: number;
  currency?: string;
  timeZone?: string;
  logoUrl?: string;
  images?: string[];
  socialMedia?: Shop['socialMedia'];
  settings?: Shop['settings'];
  manager?: Shop['manager'];
}

export interface ShopQuery {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  service?: string;
  specialty?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ShopListResponse {
    results?: ShopResponse[];
  shops: Shop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count?: number;
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
  topServices: { service: string; count: number }[];
}

export interface ShopAvailability {
  shopId: string;
  date: string;
  availableSlots: {
    time: string;
    duration: number;
    bayNumber?: number;
    technicianId?: string;
  }[];
  busySlots: {
    time: string;
    duration: number;
    reason: string;
  }[];
}

export interface DashboardData {
  todaysAppointments: number;
  todaysRevenue: number;
  activeJobs: number;
  availableBays: number;
  weeklyStats: {
    appointments: number[];
    revenue: number[];
    labels: string[];
  };
  recentActivity: unknown[];
  upcomingAppointments: unknown[];
  lowInventoryItems: unknown[];
  employeePerformance: unknown[];
}
