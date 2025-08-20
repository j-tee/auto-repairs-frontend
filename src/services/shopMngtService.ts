import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Shop types
export interface Shop {
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
  shops: Shop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  recentActivity: any[];
  upcomingAppointments: any[];
  lowInventoryItems: any[];
  employeePerformance: any[];
}

// Shop Management Service
export const shopMngtService = {
  // Get all shops with filtering and pagination
  getShops: async (query: ShopQuery = {}): Promise<ShopListResponse> => {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.city) params.append('city', query.city);
    if (query.state) params.append('state', query.state);
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.service) params.append('service', query.service);
    if (query.specialty) params.append('specialty', query.specialty);
    if (query.sortBy) params.append('sort_by', query.sortBy);
    if (query.sortOrder) params.append('sort_order', query.sortOrder);
    
    const queryString = params.toString();
    const endpoint = `/shops/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<any>(endpoint);
    
    return {
      shops: response.results?.map((shop: any) => ({
        id: shop.id?.toString() || '',
        name: shop.name || '',
        address: shop.address || '',
        city: shop.city || '',
        state: shop.state || '',
        zipCode: shop.zip_code || '',
        country: shop.country || '',
        phone: shop.phone || '',
        email: shop.email || '',
        website: shop.website,
        description: shop.description,
        businessHours: shop.business_hours || {
          monday: { open: '08:00', close: '17:00' },
          tuesday: { open: '08:00', close: '17:00' },
          wednesday: { open: '08:00', close: '17:00' },
          thursday: { open: '08:00', close: '17:00' },
          friday: { open: '08:00', close: '17:00' },
          saturday: { open: '08:00', close: '12:00' },
          sunday: { open: '00:00', close: '00:00', isClosed: true }
        },
        services: shop.services || [],
        specialties: shop.specialties || [],
        certifications: shop.certifications || [],
        equipment: shop.equipment || [],
        capacity: shop.capacity || {
          totalBays: 0,
          availableBays: 0,
          maxDailyAppointments: 0
        },
        isActive: shop.is_active ?? true,
        isMainLocation: shop.is_main_location ?? false,
        taxRate: shop.tax_rate || 0,
        currency: shop.currency || 'USD',
        timeZone: shop.time_zone || 'America/New_York',
        logoUrl: shop.logo_url,
        images: shop.images || [],
        socialMedia: shop.social_media,
        settings: shop.settings || {
          allowOnlineBooking: true,
          requireApproval: false,
          sendReminders: true,
          reminderHours: 24,
          autoConfirmAppointments: true,
          emailNotifications: true,
          smsNotifications: false
        },
        manager: shop.manager,
        createdAt: shop.created_at || new Date().toISOString(),
        updatedAt: shop.updated_at || new Date().toISOString()
      })) || [],
      total: response.count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil((response.count || 0) / (query.limit || 10))
    };
  },

  // Get shop by ID
  getShopById: async (shopId: string): Promise<Shop> => {
    const response = await apiGet<any>(`/shops/${shopId}/`);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      address: response.address || '',
      city: response.city || '',
      state: response.state || '',
      zipCode: response.zip_code || '',
      country: response.country || '',
      phone: response.phone || '',
      email: response.email || '',
      website: response.website,
      description: response.description,
      businessHours: response.business_hours || {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: { open: '00:00', close: '00:00', isClosed: true }
      },
      services: response.services || [],
      specialties: response.specialties || [],
      certifications: response.certifications || [],
      equipment: response.equipment || [],
      capacity: response.capacity || {
        totalBays: 0,
        availableBays: 0,
        maxDailyAppointments: 0
      },
      isActive: response.is_active ?? true,
      isMainLocation: response.is_main_location ?? false,
      taxRate: response.tax_rate || 0,
      currency: response.currency || 'USD',
      timeZone: response.time_zone || 'America/New_York',
      logoUrl: response.logo_url,
      images: response.images || [],
      socialMedia: response.social_media,
      settings: response.settings || {
        allowOnlineBooking: true,
        requireApproval: false,
        sendReminders: true,
        reminderHours: 24,
        autoConfirmAppointments: true,
        emailNotifications: true,
        smsNotifications: false
      },
      manager: response.manager,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
  },

  // Create new shop
  createShop: async (shopData: CreateShopData): Promise<Shop> => {
    const createData = {
      name: shopData.name,
      address: shopData.address,
      city: shopData.city,
      state: shopData.state,
      zip_code: shopData.zipCode,
      country: shopData.country,
      phone: shopData.phone,
      email: shopData.email,
      website: shopData.website,
      description: shopData.description,
      business_hours: shopData.businessHours,
      services: shopData.services || [],
      specialties: shopData.specialties || [],
      certifications: shopData.certifications || [],
      equipment: shopData.equipment || [],
      capacity: shopData.capacity,
      tax_rate: shopData.taxRate || 0,
      currency: shopData.currency || 'USD',
      time_zone: shopData.timeZone || 'America/New_York',
      is_main_location: shopData.isMainLocation || false,
      settings: shopData.settings || {
        allowOnlineBooking: true,
        requireApproval: false,
        sendReminders: true,
        reminderHours: 24,
        autoConfirmAppointments: true,
        emailNotifications: true,
        smsNotifications: false
      },
      manager: shopData.manager
    };
    
    const response = await apiPost<any>('/shops/', createData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      address: response.address || '',
      city: response.city || '',
      state: response.state || '',
      zipCode: response.zip_code || '',
      country: response.country || '',
      phone: response.phone || '',
      email: response.email || '',
      website: response.website,
      description: response.description,
      businessHours: response.business_hours || createData.business_hours,
      services: response.services || [],
      specialties: response.specialties || [],
      certifications: response.certifications || [],
      equipment: response.equipment || [],
      capacity: response.capacity || createData.capacity,
      isActive: response.is_active ?? true,
      isMainLocation: response.is_main_location ?? false,
      taxRate: response.tax_rate || 0,
      currency: response.currency || 'USD',
      timeZone: response.time_zone || 'America/New_York',
      logoUrl: response.logo_url,
      images: response.images || [],
      socialMedia: response.social_media,
      settings: response.settings || createData.settings,
      manager: response.manager,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
  },

  // Update shop
  updateShop: async (shopId: string, shopData: UpdateShopData): Promise<Shop> => {
    const updateData = {
      name: shopData.name,
      address: shopData.address,
      city: shopData.city,
      state: shopData.state,
      zip_code: shopData.zipCode,
      country: shopData.country,
      phone: shopData.phone,
      email: shopData.email,
      website: shopData.website,
      description: shopData.description,
      business_hours: shopData.businessHours,
      services: shopData.services,
      specialties: shopData.specialties,
      certifications: shopData.certifications,
      equipment: shopData.equipment,
      capacity: shopData.capacity,
      is_active: shopData.isActive,
      tax_rate: shopData.taxRate,
      currency: shopData.currency,
      time_zone: shopData.timeZone,
      logo_url: shopData.logoUrl,
      images: shopData.images,
      social_media: shopData.socialMedia,
      settings: shopData.settings,
      manager: shopData.manager
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    const response = await apiPut<any>(`/shops/${shopId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      address: response.address || '',
      city: response.city || '',
      state: response.state || '',
      zipCode: response.zip_code || '',
      country: response.country || '',
      phone: response.phone || '',
      email: response.email || '',
      website: response.website,
      description: response.description,
      businessHours: response.business_hours || {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: { open: '00:00', close: '00:00', isClosed: true }
      },
      services: response.services || [],
      specialties: response.specialties || [],
      certifications: response.certifications || [],
      equipment: response.equipment || [],
      capacity: response.capacity || {
        totalBays: 0,
        availableBays: 0,
        maxDailyAppointments: 0
      },
      isActive: response.is_active ?? true,
      isMainLocation: response.is_main_location ?? false,
      taxRate: response.tax_rate || 0,
      currency: response.currency || 'USD',
      timeZone: response.time_zone || 'America/New_York',
      logoUrl: response.logo_url,
      images: response.images || [],
      socialMedia: response.social_media,
      settings: response.settings || {
        allowOnlineBooking: true,
        requireApproval: false,
        sendReminders: true,
        reminderHours: 24,
        autoConfirmAppointments: true,
        emailNotifications: true,
        smsNotifications: false
      },
      manager: response.manager,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
  },

  // Delete shop
  deleteShop: async (shopId: string): Promise<void> => {
    await apiDelete(`/shops/${shopId}/`);
  },

  // Deactivate shop
  deactivateShop: async (shopId: string): Promise<Shop> => {
    return await shopMngtService.updateShop(shopId, { isActive: false });
  },

  // Activate shop
  activateShop: async (shopId: string): Promise<Shop> => {
    return await shopMngtService.updateShop(shopId, { isActive: true });
  },

  // Get main shop
  getMainShop: async (): Promise<Shop | null> => {
    try {
      const query: ShopQuery = {
        limit: 1,
        isActive: true
      };
      
      const response = await shopMngtService.getShops(query);
      const mainShop = response.shops.find(shop => shop.isMainLocation);
      
      return mainShop || (response.shops.length > 0 ? response.shops[0] : null);
    } catch (error) {
      return null;
    }
  },

  // Get shop statistics
  getShopStats: async (shopId?: string): Promise<ShopStats> => {
    const endpoint = shopId ? `/shops/${shopId}/stats/` : '/shops/stats/';
    const response = await apiGet<any>(endpoint);
    
    return {
      totalShops: response.total_shops || 0,
      activeShops: response.active_shops || 0,
      totalBays: response.total_bays || 0,
      availableBays: response.available_bays || 0,
      utilizationRate: response.utilization_rate || 0,
      monthlyAppointments: response.monthly_appointments || 0,
      monthlyRevenue: response.monthly_revenue || 0,
      averageRating: response.average_rating || 0,
      topServices: response.top_services?.map((service: any) => ({
        service: service.service || '',
        count: service.count || 0
      })) || []
    };
  },

  // Get shop availability
  getShopAvailability: async (shopId: string, date: string): Promise<ShopAvailability> => {
    const response = await apiGet<any>(`/shops/${shopId}/availability/?date=${date}`);
    
    return {
      shopId,
      date,
      availableSlots: response.available_slots?.map((slot: any) => ({
        time: slot.time || '',
        duration: slot.duration || 60,
        bayNumber: slot.bay_number,
        technicianId: slot.technician_id?.toString()
      })) || [],
      busySlots: response.busy_slots?.map((slot: any) => ({
        time: slot.time || '',
        duration: slot.duration || 60,
        reason: slot.reason || ''
      })) || []
    };
  },

  // Update shop hours
  updateShopHours: async (shopId: string, businessHours: Shop['businessHours']): Promise<Shop> => {
    return await shopMngtService.updateShop(shopId, { businessHours });
  },

  // Update shop settings
  updateShopSettings: async (shopId: string, settings: Shop['settings']): Promise<Shop> => {
    return await shopMngtService.updateShop(shopId, { settings });
  },

  // Get dashboard data
  getDashboardData: async (shopId?: string): Promise<DashboardData> => {
    const endpoint = shopId ? `/shops/${shopId}/dashboard/` : '/dashboard/';
    const response = await apiGet<any>(endpoint);
    
    return {
      todaysAppointments: response.todays_appointments || 0,
      todaysRevenue: response.todays_revenue || 0,
      activeJobs: response.active_jobs || 0,
      availableBays: response.available_bays || 0,
      weeklyStats: {
        appointments: response.weekly_stats?.appointments || [],
        revenue: response.weekly_stats?.revenue || [],
        labels: response.weekly_stats?.labels || []
      },
      recentActivity: response.recent_activity || [],
      upcomingAppointments: response.upcoming_appointments || [],
      lowInventoryItems: response.low_inventory_items || [],
      employeePerformance: response.employee_performance || []
    };
  },

  // Search shops
  searchShops: async (searchTerm: string, options: { limit?: number; city?: string; state?: string } = {}): Promise<Shop[]> => {
    const query: ShopQuery = {
      search: searchTerm,
      limit: options.limit || 10,
      isActive: true
    };
    
    if (options.city) {
      query.city = options.city;
    }
    
    if (options.state) {
      query.state = options.state;
    }
    
    const response = await shopMngtService.getShops(query);
    return response.shops;
  },

  // Get shop by location
  getShopsByLocation: async (city: string, state?: string): Promise<Shop[]> => {
    const query: ShopQuery = {
      city,
      isActive: true,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    
    if (state) {
      query.state = state;
    }
    
    const response = await shopMngtService.getShops(query);
    return response.shops;
  },

  // Upload shop logo
  uploadShopLogo: async (shopId: string, file: File): Promise<Shop> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`/shops/${shopId}/upload-logo/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Logo upload failed');
    }
    
    const result = await response.json();
    return await shopMngtService.getShopById(shopId);
  },

  // Check if shop is open
  isShopOpen: async (shopId: string, datetime?: string): Promise<boolean> => {
    const params = new URLSearchParams();
    if (datetime) params.append('datetime', datetime);
    
    const queryString = params.toString();
    const endpoint = `/shops/${shopId}/is-open/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<any>(endpoint);
    return response.is_open || false;
  }
};
