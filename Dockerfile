FROM node:18-alpine AS build
WORKDIR /app

# use key=value ENV format to avoid legacy warning
ENV PATH=/app/node_modules/.bin:$PATH

# copy package manifests and install dependencies reproducibly
COPY package*.json ./
RUN npm ci --silent

# copy source and build (fail early if build fails)
COPY . .
RUN npm run build

# runtime image (no nginx) - copy whole app to avoid missing-path COPY error
FROM node:18-alpine AS runtime
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH

# copy entire app from build stage (safer than copying a single directory that may not exist)
COPY --from=build /app /app

# install a tiny static server and create a startup script that selects the available build output
RUN npm install -g serve --silent && \
    printf '%s\n' \
    '#!/bin/sh' \
    'if [ -d /app/build ]; then' \
    '  TARGET=/app/build' \
    'elif [ -d /app/dist ]; then' \
    '  TARGET=/app/dist' \
    'elif [ -d /app/out ]; then' \
    '  TARGET=/app/out' \
    'else' \
    '  echo "No build output found in /app/{build,dist,out}" >&2' \
    '  exit 1' \
    'fi' \
    'echo "Serving $TARGET"' \
    'exec serve -s "$TARGET" -l 80' \
    > /usr/local/bin/start.sh && chmod +x /usr/local/bin/start.sh

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]