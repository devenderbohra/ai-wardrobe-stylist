import React from 'react';
import { signIn, getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { Sparkles } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';

interface SignInPageProps {
  callbackUrl?: string;
}

const SignInPage: React.FC<SignInPageProps> = ({ callbackUrl }) => {
  const handleGoogleSignIn = () => {
    signIn('google', { 
      callbackUrl: callbackUrl || '/profile' 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Wardrobe Stylist
            </h1>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600">
            Sign in to access your personalized wardrobe and styling recommendations
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Continue with Google
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Secure sign-in to save your wardrobe and style preferences
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="w-full flex items-center justify-center space-x-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </Card>

        {/* Features Preview */}
        <div className="text-center space-y-4">
          <h4 className="text-sm font-medium text-gray-900">
            What you'll get with your account:
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
            <div>✨ Personalized AI styling recommendations</div>
            <div>👔 Digital wardrobe organization</div>
            <div>📱 Sync across all your devices</div>
            <div>🎯 Occasion-based outfit suggestions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { callbackUrl } = context.query;

  // If user is already signed in, redirect to profile or callback URL
  if (session) {
    return {
      redirect: {
        destination: (callbackUrl as string) || '/profile',
        permanent: false,
      },
    };
  }

  return {
    props: {
      callbackUrl: callbackUrl || null,
    },
  };
};

export default SignInPage;