# HomeSchool Project

## Deployment

This project is set up for automatic deployment to Netlify:

1. Connect your GitHub repository to Netlify
2. Netlify will automatically build and deploy from the `master` branch
3. Build settings are configured in `netlify.toml`

### Build Configuration
- Build Command: `npm run build`
- Publish Directory: `dist`
- Node Version: 20

### Local Development
- Run `npm install` to install dependencies
- Use `npm run dev` for local development
- Use `npm run build` to create a production build
