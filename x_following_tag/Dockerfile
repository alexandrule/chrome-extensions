FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source and test files
COPY manifest.json content.js ./
COPY icons/ ./icons/
COPY tests/ ./tests/
COPY scripts/ ./scripts/
COPY jest.config.js ./

# Run tests by default
CMD ["npm", "test"]
