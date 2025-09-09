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
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
      
      // If it's a rate limit error, wait longer
      if (error.status === 429) {
        const delay = error.retryAfter || baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Don't retry non-rate-limit errors
      }
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Generate styled outfit image using Gemini AI
 * Creates a realistic image of the user wearing their selected clothing items
 */
export async function generateOutfitImage(request: GeminiImageRequest): Promise<GeminiImageResponse> {
  const startTime = Date.now();

  try {
    console.log('AI generation request:', {
      userPhoto: request.userPhoto ? 'User photo provided' : 'No user photo',
      clothingItems: request.clothingItems?.length || 0,
      occasion: request.occasion,
      hasGeminiKey: !!GEMINI_API_KEY,
      geminiApiKey: GEMINI_API_KEY ? 'Key present' : 'Key missing',
      geminiBaseUrl: GEMINI_API_BASE_URL,
      modelName: MODEL_NAME
    });

    // Validate API key
    if (!GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        generationTime: Date.now() - startTime
      };
    }

    // If no user photo, return error
    if (!request.userPhoto) {
      console.log('ERROR: No user photo provided');
      return {
        success: false,
        error: 'User photo is required for outfit generation',
        generationTime: Date.now() - startTime
      };
    }

    // Temporarily disable local rate limiting for testing
    console.log('Local rate limiting disabled for testing');
    // if (!checkRateLimit()) {
    //   return {
    //     success: false,
    //     error: 'Rate limit exceeded. Please try again in a few minutes.',
    //     generationTime: Date.now() - startTime
    //   };
    // }

    // requestCount++;

    // Create comprehensive styling prompt
    const itemCount = request.clothingItems?.length || 0;
    const prompt = generatePrompt(request.occasion, itemCount);
    
    const detailedPrompt = `CRITICAL REQUIREMENTS:
1. PRESERVE THE USER'S EXACT FACE: The generated image MUST show the exact same person from the reference photo. Keep their facial features, skin tone, hair, and facial structure identical.

2. SHOW THEIR BODY WEARING THE SELECTED CLOTHING: The person should be wearing ONLY the specific clothing items provided in the additional images. Replace their current clothing with these exact items.

3. FULL BODY VISIBILITY: Show the person from head to toe so the complete outfit is visible. The pose should display how the clothing fits on their body.

SPECIFIC INSTRUCTIONS:
- Keep the person's face, hair, and head exactly as shown in the reference photo
- Replace only their clothing with the provided clothing items
- Show how these clothes look on their specific body type and proportions  
- Use natural lighting that shows both the face clearly and the outfit details
- Create a realistic, professional photo quality result
- The background should be simple and not distract from the person and outfit
- Ensure proper fit and draping of the clothes on their body

The final image should look like a professional photo of the same person wearing their selected outfit.`;

    // Prepare API payload with user photo and clothing items
    const parts = [
      { text: detailedPrompt }
    ];

    // Add user photo
    if (request.userPhoto.startsWith('data:image')) {
      const base64Data = request.userPhoto.split(',')[1];
      console.log('User photo base64 length:', base64Data.length);
      console.log('User photo base64 preview:', base64Data.substring(0, 50) + '...');
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data
        }
      });
    }

    // Add clothing item images
    if (request.clothingItems && request.clothingItems.length > 0) {
      for (const itemUrl of request.clothingItems) {
        if (itemUrl.startsWith('data:image')) {
          const base64Data = itemUrl.split(',')[1];
          parts.push({
            inline_data: {
              mime_type: "image/jpeg", 
              data: base64Data
            }
          });
        }
      }
    }

    const apiPayload = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    };

    console.log('Calling Gemini API for outfit generation...');
    
    // Use retry mechanism for the API call
    const { response, data } = await retryWithBackoff(async () => {
      const response = await fetch(`${GEMINI_API_BASE_URL}/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY || ''
        },
        body: JSON.stringify(apiPayload)
      });

      const data = await response.json();
      console.log('Gemini API response status:', response.status);

      if (!response.ok) {
        console.error('Gemini API error:', data);
        
        // For rate limiting, throw with retry info
        if (response.status === 429) {
          const retryAfter = data.error?.details?.find((detail: any) => 
            detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
          )?.retryDelay;
          
          const retryMs = retryAfter ? 
            parseInt(retryAfter.replace('s', '')) * 1000 : 
            45000; // Default 45 seconds
          
          const error: any = new Error('Rate limit exceeded');
          error.status = 429;
          error.retryAfter = retryMs;
          throw error;
        }
        
        // For other errors, don't retry
        if (response.status === 400 && data.error?.message?.includes('Safety')) {
          const error: any = new Error('Image content was filtered for safety. Please try with different photos.');
          error.status = 400;
          throw error;
        }
        
        const error: any = new Error(data.error?.message || 'Failed to generate styled outfit');
        error.status = response.status;
        throw error;
      }

      return { response, data };
    }, 2, 45000); // Max 2 retries, 45 second base delay

    // Extract generated image from Gemini 2.5 Flash Image response
    console.log('Processing Gemini 2.5 Flash Image response...');
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content;
      
      // Look for inline_data in the response parts
      if (content.parts) {
        for (const part of content.parts) {
          if (part.inline_data && part.inline_data.data) {
            const generatedImageData = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
            console.log('Successfully extracted generated image from Gemini');
            
            return {
              success: true,
              imageUrl: generatedImageData,
              generationTime: Date.now() - startTime
            };
          }
        }
      }
    }
    
    console.warn('No generated image found in Gemini response, falling back to user photo');
    
    return {
      success: true,
      imageUrl: request.userPhoto, // Fallback to user photo if generation fails
      generationTime: Date.now() - startTime
    };

  } catch (error: any) {
    const generationTime = Date.now() - startTime;
    console.error('Outfit generation error:', error);
    
    // Handle specific error types from our retry mechanism
    if (error.status === 429) {
      return {
        success: false,
        error: 'Rate limit exceeded. Our service is experiencing high demand. Please try again in a few minutes.',
        generationTime
      };
    }
    
    if (error.status === 400) {
      return {
        success: false,
        error: error.message || 'Image content was filtered for safety. Please try with different photos.',
        generationTime
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to generate styled outfit',
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