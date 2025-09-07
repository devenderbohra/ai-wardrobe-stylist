/**
 * Gemini 2.5 Flash Image API integration service
 * For generating AI-powered outfit visualizations
 */

import { GeminiImageRequest, GeminiImageResponse, Occasion } from '@/src/types';

// Gemini API configuration
const GEMINI_API_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-image-preview';

// Rate limiting tracking
let requestCount = 0;
let lastResetTime = Date.now();

/**
 * Check if we're within rate limits
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Reset count every minute
  if (now - lastResetTime > 60000) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  // 20 requests per minute limit
  return requestCount < 20;
}

/**
 * Generate occasion-appropriate styling prompts
 */
function generatePrompt(occasion: Occasion, itemCount: number): string {
  const occasionPrompts = {
    work: "professional office setting with business appropriate styling, clean and polished look",
    casual: "relaxed everyday setting with comfortable, stylish look, natural and effortless",
    date: "romantic restaurant setting with elegant, attractive styling, sophisticated and charming",
    formal: "upscale event setting with refined, elegant styling, classic and distinguished", 
    party: "social gathering with trendy, eye-catching outfit, fun and fashionable"
  };

  const basePrompt = `Create a realistic, high-quality image of the person from the user photo wearing the ${itemCount === 1 ? 'clothing item' : 'clothing items'} provided. `;
  
  const stylePrompt = `The styling should be appropriate for ${occasion} - ${occasionPrompts[occasion]}. `;
  
  const qualityPrompt = `Ensure natural lighting, proper fit, realistic proportions, and seamless blending. The result should look photorealistic with professional quality. Maintain the person's facial features and body proportions accurately.`;
  
  return basePrompt + stylePrompt + qualityPrompt;
}

/**
 * Generate styled outfit image using Gemini API
 */
export async function generateOutfitImage(request: GeminiImageRequest): Promise<GeminiImageResponse> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  if (!checkRateLimit()) {
    return {
      success: false,
      error: 'Rate limit exceeded. Please try again in a few minutes.'
    };
  }

  const startTime = Date.now();

  try {
    requestCount++;

    // Construct the API request
    const apiPayload = {
      contents: [{
        parts: [
          { text: request.prompt || generatePrompt(request.occasion, request.clothingItems.length) },
          { 
            inline_data: { 
              mime_type: "image/jpeg", 
              data: request.userPhoto 
            } 
          },
          ...request.clothingItems.map(item => ({
            inline_data: { 
              mime_type: "image/jpeg", 
              data: item 
            }
          }))
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };

    const response = await fetch(`${GEMINI_API_BASE_URL}/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiPayload)
    });

    const data = await response.json();
    const generationTime = Date.now() - startTime;

    if (!response.ok) {
      console.error('Gemini API error:', data);
      
      // Handle specific error cases
      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a few minutes.',
          generationTime
        };
      }
      
      if (response.status === 400) {
        return {
          success: false,
          error: 'Invalid image format. Please use high-quality JPEG or PNG images.',
          generationTime
        };
      }
      
      if (response.status === 413) {
        return {
          success: false,
          error: 'Image too large. Please use images under 10MB.',
          generationTime
        };
      }

      return {
        success: false,
        error: data.error?.message || 'Failed to generate outfit image',
        generationTime
      };
    }

    // Extract generated image from response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content;
      
      // Handle different response formats
      let imageData = null;
      
      if (content.parts && content.parts[0]) {
        if (content.parts[0].inline_data) {
          imageData = content.parts[0].inline_data.data;
        } else if (content.parts[0].text && content.parts[0].text.includes('data:image')) {
          // Extract base64 from data URL
          const base64Match = content.parts[0].text.match(/data:image\/[^;]+;base64,([^"]+)/);
          if (base64Match) {
            imageData = base64Match[1];
          }
        }
      }

      if (imageData) {
        // Convert base64 to data URL for frontend usage
        const imageUrl = `data:image/jpeg;base64,${imageData}`;
        
        return {
          success: true,
          imageUrl,
          generationTime
        };
      }
    }

    console.error('Unexpected API response format:', data);
    return {
      success: false,
      error: 'Unexpected response format from image generation service',
      generationTime
    };

  } catch (error: any) {
    const generationTime = Date.now() - startTime;
    console.error('Gemini API request error:', error);
    
    return {
      success: false,
      error: error.message || 'Network error occurred while generating image',
      generationTime
    };
  }
}

/**
 * Analyze clothing item using Gemini Vision
 */
export async function analyzeClothingImage(imageBase64: string): Promise<{
  success: boolean;
  analysis?: {
    category: string;
    colors: string[];
    style: string;
    description: string;
    confidence: number;
  };
  error?: string;
}> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  if (!checkRateLimit()) {
    return {
      success: false,
      error: 'Rate limit exceeded. Please try again in a few minutes.'
    };
  }

  try {
    requestCount++;

    const prompt = `Analyze this clothing item and provide the following information in JSON format:
    {
      "category": "tops|bottoms|dresses|outerwear|shoes|accessories",
      "type": "specific type like t-shirt, jeans, dress, etc.",
      "colors": ["primary color", "secondary color if any"],
      "style": "casual|business|elegant|sporty|trendy",
      "description": "detailed description of the item",
      "confidence": 0.9
    }
    
    Focus on accurate categorization and color identification.`;

    const apiPayload = {
      contents: [{
        parts: [
          { text: prompt },
          { 
            inline_data: { 
              mime_type: "image/jpeg", 
              data: imageBase64 
            } 
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 16,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`${GEMINI_API_BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini analysis error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to analyze clothing item'
      };
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            analysis
          };
        }
      } catch (parseError) {
        console.error('Failed to parse analysis JSON:', parseError);
      }
    }

    return {
      success: false,
      error: 'Could not analyze the clothing item'
    };

  } catch (error: any) {
    console.error('Clothing analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze clothing item'
    };
  }
}

/**
 * Test user photo quality for styling compatibility
 */
export async function validateUserPhoto(imageBase64: string): Promise<{
  success: boolean;
  isValid?: boolean;
  suggestions?: string[];
  error?: string;
}> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    const prompt = `Analyze this photo for AI outfit styling compatibility. Check:
    1. Is the person clearly visible?
    2. Is the lighting adequate?
    3. Is the photo high quality?
    4. Would this work well for virtual outfit styling?
    
    Respond with JSON:
    {
      "isValid": true/false,
      "suggestions": ["improvement suggestions if needed"],
      "score": 0.8
    }`;

    const apiPayload = {
      contents: [{
        parts: [
          { text: prompt },
          { 
            inline_data: { 
              mime_type: "image/jpeg", 
              data: imageBase64 
            } 
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      }
    };

    const response = await fetch(`${GEMINI_API_BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to validate photo'
      };
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const validation = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            isValid: validation.isValid,
            suggestions: validation.suggestions || []
          };
        }
      } catch (parseError) {
        console.error('Failed to parse validation JSON:', parseError);
      }
    }

    return {
      success: false,
      error: 'Could not validate photo'
    };

  } catch (error: any) {
    console.error('Photo validation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate photo'
    };
  }
}