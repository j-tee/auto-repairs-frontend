// Environment Configuration Utility
// This utility helps verify and debug environment variable setup

export interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  tokenRefreshThreshold: number;
  
  // Application Settings
  appName: string;
  appVersion: string;
  
  // Development Features
  devMode: boolean;
  logLevel: string;
  enableDebugTools: boolean;
  enableMockApi: boolean;
}

/**
 * Get current environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    // API Configuration
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
    tokenRefreshThreshold: Number(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300000,
    
    // Application Settings
    appName: import.meta.env.VITE_APP_NAME || 'Auto Repairs Management System',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // Development Features
    devMode: import.meta.env.VITE_DEV_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    enableDebugTools: import.meta.env.VITE_ENABLE_DEBUG_TOOLS === 'true',
    enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  };
}



/**
 * Validate environment configuration and return issues
 */
export function validateEnvironmentConfig(): string[] {
  const config = getEnvironmentConfig();
  const issues: string[] = [];
  
  // Validate API URL
  if (!config.apiBaseUrl) {
    issues.push('❌ VITE_API_BASE_URL is not set');
  } else if (!config.apiBaseUrl.startsWith('http')) {
    issues.push('❌ VITE_API_BASE_URL must start with http:// or https://');
  }
  
  // Validate timeout
  if (config.apiTimeout < 1000) {
    issues.push('⚠️ VITE_API_TIMEOUT is very low (< 1 second)');
  } else if (config.apiTimeout > 30000) {
    issues.push('⚠️ VITE_API_TIMEOUT is very high (> 30 seconds)');
  }
  
  // Validate log level
  const validLogLevels = ['debug', 'info', 'warn', 'error', 'verbose'];
  if (!validLogLevels.includes(config.logLevel)) {
    issues.push(`❌ VITE_LOG_LEVEL '${config.logLevel}' is invalid. Use: ${validLogLevels.join(', ')}`);
  }
  
  // Development warnings
  if (config.devMode && import.meta.env.PROD) {
    issues.push('⚠️ VITE_DEV_MODE is enabled in production build');
  }
  
  if (config.enableMockApi && !config.devMode) {
    issues.push('⚠️ VITE_ENABLE_MOCK_API is enabled but VITE_DEV_MODE is disabled');
  }
  
  return issues;
}

/**
 * Get environment-specific recommendations
 */
export function getEnvironmentRecommendations(): string[] {
  const config = getEnvironmentConfig();
  const recommendations: string[] = [];
  
  // API URL recommendations
  if (config.apiBaseUrl.includes('localhost') || config.apiBaseUrl.includes('127.0.0.1')) {
    recommendations.push('💡 Using local API URL - great for development!');
  }
  
  if (config.devMode) {
    recommendations.push('💡 Development mode enabled - debug tools and verbose logging available');
  }
  
  if (!config.enableDebugTools && config.devMode) {
    recommendations.push('💡 Consider enabling VITE_ENABLE_DEBUG_TOOLS=true for better development experience');
  }
  
  if (config.enableMockApi) {
    recommendations.push('💡 Mock API enabled - switch to real backend when ready');
  }
  
  return recommendations;
}

/**
 * Display comprehensive environment status
 */
export function displayEnvironmentStatus(): void {
  // Validate configuration silently
  validateEnvironmentConfig();
  getEnvironmentRecommendations();
}

// Make environment tools available globally in development
if (import.meta.env.DEV) {
  (window as unknown as { envConfig: unknown }).envConfig = {
    get: getEnvironmentConfig,
    validate: validateEnvironmentConfig,
    status: displayEnvironmentStatus,
  };
}
