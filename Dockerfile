FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start React Native Metro bundler
CMD ["npm", "start"]
