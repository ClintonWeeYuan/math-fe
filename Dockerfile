# Node 22, not 18: vite, vitest and react-router all require Node 20 or
# newer, and the image is where that gets decided. Building on 18 fails here
# while passing on a developer's own machine, so the site keeps serving the
# previous bundle and the deploy is the only thing that tells you.
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package.json pnpm-lock.yaml ./

# Pinned, not `npm install -g pnpm`. Unpinned, the build silently picks up
# whatever pnpm is newest on the day it runs: pnpm 11 turned "ignored build
# scripts" into a hard error and every deploy failed on an unchanged
# lockfile, while local installs on pnpm 10 stayed green. Production kept
# serving the last good bundle, so nothing announced it.
RUN npm install -g pnpm@10.28.1

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Vite inlines VITE_* into the bundle at build time, and the build happens
# here, inside the image. Railway passes service variables to the Docker
# build, but only an ARG declared in this file can receive one — without
# these two lines the variable is set in Railway, absent from the build, and
# the Google button silently never appears.
#
# That is not a hypothetical: adding Microsoft sign-in set the variable in
# Railway, redeployed, and produced a bundle with no Microsoft button in it,
# because these lines were not added alongside. src/lib/buildTimeEnv.test.ts
# now fails when a VITE_ variable the source reads has no ARG here, so the
# next one is caught in CI rather than in production.
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

ARG VITE_MICROSOFT_CLIENT_ID
ENV VITE_MICROSOFT_CLIENT_ID=$VITE_MICROSOFT_CLIENT_ID

# Optional; both apps default to 'common' when it is unset.
ARG VITE_MICROSOFT_TENANT
ENV VITE_MICROSOFT_TENANT=$VITE_MICROSOFT_TENANT

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Whether the Season Pass can be bought. Absent (the default) the
# paid papers say "coming soon" rather than offering a checkout that
# the backend may not be configured to serve. Set to the string
# "true" — and only once the Stripe keys are set on the backend.
ARG VITE_BILLING_LIVE
ENV VITE_BILLING_LIVE=$VITE_BILLING_LIVE

# Build the app
RUN pnpm run build

# Pinned for the same reason — this one serves the site, so a surprise major
# version lands in production rather than in the build log.
RUN npm install -g serve@14.2.4

# Expose port 3000
EXPOSE 3000

# Start the application
# NOT `serve -s`: the -s flag rewrites every request to the root index.html,
# which would bypass the prerendered per-route pages. Without it, serve
# resolves real files first and falls back to the SPA shell via the rewrites
# in dist/serve.json (see src/lib/serveJsonCoverage.test.ts).
CMD ["serve", "dist", "-l", "3000"]
