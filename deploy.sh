#!/bin/bash

# Go to project root
cd /var/www/corex-retail

# Install backend dependencies
cd corex-retail-backend
npm install
 
# Install frontend dependencies and build
cd ../corex-retail-frontend
npm install
npm run build

# Start or restart the applications
cd ..
pm2 start ecosystem.config.js || pm2 reload ecosystem.config.js