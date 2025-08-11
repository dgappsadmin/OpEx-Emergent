#!/bin/bash

# Script to update supervisor configuration from local config file
# Run this after making changes to /app/config/supervisord.conf

echo "Updating supervisor configuration..."

# Copy local config to system location
sudo cp /app/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Reload supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

echo "Supervisor configuration updated successfully!"
echo "Current status:"
sudo supervisorctl status