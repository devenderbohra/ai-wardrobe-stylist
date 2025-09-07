/**
 * Demo session for competition - creates unique users and persists in localStorage
 */

import { useState, useEffect } from 'react';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  image: null;
}

interface DemoSession {
  user: DemoUser;
  expires: string;
}

// Generate unique user ID and name
const generateUniqueUser = (): DemoUser => {
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const adjectives = ['Stylish', 'Trendy', 'Chic', 'Fashion', 'Creative', 'Modern', 'Elegant', 'Cool'];
  const nouns = ['Explorer', 'Stylist', 'Designer', 'Creator', 'Fashionista', 'Trendsetter', 'User', 'Person'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const name = `${adjective} ${noun}`;
  
  return {
    id: userId,
    name,
    email: `${userId}@demo.styledandstudied.com`,
    image: null,
  };
};

// Get or create user session
const getOrCreateDemoSession = (): DemoSession => {
  if (typeof window === 'undefined') {
    // Server-side: return temporary session
    return {
      user: generateUniqueUser(),
      expires: '2025-12-31T23:59:59.999Z',
    };
  }

  // Client-side: check localStorage first
  const stored = localStorage.getItem('demo-session');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Check if session is still valid (not expired)
      if (new Date(parsed.expires) > new Date()) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse stored session:', error);
    }
  }

  // Create new session
  const newSession: DemoSession = {
    user: generateUniqueUser(),
    expires: '2025-12-31T23:59:59.999Z',
  };

  // Store in localStorage
  localStorage.setItem('demo-session', JSON.stringify(newSession));
  
  return newSession;
};

export const useDemoSession = () => {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated'>('loading');

  useEffect(() => {
    // Initialize session on client side
    const demoSession = getOrCreateDemoSession();
    setSession(demoSession);
    setStatus('authenticated');
  }, []);

  return {
    data: session,
    status,
  };
};

// For compatibility with next-auth
export const signOut = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-session');
    window.location.href = '/';
  }
};