# Code Documentation Standards

## Overview
This document defines the documentation standards for the AI Wardrobe Stylist project. Every code file should be accompanied by clear documentation that explains functionality, usage, and implementation details.

## Documentation Structure

### 1. File-Level Documentation
Every code file should start with a markdown comment or separate `.md` file explaining:

```typescript
/**
 * # Component Name: OutfitGenerator
 * 
 * ## Purpose
 * Generates AI-styled outfit visualizations by combining user photos with clothing items using the Gemini 2.5 Flash Image API.
 * 
 * ## Key Features
 * - Multi-item outfit composition
 * - Occasion-based styling recommendations
 * - Real-time preview generation
 * - Error handling and loading states
 * 
 * ## Dependencies
 * - Gemini 2.5 Flash Image API
 * - React hooks for state management
 * - Custom image processing utilities
 * 
 * ## Usage Example
 * ```tsx
 * <OutfitGenerator 
 *   userPhoto={userPhoto}
 *   clothingItems={selectedItems}
 *   occasion="work"
 *   onOutfitGenerated={handleResult}
 * />
 * ```
 */
```

### 2. Function Documentation
Each function should include JSDoc comments:

```typescript
/**
 * Generates an outfit visualization using Gemini API
 * 
 * @param userPhoto - Base64 encoded user photo
 * @param clothingItems - Array of clothing item objects
 * @param occasion - Target occasion for styling ('work', 'casual', 'date', 'party')
 * @param options - Additional styling options
 * @returns Promise resolving to generated outfit image and metadata
 * 
 * @example
 * ```typescript
 * const outfit = await generateOutfitVisualization(
 *   userData.headshot,
 *   [selectedTop, selectedPants],
 *   'work',
 *   { background: 'office' }
 * );
 * ```
 */
async function generateOutfitVisualization(
  userPhoto: string,
  clothingItems: ClothingItem[],
  occasion: Occasion,
  options?: StyleOptions
): Promise<GeneratedOutfit> {
  // Implementation...
}
```

### 3. Component Documentation Pattern
For React components, follow this structure:

```typescript
// README_ComponentName.md should exist alongside ComponentName.tsx

/**
 * # Component: OutfitPreview
 * 
 * ## Description
 * Displays generated outfit visualizations with interactive controls for customization.
 * 
 * ## Props
 * | Prop | Type | Required | Description |
 * |------|------|----------|-------------|
 * | outfit | GeneratedOutfit | Yes | The outfit data to display |
 * | onItemSwap | Function | No | Callback when user swaps clothing items |
 * | loading | boolean | No | Shows loading state |
 * 
 * ## State Management
 * - Local state for UI interactions (zoom, item selection)
 * - Context state for outfit data
 * - API state for regeneration requests
 * 
 * ## Key Interactions
 * - Click item to swap with alternatives
 * - Pinch/zoom for detailed view
 * - Save/share outfit options
 */
```

### 4. API Documentation
For API endpoints and services:

```typescript
/**
 * # Gemini API Service
 * 
 * ## Overview
 * Handles all interactions with Google's Gemini 2.5 Flash Image API for outfit generation.
 * 
 * ## Rate Limits
 * - 20 requests per minute
 * - 200 requests per day (free tier)
 * - Automatic rate limiting and queue management
 * 
 * ## Error Handling
 * - Retry logic for temporary failures
 * - Graceful degradation for rate limit exceeded
 * - Clear error messages for user-facing issues
 * 
 * ## Caching Strategy
 * - Cache successful generations for 1 hour
 * - Key format: `user_${userId}_items_${itemHash}_occasion_${occasion}`
 * - Automatic cache invalidation for user preference changes
 */
```

## Markdown File Organization

### Project Structure with Documentation
```
/src
  /components
    /ui
      Button.tsx
      Button.md                 ← Component documentation
    /forms
      UserPhotoUpload.tsx
      UserPhotoUpload.md        ← Component documentation
    /outfit
      OutfitGenerator.tsx
      OutfitGenerator.md        ← Component documentation
  /lib
    gemini-service.ts
    gemini-service.md           ← Service documentation
  /utils
    image-utils.ts
    image-utils.md              ← Utility documentation
  /docs
    SETUP.md                    ← Project setup instructions
    DEPLOYMENT.md               ← Deployment guide
    TROUBLESHOOTING.md          ← Common issues and solutions
```

