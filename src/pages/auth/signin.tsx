/**
 * Sign-in page - redirects to home for competition demo
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Sparkles } from 'lucide-react';

const SignInPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // DEMO: Redirect to home page for competition
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          Redirecting to demo...
        </h1>
      </div>
    </div>
  );
};

export default SignInPage;