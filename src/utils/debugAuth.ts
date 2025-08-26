// Extend Window interface for debugAuth property
declare global {
  interface Window {
    debugAuth?: typeof debugAuthStatus;
  }
}

// Debug utility to check auth token status
export const debugAuthStatus = () => {
  console.log('=== AUTH DEBUG STATUS ===');
  
  // Check localStorage token
  const token = localStorage.getItem('auth_token');
  console.log('Token in localStorage:', token ? 'Present' : 'Missing');
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20) + '...');
    
    // Try to decode JWT token (basic check)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        console.log('Token exp:', new Date(payload.exp * 1000));
        console.log('Token is expired:', payload.exp * 1000 < Date.now());
      }
    } catch (e) {
      console.log('Token decode error:', e);
    }
  }
  
  // Check axios default headers
  import('../utils/api').then(({ apiClient }) => {
    console.log('Axios auth header:', apiClient.defaults.headers.common.Authorization || 'Missing');
  });
  
  // Check current user from Redux
  import('../store').then(({ store }) => {
    const state = store.getState();
    console.log('Redux auth state:', {
      isAuthenticated: state.autoRepairs.isAuthenticated,
      user: state.autoRepairs.user?.email,
      token: state.autoRepairs.token ? 'Present' : 'Missing'
    });
  });
  
  console.log('=== END AUTH DEBUG ===');
};

// Auto-run debug in development
if (import.meta.env.DEV) {
  (window as Window & typeof globalThis).debugAuth = debugAuthStatus;
  console.log('Debug auth function available as window.debugAuth()');
}
