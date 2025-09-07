# Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Git installed
- VS Code or preferred editor

## Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser

## Adding Source Files

The core TypeScript/React files need to be added to their respective directories:
- Components go in `/src/components`
- API routes go in `/src/pages/api`
- Utilities go in `/src/utils`
- Types go in `/src/types`

## Deployment

For Vercel deployment:
```bash
npm run build
vercel
```

## Troubleshooting

- If you get module not found errors, ensure all dependencies are installed
- For API errors, check that your Gemini API key is correctly set
- For build errors, run `npm run type-check` to identify TypeScript issues
