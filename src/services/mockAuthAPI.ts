// Mock API service for development/demo purposes
// This simulates a backend API without needing a real server

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'mechanic' | 'customer';
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface MockLoginCredentials {
  email: string;
  password: string;
}

export interface MockRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: MockUser['role'];
}

// Mock users database
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@autorepairs.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@autorepairs.com',
    firstName: 'Sarah',
    lastName: 'Manager',
    role: 'manager',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'mechanic@autorepairs.com',
    firstName: 'Mike',
    lastName: 'Mechanic',
    role: 'mechanic',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'customer@autorepairs.com',
    firstName: 'Jane',
    lastName: 'Customer',
    role: 'customer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock JWT token generation
const generateMockToken = (user: MockUser): string => {
  return btoa(JSON.stringify({ 
    userId: user.id, 
    email: user.email, 
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }));
};

// Mock Authentication API
export const mockAuthAPI = {
  // Login user
  async login(credentials: MockLoginCredentials): Promise<{ user: MockUser; token: string }> {
    await delay(800); // Simulate network delay

    // For demo purposes, accept any password for existing users
    const user = mockUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    const token = generateMockToken(user);
    
    // Store token in localStorage for persistence
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));

    return { user, token };
  },

  // Register new user
  async register(data: MockRegisterData): Promise<{ user: MockUser; token: string }> {
    await delay(1000); // Simulate network delay

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      throw new Error('Email address is already registered');
    }

    // Create new user
    const newUser: MockUser = {
      id: String(mockUsers.length + 1),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'customer',
      phone: data.phone,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Add to mock database
    mockUsers.push(newUser);

    const token = generateMockToken(newUser);
    
    // Store token in localStorage for persistence
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(newUser));

    return { user: newUser, token };
  },

  // Get current user (from token)
  async getCurrentUser(): Promise<MockUser | null> {
    await delay(200); // Simulate network delay

    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      return null;
    }

    try {
      const tokenData = JSON.parse(atob(token));
      
      // Check if token is expired
      if (tokenData.exp < Date.now()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        return null;
      }

      const user = JSON.parse(userData);
      return user;
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return null;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    await delay(200); // Simulate network delay
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Refresh token
  async refreshToken(): Promise<{ user: MockUser; token: string }> {
    const currentUser = await this.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('No valid session found');
    }

    const newToken = generateMockToken(currentUser);
    localStorage.setItem('auth_token', newToken);

    return { user: currentUser, token: newToken };
  },
};

// Demo credentials for easy testing
export const demoCredentials = {
  admin: { email: 'admin@autorepairs.com', password: 'admin123' },
  manager: { email: 'manager@autorepairs.com', password: 'manager123' },
  mechanic: { email: 'mechanic@autorepairs.com', password: 'mechanic123' },
  customer: { email: 'customer@autorepairs.com', password: 'customer123' },
};
