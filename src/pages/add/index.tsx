/**
 * Add Items page - Upload clothing items via photos or URLs
 */

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Camera, Sparkles, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ClothingItem, UploadProgress } from '@/src/types';
import ImageUpload from '@/src/components/ui/ImageUpload';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { cn, generateId } from '@/src/utils';
import toast from 'react-hot-toast';

type AddMethod = 'upload' | 'url';

const AddItemsPage: React.FC = () => {
  const [activeMethod, setActiveMethod] = useState<AddMethod>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [addedItems, setAddedItems] = useState<ClothingItem[]>([]);

  const handleFileUpload = async (files: File[]) => {
    const newProgress: UploadProgress[] = files.map(file => ({
      id: generateId(),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadProgress(newProgress);

    // Simulate upload and processing
    for (let i = 0; i < newProgress.length; i++) {
      const progressItem = newProgress[i];
      
      // Update to uploading
      setUploadProgress(prev => 
        prev.map(item => 
          item.id === progressItem.id 
            ? { ...item, status: 'uploading', progress: 0 }
            : item
        )
      );

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(prev => 
          prev.map(item => 
            item.id === progressItem.id 
              ? { ...item, progress }
              : item
          )
        );
      }

      // Processing phase
      setUploadProgress(prev => 
        prev.map(item => 
          item.id === progressItem.id 
            ? { ...item, status: 'analyzing', progress: 100 }
            : item
        )
      );

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock clothing item
      const mockItem: ClothingItem = {
        id: generateId(),
        userId: 'demo-user',
        name: `Uploaded ${progressItem.file.name.split('.')[0]}`,
        category: 'tops',
        type: 't-shirt',
        imageUrl: URL.createObjectURL(progressItem.file),
        colors: ['blue'],
        primaryColor: 'blue',
        style: 'casual',
        season: ['all-season'],
        tags: ['uploaded'],
        dateAdded: new Date(),
        wearCount: 0,
        isFavorite: false,
        aiAnalysis: {
          confidence: 0.85,
          description: 'Automatically categorized using AI',
          suggestedCategory: 'tops',
          suggestedColors: ['blue'],
          analysisDate: new Date()
        }
      };

      // Complete
      setUploadProgress(prev => 
        prev.map(item => 
          item.id === progressItem.id 
            ? { ...item, status: 'complete', result: mockItem }
            : item
        )
      );

      setAddedItems(prev => [...prev, mockItem]);
      toast.success(`${progressItem.file.name} added to wardrobe!`);
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsImporting(true);

    try {
      // Simulate URL import
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockItem: ClothingItem = {
        id: generateId(),
        userId: 'demo-user',
        name: 'Imported Item from URL',
        category: 'tops',
        type: 'shirt',
        imageUrl: 'https://via.placeholder.com/400x400/F3F4F6/6B7280?text=Imported+Shirt',
        colors: ['white'],
        primaryColor: 'white',
        style: 'business',
        season: ['all-season'],
        tags: ['imported'],
        sourceUrl: urlInput,
        dateAdded: new Date(),
        wearCount: 0,
        isFavorite: false,
        aiAnalysis: {
          confidence: 0.9,
          description: 'Imported and analyzed from e-commerce URL',
          suggestedCategory: 'tops',
          suggestedColors: ['white'],
          analysisDate: new Date()
        }
      };

      setAddedItems(prev => [...prev, mockItem]);
      setUrlInput('');
      toast.success('Item imported successfully!');

    } catch (error) {
      toast.error('Failed to import item from URL');
    } finally {
      setIsImporting(false);
    }
  };

  const supportedSites = [
    'Amazon', 'Zara', 'H&M', 'Uniqlo', 'Nike', 'Adidas', 'Target', 'Walmart'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-display text-gray-900">Add Clothing Items</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Build your digital wardrobe by uploading photos or importing from your favorite stores
        </p>
      </div>

      {/* Method Selector */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveMethod('upload')}
            className={cn(
              'p-6 rounded-xl border-2 text-left transition-all duration-200',
              activeMethod === 'upload'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            )}
          >
            <div className="flex items-start space-x-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                activeMethod === 'upload' ? 'bg-purple-100' : 'bg-gray-100'
              )}>
                <Camera className={cn(
                  'w-6 h-6',
                  activeMethod === 'upload' ? 'text-purple-600' : 'text-gray-600'
                )} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Upload Photos</h3>
                <p className="text-sm text-gray-600">
                  Take photos or upload images of your clothing items
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                    Recommended
                  </span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveMethod('url')}
            className={cn(
              'p-6 rounded-xl border-2 text-left transition-all duration-200',
              activeMethod === 'url'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            )}
          >
            <div className="flex items-start space-x-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                activeMethod === 'url' ? 'bg-purple-100' : 'bg-gray-100'
              )}>
                <LinkIcon className={cn(
                  'w-6 h-6',
                  activeMethod === 'url' ? 'text-purple-600' : 'text-gray-600'
                )} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Import from URL</h3>
                <p className="text-sm text-gray-600">
                  Paste product links from your favorite online stores
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                    Quick &amp; Easy
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </Card>

      {/* Upload Method */}
      {activeMethod === 'upload' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Clothing Photos
              </h3>
              <p className="text-gray-600">
                Take clear photos of your clothing items for best AI analysis results
              </p>
            </div>

            <ImageUpload
              onUpload={handleFileUpload}
              uploadProgress={uploadProgress}
              maxFiles={10}
              multiple={true}
            />

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Tips for better AI analysis</h4>
                  <ul className="mt-1 text-sm text-blue-700 space-y-1">
                    <li>• Use good lighting and avoid shadows</li>
                    <li>• Lay items flat or hang them neatly</li>
                    <li>• Ensure the entire item is visible in the frame</li>
                    <li>• Use a plain background when possible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* URL Method */}
      {activeMethod === 'url' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Import from Product URL
              </h3>
              <p className="text-gray-600">
                Paste a link to any clothing item from supported online stores
              </p>
            </div>

            <div className="flex space-x-3">
              <input
                type="url"
                placeholder="https://www.example.com/product/..."
                className="input-base flex-1"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
              />
              <Button 
                onClick={handleUrlImport} 
                loading={isImporting}
                disabled={!urlInput.trim()}
              >
                Import
              </Button>
            </div>

            {/* Supported Sites */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Supported Sites</h4>
              <div className="flex flex-wrap gap-2">
                {supportedSites.map(site => (
                  <span 
                    key={site}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                  >
                    {site}
                  </span>
                ))}
              </div>
            </div>

            {/* Example URLs */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Example URLs</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• https://www.zara.com/us/en/basic-t-shirt-p12345.html</div>
                <div>• https://www2.hm.com/en_us/productpage.0912345.html</div>
                <div>• https://www.uniqlo.com/us/en/products/E12345-000</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recently Added Items */}
      {addedItems.length > 0 && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recently Added ({addedItems.length})
              </h3>
              <Link href="/wardrobe">
                <Button variant="outline">View All Items</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {addedItems.slice(-8).map((item, index) => (
                <div key={item.id} className="space-y-2">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {item.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Next Steps */}
      {addedItems.length > 0 && (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ready to Get Styled? 
          </h3>
          <p className="text-gray-600">
            You've added {addedItems.length} items to your wardrobe. Let's create some outfits!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/style">
              <Button size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Get AI Styling
              </Button>
            </Link>
            <Link href="/wardrobe">
              <Button variant="outline" size="lg">
                View My Wardrobe
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Empty state message */}
      {addedItems.length === 0 && uploadProgress.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            Start by {activeMethod === 'upload' ? 'uploading photos' : 'importing URLs'} of your clothing items
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItemsPage;