/**
 * Style page - AI outfit generation and visualization
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Download, Share2, Heart, ArrowLeft, Shirt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
// import { useSession } from 'next-auth/react'; // DEMO: Disabled for competition  
import { useDemoSession as useSession } from '@/src/lib/demo-session';
import { ClothingItem, Occasion, OutfitRecommendation } from '@/src/types';
import { clothingAPI } from '@/src/lib/api';
import { generateOutfitImage } from '@/src/lib/gemini';
import toast from 'react-hot-toast';
import OccasionSelector from '@/src/components/ui/OccasionSelector';
import ClothingGrid from '@/src/components/wardrobe/ClothingGrid';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { cn } from '@/src/utils';
import { apiRequest } from '@/src/utils/api';

// TODO: Load actual user wardrobe items from API
const MOCK_WARDROBE_ITEMS: ClothingItem[] = [];
interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  number: number;
  title: string;
}

const Step: React.FC<StepProps> = ({ isActive, isCompleted, number, title }) => (
  <div className="flex items-center space-x-3">
    <div className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
      isCompleted 
        ? 'bg-green-500 text-white'
        : isActive
        ? 'bg-purple-600 text-white'
        : 'bg-gray-200 text-gray-600'
    )}>
      {isCompleted ? '✓' : number}
    </div>
    <span className={cn(
      'text-sm font-medium',
      isActive ? 'text-gray-900' : 'text-gray-500'
    )}>
      {title}
    </span>
  </div>
);

type StyleStep = 'items' | 'generate' | 'results';

const StylePage: React.FC = () => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<StyleStep>('items');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedOutfit, setGeneratedOutfit] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [activeRecommendation, setActiveRecommendation] = useState<number>(0);

  // Load user's wardrobe items
  useEffect(() => {
    const loadWardrobeItems = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const response = await clothingAPI.getAll(session.user.id);
        if (response.success) {
          setWardrobeItems(response.data!);
        } else {
          toast.error('Failed to load wardrobe items');
        }
      } catch (error) {
        console.error('Failed to load wardrobe:', error);
        toast.error('Failed to load wardrobe items');
      } finally {
        setLoading(false);
      }
    };

    loadWardrobeItems();
  }, [session?.user?.id, currentStep]);

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to access AI styling.</p>
      </div>
    );
  }

  const steps = [
    { id: 'items' as StyleStep, number: 1, title: 'Select Items' },
    { id: 'generate' as StyleStep, number: 2, title: 'Generate Style' },
    { id: 'results' as StyleStep, number: 3, title: 'View Results' }
  ];

  const handleItemToggle = (item: ClothingItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.includes(item.id);
      if (isSelected) {
        // Deselect item
        return prev.filter(id => id !== item.id);
      } else {
        // Smart category conflict resolution
        const currentlySelectedItems = wardrobeItems.filter(wardrobeItem => 
          prev.includes(wardrobeItem.id)
        );
        
        // Define category conflicts (items that shouldn't be worn together)
        const categoryConflicts = {
          'tops': ['dresses'],
          'dresses': ['tops', 'bottoms'],
          'bottoms': ['dresses']
        };
        
        const conflictingItems = currentlySelectedItems.filter(selectedItem => {
          const itemConflicts = categoryConflicts[item.category as keyof typeof categoryConflicts] || [];
          const selectedItemConflicts = categoryConflicts[selectedItem.category as keyof typeof categoryConflicts] || [];
          
          return itemConflicts.includes(selectedItem.category) || 
                 selectedItemConflicts.includes(item.category) ||
                 selectedItem.category === item.category;
        });

        if (conflictingItems.length > 0) {
          // Replace conflicting items with the new one
          const filteredItems = prev.filter(id => 
            !conflictingItems.some(conflictItem => conflictItem.id === id)
          );
          
          const replacedNames = conflictingItems.map(item => item.name).join(', ');
          toast.success(`Replaced ${replacedNames} with ${item.name}`);
          return [...filteredItems, item.id];
        } else {
          // No conflict, add the item
          toast.success(`Added ${item.name} to outfit`);
          return [...prev, item.id];
        }
      }
    });
  };

  const handleGenerateOutfit = async () => {
    if (selectedItems.length === 0) return;
    
    setIsGenerating(true);
    setCurrentStep('generate');
    
    try {
      const response = await apiRequest('/api/ai/generate-outfit', {
        method: 'POST',
        body: JSON.stringify({
          clothingItemIds: selectedItems,
          occasion: 'casual', // Default occasion since we removed the selection
          userId: session.user.id
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Handle specific error types with user-friendly messages
        if (result.error?.includes('Rate limit exceeded')) {
          throw new Error('🚀 Our AI is getting lots of love! Please wait a minute and try again. You can use this time to adjust your clothing selection.');
        } else if (result.error?.includes('User photos not found')) {
          throw new Error('📸 Please complete your profile setup by adding a photo before generating outfits.');
        } else if (result.error?.includes('Gemini API key')) {
          throw new Error('⚙️ AI service is temporarily unavailable. Please try again later.');
        } else if (response.status === 429) {
          throw new Error('🚀 Our AI is getting lots of love! Please wait a moment and try again.');
        } else {
          throw new Error(result.error || 'Failed to generate outfit');
        }
      }

      // Set the generated outfit image
      setGeneratedOutfit(result.data.imageUrl);
      
      // Create recommendation from API response
      const recommendation: OutfitRecommendation = {
        items: result.data.outfit.items,
        confidence: result.data.outfit.confidence,
        reasoning: result.data.outfit.reasoning,
        styleScore: result.data.outfit.styleScore,
        colorHarmony: result.data.outfit.colorHarmony,
        occasion: result.data.outfit.occasion
      };
      
      setRecommendations([recommendation]);
      setCurrentStep('results');
      
      toast.success('🎉 Your AI-styled outfit is ready!');
    } catch (error: any) {
      console.error('Failed to generate outfit:', error);
      toast.error(error.message || 'Failed to generate outfit. Please try again.');
      
      // Reset to items selection step on error
      setCurrentStep('items');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetStyling = () => {
    setCurrentStep('items');
    setSelectedItems([]);
    setGeneratedOutfit(null);
    setRecommendations([]);
    setActiveRecommendation(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-gray-900 flex items-center">
            <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
            AI Stylist
          </h1>
          <p className="text-gray-600 mt-1">
            Let AI create the perfect outfit for any occasion
          </p>
        </div>

        {currentStep !== 'items' && (
          <Button variant="outline" onClick={resetStyling}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <Step
                isActive={currentStep === step.id}
                isCompleted={steps.findIndex(s => s.id === currentStep) > index}
                number={step.number}
                title={step.title}
              />
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      {currentStep === 'items' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Items for Your Outfit
                </h3>
                <p className="text-gray-600 mt-1">
                  Choose 2-5 items from your wardrobe to create an outfit
                </p>
              </div>
              
              <div className="text-sm text-gray-500">
                {selectedItems.length} items selected
              </div>
            </div>

            <ClothingGrid
              items={wardrobeItems}
              selectedItems={selectedItems}
              multiSelect
              onItemClick={handleItemToggle}
              emptyMessage="No items available. Add some clothing to your wardrobe first."
            />

            {selectedItems.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setCurrentStep('generate')}
                  disabled={selectedItems.length < 2}
                >
                  Generate Outfit ({selectedItems.length} items)
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {currentStep === 'generate' && (
        <Card className="text-center py-12">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Creating Your Perfect Look
              </h3>
              <p className="text-gray-600">
                Our AI is analyzing your selected items and generating a styled photo...
              </p>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This usually takes 10-15 seconds...
              </p>
            </div>

            <Button size="lg" onClick={handleGenerateOutfit} loading={isGenerating}>
              Generate My Style
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 'results' && generatedOutfit && recommendations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generated Outfit Display */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Your AI-Styled Look
              </h3>
              
              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                {generatedOutfit ? (
                  <Image
                    src={generatedOutfit}
                    alt="AI Generated Outfit"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', generatedOutfit);
                      // Show error state
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Generating your styled photo...</p>
                    </div>
                  </div>
                )}
                
                {/* Action buttons overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                  <Button variant="secondary" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="secondary">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Outfit Details and Actions */}
          <div className="space-y-6">
            {/* Confidence Score */}
            <Card>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Style Analysis</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Match</span>
                      <span>{Math.round(recommendations[activeRecommendation].confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${recommendations[activeRecommendation].confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Style Score</span>
                      <span>{Math.round(recommendations[activeRecommendation].styleScore * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${recommendations[activeRecommendation].styleScore * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Color Harmony</span>
                      <span>{Math.round(recommendations[activeRecommendation].colorHarmony * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${recommendations[activeRecommendation].colorHarmony * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  {recommendations[activeRecommendation].reasoning}
                </p>
              </div>
            </Card>

            {/* Items Used */}
            <Card>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Items in This Outfit</h4>
                <div className="grid grid-cols-3 gap-3">
                  {recommendations[activeRecommendation].items.map(item => (
                    <div key={item.id} className="text-center">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                        <Image
                          src={item.thumbnailUrl || item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-xs text-gray-600 truncate">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button size="lg" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Another Style
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setCurrentStep('items')}>
                  Change Items
                </Button>
                <Button variant="outline" onClick={resetStyling}>
                  New Occasion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for no wardrobe items */}
      {wardrobeItems.length === 0 && !loading && (
        <Card className="text-center py-12">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
              <Shirt className="w-10 h-10 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Let's Build Your Digital Wardrobe!
              </h3>
              <p className="text-gray-600 max-w-lg mx-auto">
                To get personalized AI styling recommendations, we need at least 3-5 clothing items from your wardrobe. 
                This helps our AI understand your style and create better outfits.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">💡</div>
                <div className="text-left">
                  <h4 className="font-semibold text-blue-900 mb-1">Quick Start Tips:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Start with basic items (shirts, pants, shoes)</li>
                    <li>• Add items for different occasions</li>
                    <li>• Include both casual and formal pieces</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link href="/add">
                <Button size="lg" className="w-full sm:w-auto">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Adding Items
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                Takes just 2-3 minutes to get started
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Loading state */}
      {loading && (
        <Card className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Loading your wardrobe...</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StylePage;