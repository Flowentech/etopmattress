// Security configuration and utilities

// Rate limiting configuration
export const RATE_LIMITS = {
  // API endpoints rate limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },

  // AI generation endpoints - stricter limits
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // limit each user to 10 AI generations per hour
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // limit each IP to 5 auth attempts per windowMs
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // limit each user to 20 uploads per hour
  },
};

// CORS configuration
export const CORS_CONFIG = {
  origins: [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3333',
    // Add your production domains here
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://accurate-wahoo-38.clerk.accounts.dev https://cdn.jsdelivr.net https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: https://*.sanity.io https://*.clerk.accounts.dev https://*.clerk.com https://img.clerk.com https://*.googleusercontent.com https://images.unsplash.com https://www.google-analytics.com https://www.googletagmanager.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://*.sanity.io https://resend.com https://*.clerk.accounts.dev https://*.clerk.com https://img.clerk.com https://accurate-wahoo-38.clerk.accounts.dev https://*.googleusercontent.com https://optimal-spaniel-71.clerk.accounts.dev https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com ws://localhost:* http://localhost:*",
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
};

// Input sanitization utilities
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - for production, consider using a library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

// File upload security
export const FILE_UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > FILE_UPLOAD_LIMITS.maxFileSize) {
    return {
      valid: false,
      error: `File size must be less than ${FILE_UPLOAD_LIMITS.maxFileSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!FILE_UPLOAD_LIMITS.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!FILE_UPLOAD_LIMITS.allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `File extension ${fileExtension} is not allowed`,
    };
  }

  return { valid: true };
}

// IP blocking utilities (in production, use Redis or database)
const blockedIPs = new Set<string>();
const suspiciousAttempts = new Map<string, number>();

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function recordSuspiciousAttempt(ip: string): void {
  const attempts = suspiciousAttempts.get(ip) || 0;
  suspiciousAttempts.set(ip, attempts + 1);

  // Block IP after 10 suspicious attempts
  if (attempts >= 10) {
    blockedIPs.add(ip);
  }
}

export function clearSuspiciousAttempts(ip: string): void {
  suspiciousAttempts.delete(ip);
}

// Password security requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
};

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be less than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Session security
export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
};

// API key validation
export function validateApiKey(key: string): boolean {
  // Basic API key format validation
  const apiKeyRegex = /^[a-zA-Z0-9_-]{20,}$/;
  return apiKeyRegex.test(key);
}

// Security audit logging
export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'SUSPICIOUS_REQUEST' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_INPUT' | 'FILE_UPLOAD_BLOCKED';
  ip: string;
  userAgent?: string;
  userId?: string;
  details: Record<string, any>;
  timestamp: Date;
}

export function logSecurityEvent(event: SecurityEvent): void {
  // In production, send this to your logging service
  console.warn('Security Event:', {
    ...event,
    timestamp: new Date().toISOString(),
  });
}