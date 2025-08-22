# Environment Variables Guide

This document explains the environment variable setup for the Auto Repairs Frontend application.

## 📁 Environment Files Structure

```
├── .env.development        # Development variables (committed)
├── .env.production         # Production variables (committed)
├── .env.local.example      # Template for local overrides (committed)
└── .env.local              # Local developer overrides (git-ignored)
```

## 🔄 Environment File Loading Order

Vite loads environment files in this order (later files override earlier ones):

1. `.env.development` or `.env.production` - Environment-specific values (primary source)
2. `.env.local` - Local developer overrides (highest priority)

## 🛠️ Available Environment Variables

### API Configuration
```bash
# Backend API URL
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# API timeout in milliseconds
VITE_API_TIMEOUT=10000

# Token refresh threshold in milliseconds
VITE_TOKEN_REFRESH_THRESHOLD=300000
```

### Application Settings
```bash
# Application display name
VITE_APP_NAME=Auto Repairs Management System

# Application version
VITE_APP_VERSION=1.0.0
```

### Development Features
```bash
# Enable development mode features
VITE_DEV_MODE=true

# Logging level: debug, info, warn, error
VITE_LOG_LEVEL=debug

# Enable debugging tools in UI
VITE_ENABLE_DEBUG_TOOLS=true

# Use mock API instead of real backend
VITE_ENABLE_MOCK_API=false
```

## 🏗️ Environment-Specific Configurations

### Development (.env.development)
- **API URL**: `http://127.0.0.1:8000/api` (Django backend)
- **Debug Tools**: Enabled
- **Logging**: Verbose (debug level)
- **Timeouts**: Lenient (15 seconds)

### Production (.env.production)
- **API URL**: `https://api.autorepairs.example.com/api`
- **Debug Tools**: Disabled
- **Logging**: Minimal (error level only)
- **Timeouts**: Strict (8 seconds)

## 🔧 Local Development Setup

1. **Copy the example file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Customize your local settings**:
   ```bash
   # Example .env.local for local development
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_ENABLE_MOCK_API=true
   VITE_LOG_LEVEL=verbose
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 🌐 Common API URL Configurations

### Local Django Backend
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Docker Backend
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### Network Backend (different machine)
```bash
VITE_API_BASE_URL=http://192.168.1.100:8000/api
```

### Production Backend
```bash
VITE_API_BASE_URL=https://api.autorepairs.com/api
```

## 🔍 Debugging Environment Issues

### Check Current Environment Variables
Add this to any component for debugging:
```typescript
console.log('Environment Variables:', {
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  devMode: import.meta.env.VITE_DEV_MODE,
  logLevel: import.meta.env.VITE_LOG_LEVEL
});
```

### Common Issues

1. **API calls fail with CORS errors**
   - Check `VITE_API_BASE_URL` points to correct backend
   - Ensure backend CORS settings allow frontend domain

2. **Environment variables not updating**
   - Restart development server after changing .env files
   - Check file naming (must start with `VITE_`)

3. **Wrong environment loaded**
   - Check `NODE_ENV` environment variable
   - Verify file naming matches Vite conventions

## 📝 Best Practices

### ✅ Do:
- Use `VITE_` prefix for all custom environment variables
- Keep sensitive data out of committed .env files
- Use `.env.local` for personal development overrides
- Document any new environment variables you add

### ❌ Don't:
- Commit `.env.local` to version control
- Store secrets in environment files (use proper secret management)
- Use environment variables for build-time constants (use config files instead)

## 🚀 Deployment

### Development Deployment
Uses `.env.development` automatically when `NODE_ENV=development`

### Production Deployment
1. Set `NODE_ENV=production`
2. Update `VITE_API_BASE_URL` in `.env.production`
3. Build: `npm run build`
4. Deploy the `dist/` folder

### Environment-Specific Builds
```bash
# Build for development
npm run build:dev

# Build for production
npm run build:prod
```

## 🔒 Security Notes

- Environment variables are embedded in the built JavaScript bundle
- Never store API keys, passwords, or secrets in VITE_ variables
- Use backend environment variables for sensitive configuration
- The frontend should only contain publicly safe configuration

---

For questions about environment setup, check the [main README](./README.md) or contact the development team.
