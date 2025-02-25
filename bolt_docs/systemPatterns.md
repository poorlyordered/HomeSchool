# System Deployment Patterns

## Continuous Integration/Continuous Deployment (CI/CD)
- Version Control: GitHub
- Hosting Platform: Netlify
- Build Tool: Vite
- Framework: React with TypeScript

## Environment Configuration
- Uses Vite environment variables
- Supabase credentials managed via environment variables
- Supports local and production environments

## Deployment Workflow
1. Push changes to GitHub master branch
2. Netlify automatically detects changes
3. Netlify builds project using `npm run build`
4. Deploys built files to production environment
5. Serves application from `dist` directory

## Key Configuration Files
- `netlify.toml`: Defines build and deployment settings
- `.env`: Stores environment-specific variables
- `README.md`: Provides deployment and setup instructions

## Environment Variable Management
- Supabase credentials stored as Vite-prefixed variables
- Separate variables for development and production
- Sensitive information kept out of version control
