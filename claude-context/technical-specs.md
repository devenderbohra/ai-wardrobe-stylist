# Technical Specifications

## Tech Stack

### Frontend
- **Framework**: React.js with Next.js for SSR and easy deployment
- **Styling**: Tailwind CSS for rapid UI development
- **State Management**: React Context or Redux Toolkit
- **Image Handling**: React Dropzone for file uploads
- **UI Components**: Headless UI or Radix UI for accessibility

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: SQLite for development, PostgreSQL for production
- **File Storage**: Local storage for development, AWS S3 or Cloudinary for production
- **Image Processing**: Sharp.js for basic image operations

### API Integrations
- **Gemini 2.5 Flash Image API**: Core image generation and fusion
- **URL Image Fetching**: Axios for fetching clothing images from e-commerce URLs

### Deployment
- **Frontend**: Vercel or Netlify for easy deployment and preview links
- **Backend**: Railway, Heroku, or Vercel serverless functions
- **Database**: Railway PostgreSQL or Supabase

## Architecture Overview

```
Frontend (React/Next.js)
    ↓
Backend API (Express.js)
    ↓
Gemini 2.5 Flash Image API
    ↓
Generated Styled Images
```

## Key Technical Requirements

### Performance
- Image processing should complete within 10-15 seconds
- Implement loading states and progress indicators
- Cache frequent API responses to reduce latency
- Optimize images for web (WebP format, compression)

### API Rate Limits
- Gemini API: 20 images per minute, 200 requests per project per day
- Implement request queuing and retry logic
- Cache successful generations to avoid redundant API calls
- Provide clear feedback when approaching limits

### Data Models

#### User
```javascript
{
  id: string,
  name: string,
  email: string,
  photos: {
    headshot: string,
    fullBody: string,
    side?: string
  },
  preferences: {
    styles: string[],
    bodyType: string,
    favoriteColors: string[]
  },
  createdAt: Date
}
```

#### ClothingItem
```javascript
{
  id: string,
  userId: string,
  name: string,
  category: string, // 'top', 'bottom', 'dress', 'shoes', 'accessories'
  imageUrl: string,
  colors: string[],
  style: string, // 'casual', 'formal', 'sporty', etc.
  season: string[], // ['spring', 'summer', 'fall', 'winter']
  tags: string[]
}
```

#### Outfit
```javascript
{
  id: string,
  userId: string,
  name: string,
  occasion: string,
  items: ClothingItem[],
  styledImageUrl: string,
  isFavorite: boolean,
  createdAt: Date
}
```

### Security Considerations
- Implement file type validation for uploads
- Add image size limits (max 10MB per image)
- Sanitize user inputs
- Use environment variables for API keys
- Implement basic rate limiting

### Error Handling
- Graceful degradation when API limits are reached
- Clear error messages for users
- Fallback images for failed generations
- Retry logic for temporary API failures