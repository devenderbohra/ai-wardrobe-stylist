# UI/UX Design Guidelines

## Design Philosophy
Create a modern, intuitive, and visually appealing wardrobe stylist app that feels professional yet approachable. Focus on making AI-powered styling feel magical and effortless.

## Visual Identity

### Color Palette
```css
/* Primary Colors */
--primary-50: #faf5ff
--primary-500: #8b5cf6  /* Main brand purple */
--primary-600: #7c3aed
--primary-900: #581c87

/* Secondary Colors */
--rose-500: #f43f5e    /* Accent for fashion/styling */
--gray-50: #f9fafb     /* Light backgrounds */
--gray-100: #f3f4f6    /* Card backgrounds */
--gray-500: #6b7280    /* Text secondary */
--gray-900: #111827    /* Text primary */

/* Status Colors */
--green-500: #10b981   /* Success */
--red-500: #ef4444     /* Error */
--amber-500: #f59e0b   /* Warning */
```

### Typography
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Text Hierarchy */
.text-display: font-size: 2.25rem; font-weight: 700; /* Page titles */
.text-heading: font-size: 1.5rem; font-weight: 600;   /* Section headings */
.text-body: font-size: 1rem; font-weight: 400;        /* Body text */
.text-caption: font-size: 0.875rem; font-weight: 500;  /* Labels, captions */
```

## Layout & Spacing

### Grid System
- Use CSS Grid and Flexbox for layouts
- 8px base spacing unit (multiples: 8, 16, 24, 32, 48, 64px)
- Maximum content width: 1200px
- Mobile breakpoints: 640px, 768px, 1024px, 1280px

### Component Sizing
```css
/* Button Heights */
--btn-sm: 32px
--btn-md: 40px
--btn-lg: 48px

/* Card Padding */
--card-padding: 24px
--card-padding-sm: 16px

/* Border Radius */
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

## Key UI Components

### 1. Navigation
- Clean top navigation with logo, main menu, and user profile
- Mobile: Hamburger menu with slide-out drawer
- Sticky navigation on scroll
- Active state indicators

### 2. Photo Upload Areas
- Large drag-and-drop zones with dotted borders
- Clear visual feedback during upload
- Image preview with crop/rotate controls
- Progress indicators for processing
- Error states with helpful messaging

### 3. Clothing Catalog Grid
- Masonry or grid layout with hover effects
- Category filters as pill buttons
- Search bar with autocomplete
- Quick action buttons (edit, delete, favorite)
- Loading skeletons for new items

### 4. Outfit Generation Interface
- Split-screen: clothing selection on left, outfit preview on right
- Occasion selector as prominent pill buttons
- "Generate Outfit" as primary CTA button
- Real-time preview updates
- Loading states with style-appropriate animations

### 5. Results Display
- Large outfit preview with zoom capability
- Before/after comparison slider
- Quick swap buttons for each clothing category
- Save/favorite/share actions
- Outfit details and styling tips

## User Flow Design

### 1. Onboarding Flow
```
Welcome Screen → Photo Upload Guide → Profile Setup → Success State
```
- Progressive disclosure of features
- Clear step indicators (1 of 3, 2 of 3, etc.)
- Skip options for non-essential steps
- Celebratory micro-interactions on completion

### 2. Main Styling Flow
```
Wardrobe View → Occasion Selection → Outfit Generation → Results & Actions
```
- Breadcrumb navigation
- Quick restart options
- Undo/redo capabilities
- Persistent outfit preview

### 3. Clothing Management Flow
```
Add Item → Upload/URL Input → Auto-categorization → Review & Save
```
- Smart defaults based on image analysis
- Bulk upload options
- Drag-and-drop organization
- Quick edit modals

## Responsive Design Patterns

### Mobile-First Approach
- Stack layouts vertically on mobile
- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for navigation
- Optimized image sizes for mobile data

### Tablet Adaptations
- Two-column layouts where appropriate
- Larger touch targets
- Side navigation panels
- Optimized for both portrait and landscape

### Desktop Enhancements
- Multi-column layouts
- Hover states and tooltips
- Keyboard shortcuts
- Advanced features in expanded sidebars

## Animation & Interactions

### Micro-Interactions
```css
/* Smooth transitions */
.transition-smooth { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

/* Hover effects */
.hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }

/* Loading animations */
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
```

### Page Transitions
- Smooth fade-ins for new content
- Slide transitions for multi-step flows
- Loading states that feel instant
- Error states with recovery options

### AI Generation Feedback
- Progress bars for outfit generation
- Subtle animations during processing
- Success celebrations with confetti/sparkles
- Before/after reveal animations

## Accessibility Guidelines

### Color & Contrast
- WCAG 2.1 AA compliance (4.5:1 contrast ratio minimum)
- Color-blind friendly palette
- High contrast mode support
- Focus indicators visible and clear

### Keyboard Navigation
- Tab order follows visual flow
- All interactive elements keyboard accessible
- Escape key closes modals/dropdowns
- Arrow keys for grid navigation

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex interactions
- Alt text for all images
- Screen reader announcements for state changes

## Component Library Structure

### Base Components
```typescript
// Button variations
<Button variant="primary" size="md" loading={false}>Generate Outfit</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost" size="lg">Upload Photo</Button>

// Input components
<ImageUpload onUpload={handleUpload} accept="image/*" maxSize="10MB" />
<Select options={occasions} placeholder="Select occasion" />
<SearchInput onSearch={handleSearch} placeholder="Search clothing..." />

// Layout components
<Card padding="lg" shadow="md">Content</Card>
<Modal size="lg" onClose={handleClose}>Modal Content</Modal>
<Grid cols={3} gap="md">Grid Items</Grid>
```

### Specialized Components
```typescript
// Wardrobe-specific components
<OutfitPreview outfit={outfit} onItemSwap={handleSwap} />
<ClothingGrid items={clothingItems} onSelect={handleSelect} />
<OccasionSelector occasions={occasions} selected={selected} />
<StyleProgress currentStep={2} totalSteps={4} />
```

## Performance Considerations

### Image Optimization
- WebP format with JPEG fallbacks
- Responsive image sizes for different viewports
- Lazy loading for clothing catalogs
- Image compression before upload

### Loading States
- Skeleton screens for content loading
- Progressive image loading
- Optimistic UI updates where possible
- Clear loading indicators with estimated times

### Error Handling
- Graceful degradation for API failures
- Clear error messages with recovery actions
- Retry mechanisms for failed operations
- Offline state handling

## Brand Elements

### Logo & Branding
- Clean, modern logo with fashion-forward styling
- Consistent brand voice: friendly, confident, stylish
- Photography style: bright, clean, aspirational
- Icon style: rounded, friendly, consistent line weights

### Messaging Tone
- Encouraging and supportive
- Fashion-forward but not intimidating
- Celebratory of personal style
- Inclusive and body-positive

## Testing Checklist

### Visual Testing
- [ ] All components render correctly across browsers
- [ ] Responsive design works on all device sizes
- [ ] Color contrast meets accessibility standards
- [ ] Typography scales appropriately
- [ ] Images load and display properly

### Interaction Testing
- [ ] All buttons and links work correctly
- [ ] Form submissions handle success/error states
- [ ] Drag and drop functionality works smoothly
- [ ] Loading states provide appropriate feedback
- [ ] Keyboard navigation works throughout app

### Performance Testing
- [ ] Page load times under 3 seconds
- [ ] Image optimization reduces load times
- [ ] API responses handle gracefully
- [ ] Mobile experience is smooth and responsive
- [ ] App works offline where appropriate