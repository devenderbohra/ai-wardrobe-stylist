/**
 * Demo session for competition - bypasses authentication
 */

export const DEMO_SESSION = {
  user: {
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@styledandstudied.com',
    image: null,
  },
  expires: '2025-12-31T23:59:59.999Z',
};

export const useDemoSession = () => {
  return {
    data: DEMO_SESSION,
    status: 'authenticated' as const,
  };
};

// For compatibility with next-auth
export const signOut = () => {
  // DEMO: No-op for competition
};