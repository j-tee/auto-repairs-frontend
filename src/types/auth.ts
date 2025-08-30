// export interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: 'owner' | 'employee' | 'customer';
//   avatar?: string;
//   phone?: string;
//   address?: string;
//   isActive: boolean;
//   createdAt: string;
//   lastLogin?: string;
// }

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: User['role'];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}