/**
 * Wardrobe page - View and manage clothing items
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import Link from 'next/link';
import { ClothingItem, WardrobeFilters, ClothingCategory } from '@/src/types';
import ClothingGrid from '@/src/components/wardrobe/ClothingGrid';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { cn } from '@/src/utils';

// Mock data for demonstration
const MOCK_WARDROBE_ITEMS: ClothingItem[] = [];

const CATEGORIES: Array<{ value: ClothingCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All Items' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' }
];

const WardrobePage: React.FC = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Filter items based on current filters
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.isFavorite);
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory, showFavoritesOnly]);

  const handleFavoriteToggle = (item: ClothingItem) => {
    setItems(prevItems => 
      prevItems.map(i => 
        i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i
      )
    );
  };

  const handleDelete = (item: ClothingItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      setItems(prevItems => prevItems.filter(i => i.id !== item.id));
    }
  };

  const stats = {
    totalItems: items.length,
    favorites: items.filter(item => item.isFavorite).length,
    mostWorn: items.reduce((max, item) => item.wearCount > max.wearCount ? item : max, items[0]),
    recentlyAdded: items.filter(item => {
      const daysSinceAdded = (Date.now() - item.dateAdded.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceAdded <= 7;
    }).length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-display text-gray-900">My Wardrobe</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your clothing collection
          </p>
        </div>
        
        <Link href="/add">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Items
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </Card>
        
        <Card>
          <div className="text-2xl font-bold text-purple-600">{stats.favorites}</div>
          <div className="text-sm text-gray-600">Favorites</div>
        </Card>
        
        <Card>
          <div className="text-2xl font-bold text-green-600">{stats.recentlyAdded}</div>
          <div className="text-sm text-gray-600">Added This Week</div>
        </Card>
        
        <Card>
          <div className="text-2xl font-bold text-blue-600">
            {stats.mostWorn ? stats.mostWorn.wearCount : 0}
          </div>
          <div className="text-sm text-gray-600">Most Worn</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, brand, or tags..."
              className="input-base pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedCategory(value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  selectedCategory === value
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {label}
                {value !== 'all' && (
                  <span className="ml-1 text-xs opacity-75">
                    ({items.filter(item => item.category === value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Favorites only</span>
              </label>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors duration-200',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors duration-200',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredItems.length} of {items.length} items
            </span>
            
            {(searchQuery || selectedCategory !== 'all' || showFavoritesOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Clothing Grid */}
      <ClothingGrid
        items={filteredItems}
        onFavorite={handleFavoriteToggle}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage={
          searchQuery || selectedCategory !== 'all' || showFavoritesOnly
            ? 'No items match your filters'
            : 'Your wardrobe is empty. Start by adding some clothing items!'
        }
      />

      {/* Quick Actions */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/style">
            <Button size="lg" className="w-full sm:w-auto">
              Style Me Now
            </Button>
          </Link>
          
          <Link href="/add">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Add More Items
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WardrobePage;