// API Configuration - automatically handles development vs production
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3234/api'  // Local development
  : 'https://www.anoudjob.com/api'; // Production

if (isDevelopment) {
  console.log('🔧 Development mode - using local API:', API_BASE_URL);
} else {
  console.log('🚀 Production mode - using production API:', API_BASE_URL);
}

// API endpoints
export const API_ENDPOINTS = {
  COMPANIES: '/companies',
  JOBS: '/jobs',
  USERS: '/users',
  APPLICATIONS: '/applications',
  ADMIN: '/admin',
  CONTACT: '/contact',
  LEADS: '/leads',
  CV_UPLOAD: '/cv-upload'
} as const;
