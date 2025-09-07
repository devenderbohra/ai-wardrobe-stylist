# Gemini 2.5 Flash Image API Integration Guide

## API Overview
Gemini 2.5 Flash Image (aka "Nano Banana") is Google's state-of-the-art image generation model with advanced capabilities for image editing, fusion, and style transformation.

## API Access Details
- **Base URL**: `https://generativelanguage.googleapis.com/v1beta`
- **Model**: `gemini-2.5-flash-image-preview`
- **Rate Limits**: 20 images per minute, 200 requests per project per day (free tier)
- **Authentication**: API key required

## Core Capabilities for Our Project

### 1. Image Fusion & Editing
Perfect for blending user photos with clothing items:
```
"Take the face from image 1 and blend it with the clothing from image 2, maintaining realistic lighting and proportions"
```

### 2. Multi-Image Composition
Combine multiple clothing items into single outfit:
```
"Combine the top from image 1, pants from image 2, and shoes from image 3 on the person from image 4"
```

### 3. Context-Aware Styling
Generate appropriate backgrounds and settings:
```
"Place this outfit in a professional office setting with appropriate lighting for a business meeting"
```

## Prompt Engineering Best Practices

### Effective Prompts for Wardrobe Styling

#### Basic Outfit Combination
```
"Create a realistic image of the person from [user_photo] wearing the [clothing_type] from [clothing_image]. Maintain natural lighting, proper fit, and realistic proportions. The setting should be [occasion_appropriate_background]."
```

#### Multi-Item Styling
```
"Style the person from [user_photo] with: the top from [top_image], the pants from [pants_image], and the shoes from [shoes_image]. Ensure all items fit naturally together with consistent lighting and style. Background: [occasion_setting]."
```

#### Occasion-Specific Styling
```
"Transform the person from [user_photo] into a [occasion] look using [clothing_items]. The styling should be appropriate for [specific_context] with [lighting/mood] that matches the occasion."
```

### Prompt Parameters to Include
- **Lighting**: "natural lighting", "studio lighting", "golden hour"
- **Fit**: "well-fitted", "relaxed fit", "tailored"
- **Style**: "professional", "casual", "elegant", "trendy"
- **Background**: "office setting", "casual outdoor", "elegant restaurant"
- **Quality**: "high resolution", "detailed", "photorealistic"

## API Implementation

### Request Structure
```javascript
const generateOutfit = async (userPhoto, clothingItems, occasion, prompt) => {
  const response = await fetch(`${API_BASE_URL}/models/${MODEL_NAME}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: userPhoto } },
          ...clothingItems.map(item => ({
            inline_data: { mime_type: "image/jpeg", data: item }
          }))
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    })
  });
  
  return response.json();
};
```

### Error Handling
```javascript
const handleAPIError = (error) => {
  switch (error.code) {
    case 429:
      return "Rate limit exceeded. Please try again in a few minutes.";
    case 400:
      return "Invalid image format. Please use JPEG or PNG.";
    case 413:
      return "Image too large. Please use images under 10MB.";
    default:
      return "Something went wrong. Please try again.";
  }
};
```

## Optimization Strategies

### 1. Image Preprocessing
```javascript
const preprocessImage = async (imageFile) => {
  // Resize to optimal dimensions (max 1024x1024)
  // Compress to reduce API payload size
  // Convert to base64 for API submission
  // Validate format and size
};
```

### 2. Caching Strategy
```javascript
const cacheKey = `${userId}_${clothingHash}_${occasion}`;
const cachedResult = await cache.get(cacheKey);
if (cachedResult) {
  return cachedResult;
}
// Generate new image and cache result
```

### 3. Request Queuing
```javascript
const requestQueue = [];
const processQueue = async () => {
  if (requestQueue.length > 0 && !rateLimitExceeded) {
    const request = requestQueue.shift();
    await processImageGeneration(request);
  }
};
```

## Specific Use Cases

### 1. Initial Profile Setup
```javascript
const testUserPhoto = async (userPhoto) => {
  const prompt = "Analyze this photo for styling compatibility. Is the lighting good? Is the person clearly visible? Suggest any improvements needed for outfit visualization.";
  // Use this to validate user photos before storing
};
```

### 2. Clothing Item Processing
```javascript
const extractClothingFeatures = async (clothingImage) => {
  const prompt = "Describe this clothing item: type, color, style, formality level, and season appropriateness.";
  // Use for auto-categorization and metadata extraction
};
```

### 3. Outfit Generation
```javascript
const generateOutfitVisualization = async (userPhoto, selectedItems, occasion) => {
  const occasionPrompts = {
    work: "professional office setting with business appropriate styling",
    casual: "relaxed everyday setting with comfortable, stylish look",
    date: "romantic restaurant setting with elegant, attractive styling",
    party: "social gathering with trendy, eye-catching outfit"
  };
  
  const prompt = `Style the person wearing: ${selectedItems.map(item => item.description).join(', ')}. Setting: ${occasionPrompts[occasion]}. Ensure realistic fit and lighting.`;
  
  return await generateOutfit(userPhoto, selectedItems.map(i => i.image), occasion, prompt);
};
```

## Environment Variables
```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
MODEL_NAME=gemini-2.5-flash-image-preview
```

## Rate Limiting & Monitoring
```javascript
let requestCount = 0;
let lastResetTime = Date.now();

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastResetTime > 60000) { // Reset every minute
    requestCount = 0;
    lastResetTime = now;
  }
  
  return requestCount < 20; // 20 requests per minute limit
};
```

## Testing Strategy
1. Test with various photo qualities and lighting conditions
2. Verify clothing item fusion accuracy across different categories
3. Validate occasion-appropriate styling suggestions
4. Test API error handling and fallback scenarios
5. Performance test with concurrent requests