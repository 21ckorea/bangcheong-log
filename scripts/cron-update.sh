#!/bin/bash

# Configuration
# Log directory matching the requested style
LOG_DIR="/var/log/bangcheong"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/cron-$DATE.log"

# Ensure log directory exists
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
fi

# Load environment variables
# Assuming the script is in /opt/bangcheong/scripts or /opt/bangcheong
# We look for .env.local in the script's directory or parent directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_ROOT/.env.local" ]; then
    set -o allexport
    source "$PROJECT_ROOT/.env.local"
    set +o allexport
elif [ -f "$SCRIPT_DIR/.env.local" ]; then
    set -o allexport
    source "$SCRIPT_DIR/.env.local"
    set +o allexport
fi

# API Settings
API_URL="${BANGCHEONG_URL:-https://bangcheong-log.archion.space}/api/cron/update"
SECRET="${CRON_SECRET:-aa11ede04273c28f8f2c647f6d235617f71fb85ca7d4d1647cca379ad8daa004}"
TIMESTAMP=$(date "+%Y-%m-%dT%H:%M:%S%z")

# Execute and Log
{
    echo "[$TIMESTAMP] Calling Bangcheong-Log cron trigger..."
    
    # Use curl to get both response body and status code
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API_URL" \
      -H "Authorization: Bearer $SECRET" \
      -H "Content-Type: application/json")
    
    # Separate body and status
    http_body=$(echo "$response" | sed -e 's/HTTP_STATUS:.*//g')
    http_status=$(echo "$response" | sed -n 's/.*HTTP_STATUS://p')

    echo "HTTP Status: $http_status"
    echo "$http_body"
    echo "" # Empty line for readability
} >> "$LOG_FILE" 2>&1
