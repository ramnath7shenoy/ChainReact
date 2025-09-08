# Use the full official Node.js 18 image for maximum compatibility.
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# The command to start the Next.js production server
CMD ["npm", "start"]