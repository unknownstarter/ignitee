// 공통 상수 정의

export const PLATFORMS = {
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  FACEBOOK: 'facebook',
} as const;

export const CONTENT_TYPES = {
  EDUCATIONAL: 'educational',
  ENTERTAINMENT: 'entertainment',
  BEHIND_SCENES: 'behind-scenes',
  PROMOTIONAL: 'promotional',
} as const;

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const TONE_OF_VOICE = {
  PROFESSIONAL: 'professional',
  CASUAL: 'casual',
  FRIENDLY: 'friendly',
  AUTHORITATIVE: 'authoritative',
} as const;

export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
} as const;

export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  ANALYSIS: '/api/analysis',
  STRATEGY: '/api/strategy',
  CONTENT: '/api/content',
  FEEDBACK: '/api/feedback',
} as const;

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error',
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  SAVED: 'Changes saved successfully',
} as const;
