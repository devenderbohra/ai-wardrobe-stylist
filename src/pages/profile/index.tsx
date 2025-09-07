/**
 * Profile page - User onboarding and preferences
 */

import React, { useState, useEffect } from 'react';
import { User, Camera, Sparkles, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
// import { useSession } from 'next-auth/react'; // DEMO: Disabled for competition
import { useDemoSession as useSession } from '@/src/lib/demo-session';
import { StyleType, ColorFamily } from '@/src/types';
import ImageUpload from '@/src/components/ui/ImageUpload';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { cn } from '@/src/utils';
import toast from 'react-hot-toast';

interface ProfileData {
  name: string;
  photos: {
    headshot?: string;
    fullBody?: string;
  };
  preferences: {
    styles: StyleType[];
    favoriteColors: ColorFamily[];
    bodyType?: string;
  };
}

const STYLE_OPTIONS: Array<{ value: StyleType; label: string; description: string; emoji: string }> = [
  { value: 'casual', label: 'Casual', description: 'Relaxed and comfortable', emoji: '👕' },
  { value: 'business', label: 'Business', description: 'Professional and polished', emoji: '💼' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated and refined', emoji: '✨' },
  { value: 'sporty', label: 'Sporty', description: 'Active and athletic', emoji: '⚽' },
  { value: 'trendy', label: 'Trendy', description: 'Fashion-forward and modern', emoji: '🔥' }
];

const COLOR_OPTIONS: Array<{ value: ColorFamily; label: string; bgClass: string }> = [
  { value: 'black', label: 'Black', bgClass: 'bg-gray-900' },
  { value: 'white', label: 'White', bgClass: 'bg-white border-2 border-gray-300' },
  { value: 'gray', label: 'Gray', bgClass: 'bg-gray-500' },
  { value: 'red', label: 'Red', bgClass: 'bg-red-500' },
  { value: 'blue', label: 'Blue', bgClass: 'bg-blue-500' },
  { value: 'green', label: 'Green', bgClass: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', bgClass: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', bgClass: 'bg-pink-500' },
  { value: 'orange', label: 'Orange', bgClass: 'bg-orange-500' },
  { value: 'brown', label: 'Brown', bgClass: 'bg-yellow-700' },
  { value: 'navy', label: 'Navy', bgClass: 'bg-blue-900' }
];

type ProfileStep = 'welcome' | 'basic' | 'photos' | 'preferences' | 'complete';

const ProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<ProfileStep>('welcome');
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    photos: {},
    preferences: {
      styles: [],
      favoriteColors: [],
      bodyType: ''
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const steps = [
    { id: 'welcome' as ProfileStep, title: 'Welcome', number: 1 },
    { id: 'basic' as ProfileStep, title: 'Basic Info', number: 2 },
    { id: 'photos' as ProfileStep, title: 'Photos', number: 3 },
    { id: 'preferences' as ProfileStep, title: 'Preferences', number: 4 },
    { id: 'complete' as ProfileStep, title: 'Complete', number: 5 }
  ];

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/profile?userId=${session.user.id}`);
        const result = await response.json();

        if (result.success && result.data) {
          const userData = result.data;
          
          // Check if user has completed profile setup
          const hasPhotos = userData.photos?.headshot || userData.photos?.fullBody;
          const hasPreferences = userData.styleProfile?.styles?.length > 0;
          
          if (hasPhotos || hasPreferences || userData.name) {
            setHasExistingProfile(true);
            setCurrentStep('complete');
            
            // Load existing data
            setProfile({
              name: userData.name || session.user.name || '',
              photos: userData.photos || {},
              preferences: {
                styles: userData.styleProfile?.styles || [],
                favoriteColors: userData.styleProfile?.favoriteColors || [],
                bodyType: userData.styleProfile?.bodyType || ''
              }
            });
          } else {
            // New user - start onboarding
            setProfile(prev => ({
              ...prev,
              name: session.user.name || ''
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Continue with onboarding if profile load fails
        setProfile(prev => ({
          ...prev,
          name: session?.user?.name || ''
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [session]);

  const handleStyleToggle = (style: StyleType) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        styles: prev.preferences.styles.includes(style)
          ? prev.preferences.styles.filter(s => s !== style)
          : [...prev.preferences.styles, style]
      }
    }));
  };

  const handleColorToggle = (color: ColorFamily) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        favoriteColors: prev.preferences.favoriteColors.includes(color)
          ? prev.preferences.favoriteColors.filter(c => c !== color)
          : [...prev.preferences.favoriteColors, color]
      }
    }));
  };

  const handlePhotoUpload = (files: File[], type: 'headshot' | 'fullBody') => {
    if (files.length > 0) {
      const imageUrl = URL.createObjectURL(files[0]);
      setProfile(prev => ({
        ...prev,
        photos: {
          ...prev.photos,
          [type]: imageUrl
        }
      }));
      toast.success(`${type === 'headshot' ? 'Headshot' : 'Full-body photo'} uploaded!`);
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      // Save profile data to database
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          photos: profile.photos,
          styleProfile: {
            styles: profile.preferences.styles,
            favoriteColors: profile.preferences.favoriteColors,
            bodyType: profile.preferences.bodyType
          }
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile');
      }

      setCurrentStep('complete');
      setHasExistingProfile(true);
      toast.success('Profile saved successfully!');
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedFromBasic = profile.name.trim().length > 0;
  const canProceedFromPhotos = profile.photos.headshot || profile.photos.fullBody;
  const canProceedFromPreferences = profile.preferences.styles.length > 0 && profile.preferences.favoriteColors.length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show profile summary for existing users
  if (hasExistingProfile && currentStep === 'complete') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Complete!</h2>
              <p className="text-gray-600">Your AI wardrobe stylist is ready to help you create amazing outfits.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Your Preferences:</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <p>• {profile.preferences.styles.length} style preferences</p>
                  <p>• {profile.preferences.favoriteColors.length} favorite colors</p>
                  {profile.preferences.bodyType && <p>• Body type: {profile.preferences.bodyType}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/style">
                <Button size="lg" className="w-full">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start AI Styling
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('basic')}
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress indicator */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="flex items-center justify-between mb-8">
          {steps.filter(step => step.id !== 'welcome' && step.id !== 'complete').map((step, index, array) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  steps.findIndex(s => s.id === currentStep) >= index + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}>
                  {step.number - 1}
                </div>
                <span className={cn(
                  'text-sm font-medium hidden sm:block',
                  steps.findIndex(s => s.id === currentStep) >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {step.title}
                </span>
              </div>
              {index < array.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Welcome Step */}
      {currentStep === 'welcome' && (
        <Card className="text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to AI Wardrobe Stylist!
              </h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Let's set up your profile to get personalized styling recommendations powered by AI
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Personal Info</h3>
                <p className="text-sm text-gray-600 mt-1">Tell us about yourself</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Upload Photos</h3>
                <p className="text-sm text-gray-600 mt-1">For realistic styling</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Style Preferences</h3>
                <p className="text-sm text-gray-600 mt-1">Personalized recommendations</p>
              </div>
            </div>

            <Button size="lg" onClick={() => setCurrentStep('basic')}>
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-sm text-gray-500">
              Takes less than 2 minutes • Your data is private and secure
            </p>
          </div>
        </Card>
      )}

      {/* Basic Info Step */}
      {currentStep === 'basic' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Let's start with the basics
              </h2>
              <p className="text-gray-600">
                This helps us personalize your experience
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  What's your name? *
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className="input-base"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Body type (optional)
                </label>
                <select
                  className="input-base"
                  value={profile.preferences.bodyType || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, bodyType: e.target.value }
                  }))}
                >
                  <option value="">Select body type</option>
                  <option value="petite">Petite</option>
                  <option value="tall">Tall</option>
                  <option value="curvy">Curvy</option>
                  <option value="athletic">Athletic</option>
                  <option value="plus-size">Plus Size</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep('photos')}
                disabled={!canProceedFromBasic}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Photos Step */}
      {currentStep === 'photos' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload your photos
              </h2>
              <p className="text-gray-600">
                We'll use these to create realistic outfit visualizations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Headshot Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Headshot</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {profile.photos.headshot ? (
                    <div className="space-y-3">
                      <img
                        src={profile.photos.headshot}
                        alt="Headshot"
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                      />
                      <p className="text-sm text-green-600 font-medium">✓ Uploaded</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setProfile(prev => ({ 
                          ...prev, 
                          photos: { ...prev.photos, headshot: undefined } 
                        }))}
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <ImageUpload
                      onUpload={(files) => handlePhotoUpload(files, 'headshot')}
                      maxFiles={1}
                      multiple={false}
                      className="border-none p-0"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Clear face photo for better styling results
                </p>
              </div>

              {/* Full Body Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Full Body (Optional)</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {profile.photos.fullBody ? (
                    <div className="space-y-3">
                      <img
                        src={profile.photos.fullBody}
                        alt="Full body"
                        className="w-16 h-24 rounded-lg object-cover mx-auto"
                      />
                      <p className="text-sm text-green-600 font-medium">✓ Uploaded</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setProfile(prev => ({ 
                          ...prev, 
                          photos: { ...prev.photos, fullBody: undefined } 
                        }))}
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <ImageUpload
                      onUpload={(files) => handlePhotoUpload(files, 'fullBody')}
                      maxFiles={1}
                      multiple={false}
                      className="border-none p-0"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Full body shot for complete outfit visualization
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('basic')}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep('preferences')}
                disabled={!canProceedFromPhotos}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences Step */}
      {currentStep === 'preferences' && (
        <Card>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Style preferences
              </h2>
              <p className="text-gray-600">
                Help us understand your style to give better recommendations
              </p>
            </div>

            {/* Style Preferences */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                What styles do you love? (Select all that apply) *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STYLE_OPTIONS.map(style => (
                  <button
                    key={style.value}
                    onClick={() => handleStyleToggle(style.value)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-all duration-200',
                      profile.preferences.styles.includes(style.value)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{style.emoji}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{style.label}</h4>
                        <p className="text-sm text-gray-600">{style.description}</p>
                      </div>
                    </div>
                    {profile.preferences.styles.includes(style.value) && (
                      <div className="mt-2 flex items-center text-purple-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Preferences */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Favorite colors? (Select up to 5) *
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => handleColorToggle(color.value)}
                    className={cn(
                      'relative p-2 rounded-lg border-2 transition-all duration-200',
                      profile.preferences.favoriteColors.includes(color.value)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-full mx-auto mb-2', color.bgClass)} />
                    <p className="text-xs text-gray-700 text-center">{color.label}</p>
                    {profile.preferences.favoriteColors.includes(color.value) && (
                      <div className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('photos')}>
                Back
              </Button>
              <Button 
                onClick={handleSaveProfile}
                loading={isLoading}
                disabled={!canProceedFromPreferences}
              >
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Complete Step */}
      {currentStep === 'complete' && (
        <Card className="text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome aboard, {profile.name}! 🎉
              </h1>
              <p className="text-lg text-gray-600">
                Your profile is all set up and ready for AI-powered styling
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-2">What's next?</h3>
              <div className="space-y-2 text-sm text-purple-800">
                <div>1. Add clothing items to your digital wardrobe</div>
                <div>2. Choose an occasion and get AI styling recommendations</div>
                <div>3. See yourself styled in realistic outfit combinations</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/add">
                <Button size="lg">
                  Add Clothing Items
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/wardrobe">
                <Button variant="outline" size="lg">
                  Explore Wardrobe
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;