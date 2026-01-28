I will address the issues on GitHub Pages and Vercel by ensuring environment variables are passed correctly and unifying the build output configuration.

### 1. Fix GitHub Pages "Client-side exception"
The error is caused by missing Supabase environment variables in the GitHub Actions build. Even though these variables are for the client, Next.js requires them at build time to embed them into the static JavaScript bundle.
- **Action**: Update `.github/workflows/static.yml` to pass `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from GitHub Secrets to the build process.

### 2. Fix Vercel 404 Errors
The 404 errors on Vercel are likely due to the application running in "Server" mode (default) where it cannot access the local filesystem (`src/content/albums`) to retrieve album data.
- **Action**: Update `next.config.mjs` to use `output: 'export'` for **all production builds** (both GitHub Pages and Vercel). This forces the site to pre-render all pages at build time, bypassing the runtime filesystem limitations.

### 3. User Action Required
- **GitHub Secrets**: You must ensure that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are added to your GitHub Repository Secrets (Settings -> Secrets and variables -> Actions).
- **Vercel Env Vars**: Ensure these variables are also set in your Vercel Project Settings if not already present.

This approach unifies the deployment strategy: the site will always be a static export in production, ensuring consistency between local testing, GitHub Pages, and Vercel.