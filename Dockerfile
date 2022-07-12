# Stage 0: install the base dependencies
# Use node version 16.15.1
FROM node:16.15.1@sha256:a13d2d2aec7f0dae18a52ca4d38b592e45a45cc4456ffab82e5ff10d8a53d042 AS dependencies

LABEL maintainer="Moxa Panchal <mjpanchal1@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# We want to install only dependencies and not devDependencies
ENV NODE_ENV=production

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install

#######################################################################

# Stage 1: build the site
# We don't have to download and reinstall our dependencies every time we rebuild the app
FROM node:16.15.1@sha256:a13d2d2aec7f0dae18a52ca4d38b592e45a45cc4456ffab82e5ff10d8a53d042 AS build

WORKDIR /app

#Copy the generated dependencies (node_modules/)
COPY --from=dependencies /app /app

# Copy src to /app/src/
COPY ./src ./src

# Copy the source code
# COPY . .

#######################################################################

# Stage 3: serving the app
FROM nginx:1.22.0-alpine@sha256:0a88a14a264f46562e2d1f318fbf0606bc87e72727528b51613a5e96f483a0f6 AS deploy

WORKDIR /app

COPY --from=build /app /usr/share/nginx/html

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
#CMD npm start

# We run our service on port 8080
EXPOSE 80

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
 CMD curl --fail localhost || exit 1
