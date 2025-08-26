import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  clearAuthError,
  clearAllAuthErrors,
  clearPasswordResetEmail,
  type LoginCredentials,
  type RegisterData,
  type User,
  type PasswordResetRequest,
  type PasswordReset
} from '../store/slices/autoRepairsSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.autoRepairs);

  const login = useCallback(async (credentials: LoginCredentials) => {
    return dispatch(loginUser(credentials));
  }, [dispatch]);

  const register = useCallback(async (userData: RegisterData) => {
    return dispatch(registerUser(userData));
  }, [dispatch]);

  const logout = useCallback(async () => {
    return dispatch(logoutUser());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    return dispatch(refreshToken());
  }, [dispatch]);

  const getUser = useCallback(async () => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  const requestReset = useCallback(async (data: PasswordResetRequest) => {
    return dispatch(requestPasswordReset(data));
  }, [dispatch]);

  const resetPass = useCallback(async (data: PasswordReset) => {
    return dispatch(resetPassword(data));
  }, [dispatch]);

  const updateUserProfile = useCallback(async (userData: Partial<User>) => {
    return dispatch(updateProfile(userData));
  }, [dispatch]);

  const clearError = useCallback((errorType: keyof typeof auth.error) => {
    dispatch(clearAuthError(errorType));
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearAllAuthErrors());
  }, [dispatch]);

  const clearResetEmail = useCallback(() => {
    dispatch(clearPasswordResetEmail());
  }, [dispatch]);

  // Helper functions
  const isAdmin = useCallback(() => {
    return auth.user?.role === 'owner';
  }, [auth.user]);

  const isManager = useCallback(() => {
    return auth.user?.role === 'employee' || auth.user?.role === 'owner';
  }, [auth.user]);

  const isMechanic = useCallback(() => {
    return auth.user?.role === 'employee' || auth.user?.role === 'owner';
  }, [auth.user]);

  const hasPermission = useCallback((requiredRole: User['role']) => {
    if (!auth.user) return false;
    
    const roleHierarchy = {
      'customer': 0,
      'employee': 1,
      'owner': 2
    };
    
    return roleHierarchy[auth.user.role] >= roleHierarchy[requiredRole];
  }, [auth.user]);

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    passwordResetEmail: auth.passwordResetEmail,

    // Actions
    login,
    register,
    logout,
    refresh,
    getUser,
    requestReset,
    resetPass,
    updateUserProfile,
    clearError,
    clearAllErrors,
    clearResetEmail,

    // Helpers
    isAdmin,
    isManager,
    isMechanic,
    hasPermission,
  };
};