## Code Comment Standards

### 1. Inline Comments
```typescript
// GEMINI API: Construct prompt for outfit generation
const prompt = buildOutfitPrompt(userPhoto, clothingItems, occasion);

// RATE LIMITING: Check if we can make another API request
if (!await checkRateLimit()) {
  return handleRateLimitExceeded();
}

// ERROR HANDLING: Retry failed requests up to 3 times
const result = await retryApiCall(generateImage, prompt, 3);
```

### 2. Complex Logic Explanation
```typescript
/**
 * ALGORITHM: Outfit Compatibility Scoring
 * 
 * This function scores clothing item combinations based on:
 * 1. Color harmony (complementary vs. clashing colors)
 * 2. Style consistency (formal items with formal items)
 * 3. Seasonal appropriateness (weather-based filtering)
 * 4. User preference history (machine learning component)
 * 
 * Score ranges from 0-100, where >80 is excellent compatibility
 */
function calculateOutfitCompatibility(items: ClothingItem[]): number {
  // Implementation with detailed inline comments...
}
```

### 3. Performance Considerations
```typescript
// PERFORMANCE: Use React.memo to prevent unnecessary re-renders
const OutfitPreview = React.memo(({ outfit, onItemSwap }) => {
  // OPTIMIZATION: Debounce item swap calls to prevent API spam
  const debouncedSwap = useMemo(
    () => debounce(onItemSwap, 500),
    [onItemSwap]
  );
  
  // MEMORY: Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      // Cleanup logic...
    };
  }, []);
});
```

## Documentation for Different File Types

### 1. Configuration Files
```yaml
# .env.example documentation
# Gemini 2.5 Flash Image API Configuration
GEMINI_API_KEY=your_api_key_here              # Get from Google AI Studio
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-2.5-flash-image-preview   # Nano Banana model

# Database Configuration
DATABASE_URL=your_database_url_here            # PostgreSQL connection string

# File Upload Configuration  
MAX_FILE_SIZE=10485760                         # 10MB limit for image uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png        # Supported image formats
```

### 2. Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",           // Start development server
    "build": "next build",       // Build for production
    "start": "next start",       // Start production server
    "lint": "next lint",         // Run ESLint checks
    "type-check": "tsc --noEmit", // TypeScript type checking
    "test": "jest",              // Run test suite
    "docs": "typedoc"            // Generate API documentation
  }
}
```

## README Template for Each Major Component

### Component README Structure
```markdown
# ComponentName

## Quick Start
Brief 1-2 sentence description and basic usage example.

## Installation & Setup
Any special setup requirements or dependencies.

## API Reference
Detailed props/parameters with types and examples.

## Examples
Multiple usage examples showing different scenarios.

## Customization
How to customize appearance, behavior, or extend functionality.

## Troubleshooting
Common issues and solutions.

## Related Components
Links to related components or utilities.
```

## Kaggle-Specific Documentation

### 1. Kaggle Submission Format
```markdown
# Kaggle Submission Documentation

## Project Structure for Kaggle
- All documentation should be in `/docs` folder
- Main README.md in root directory
- Code should be organized in `/src` with clear module separation
- Include requirements.txt or package.json for dependencies

## Demo Data
- Include sample images in `/demo-data` folder
- Provide example API responses in `/examples`
- Document test cases in `/tests`
```

### 2. Deployment Documentation
Every major feature should include deployment notes:
```markdown
## Deployment Notes
- Environment variables required
- External dependencies (APIs, services)
- Performance considerations
- Fallback strategies for production
```

## VS Code Integration

### 1. Workspace Settings
Create `.vscode/settings.json` with documentation preferences:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.addMissingImports": true
  },
  "files.associations": {
    "*.md": "markdown"
  }
}
```

### 2. Recommended Extensions Documentation
Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "yzhang.markdown-all-in-one"
  ]
}
```

## Quality Checklist

Before pushing any code, ensure:
- [ ] Every function has JSDoc comments
- [ ] Complex components have separate .md files
- [ ] API integrations are documented with examples
- [ ] Error handling is explained
- [ ] Performance considerations are noted
- [ ] Deployment requirements are listed
- [ ] Examples work and are up-to-date

This documentation standard ensures Claude Code will generate well-documented, maintainable code that's ready for Kaggle submission and easy for judges to understand.