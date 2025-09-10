/**
 * API utility functions
 */

/**
 * Get the correct API URL for the current environment
 * In production, use www.styledandstudied.com to avoid redirect issues
 * In development, use relative URLs
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present to normalize
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In production, use the www domain to avoid 307 redirects
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    return `https://www.styledandstudied.com${normalizedPath}`;
  }
  
  // In development or server-side, use relative URLs
  return normalizedPath;
}

/**
 * Enhanced fetch wrapper that handles API URLs correctly
 */
export async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(path);
  
  // Add default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  return fetch(url, mergedOptions);
}