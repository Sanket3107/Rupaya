FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port
EXPOSE 3000

# Command to run in development mode
CMD ["npm", "run", "dev"]
