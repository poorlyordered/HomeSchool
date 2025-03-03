# HomeSchool Project

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher recommended)
- A Supabase account with a project set up

### Environment Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
2. Make sure these values match your Supabase project settings.

### Installation

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```
3. The application should be available at `http://localhost:5173/`

### Troubleshooting Local Development

#### Application Not Loading

- Check browser console for errors
- Verify that your `.env` file exists and contains the correct Supabase credentials
- Try clearing browser cache and local storage
- Ensure you're using a compatible Node.js version (v18+)
- Try running with the `--force` flag: `npm install --force`

#### Database Connection Issues

- Verify your Supabase project is active
- Check that your anon key has the necessary permissions
- Ensure your IP is not blocked by Supabase
- Try creating a new API key if issues persist

#### Infinite Loading States

- Check browser console for errors
- Verify network requests in the Network tab
- Clear browser cache and local storage
- Try a different browser

## Deployment

This project is set up for automatic deployment to Netlify:

1. Connect your GitHub repository to Netlify
2. Netlify will automatically build and deploy from the `master` branch
3. Build settings are configured in `netlify.toml`

### Environment Variables

Add the following environment variables in Netlify:

- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_SUPABASE_URL`: Supabase project URL

### Build Configuration

- Build Command: `npm run build`
- Publish Directory: `dist`
- Node Version: 20

### Production Build

To create a production build locally:

```
npm run build
```

The build output will be in the `dist` directory, which can be served by any static file server.

### Preview Production Build

To preview the production build locally:

```
npm run preview
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run test:coverage` - Run Jest tests with coverage report
- `npm run format` - Format code with Prettier
