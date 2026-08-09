# Use Node.js official image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Vite inlines VITE_* into the bundle at build time, and the build happens
# here, inside the image. Railway passes service variables to the Docker
# build, but only an ARG declared in this file can receive one — without
# these two lines the variable is set in Railway, absent from the build, and
# the Google button silently never appears.
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the app
RUN pnpm run build

# Install serve globally
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the application
# NOT `serve -s`: the -s flag rewrites every request to the root index.html,
# which would bypass the prerendered per-route pages. Without it, serve
# resolves real files first and falls back to the SPA shell via the rewrites
# in dist/serve.json (see src/lib/serveJsonCoverage.test.ts).
CMD ["serve", "dist", "-l", "3000"]
