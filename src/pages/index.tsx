/**
 * Home page - Welcome screen and onboarding
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Shirt, Camera, Zap, ArrowRight } from 'lucide-react';
import { useDemoSession as useSession } from '@/src/lib/demo-session';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';

const HomePage: React.FC = () => {
  const { data: session } = useSession();

  // Automatically seed user's wardrobe on first visit
  useEffect(() => {
    const seedUserWardrobe = async () => {
      if (!session?.user?.id) return;

      // Check if user already has been seeded (stored in localStorage)
      const seededKey = `seeded-${session.user.id}`;
      if (localStorage.getItem(seededKey)) return;

      try {
        const response = await fetch('/api/clothing/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: session.user.id }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.itemsAdded > 0) {
            // Mark user as seeded
            localStorage.setItem(seededKey, 'true');
          }
        }
      } catch (error) {
        console.warn('Auto-seed failed:', error);
      }
    };

    seedUserWardrobe();
  }, [session?.user?.id]);

  const features = [
    {
      icon: Camera,
      title: 'Upload Your Photos',
      description: 'Add your headshot and wardrobe items to get started'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Styling',
      description: 'Get personalized outfit recommendations using advanced AI'
    },
    {
      icon: Shirt,
      title: 'Digital Wardrobe',
      description: 'Organize and manage your clothing collection digitally'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'See yourself styled in different outfits within seconds'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Upload Your Photo',
      description: 'Start with a clear headshot or full-body photo'
    },
    {
      step: 2,
      title: 'Add Clothing Items',
      description: 'Upload photos of your clothes or import from URLs'
    },
    {
      step: 3,
      title: 'Choose an Occasion',
      description: 'Select from work, casual, date, formal, or party'
    },
    {
      step: 4,
      title: 'Get Styled',
      description: 'See AI-generated outfit combinations on your photo'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-display text-gray-900">
              AI Wardrobe Stylist
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your styling experience with AI-powered outfit recommendations. 
            See yourself in different combinations and discover new looks from your wardrobe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/profile">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link href="/wardrobe">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-heading text-gray-900 mb-4">
            Why Choose AI Wardrobe Stylist?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powered by Google's Gemini 2.5 Flash Image API for realistic outfit visualizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} hover className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-heading text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get styled in just four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gray-200 z-0" />
              )}
              
              <Card className="relative z-10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-white">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Transform Your Style?
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of users who've discovered their perfect style with AI-powered recommendations
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/profile">
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-50"
            >
              Start Styling Now
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <p className="text-sm opacity-75">
            Free to use • No credit card required
          </p>
        </div>
      </div>

      {/* Stats/Social Proof */}
      <div className="text-center space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">10K+</div>
            <div className="text-sm text-gray-600">Outfits Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">95%</div>
            <div className="text-sm text-gray-600">User Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">&lt;15s</div>
            <div className="text-sm text-gray-600">Generation Time</div>
          </div>
        </div>
        
        <p className="text-xs text-gray-400">
          Powered by Google's Gemini 2.5 Flash Image API • Built for Nano Banana Hackathon
        </p>
      </div>
    </div>
  );
};

export default HomePage;