#!/bin/bash

# API Key and Base URL
API_KEY="UmenN5KwSgUHCM5nxcsg7eiWMoCKX35a"
BASE_URL="https://api.dune.com/api/v1/query/3597313/results/csv"

# Pagination settings
LIMIT=1000
OFFSET=0

# Output file
OUTPUT_FILE="results.csv"

# Temporary file for checking results
TEMP_FILE="temp_page.csv"

# Ensure output file is empty
> "$OUTPUT_FILE"

# Fetch pages until the last one
while :; do
    # Fetch current page and print status code
    STATUS_CODE=$(curl -w "%{http_code}" -o "$TEMP_FILE" -H "X-Dune-API-Key:$API_KEY" "$BASE_URL?limit=$LIMIT&offset=$OFFSET" -s)
    echo "Status code: $STATUS_CODE"
    
    # Check if the fetched page has less than $LIMIT results, indicating the last page
    ROW_COUNT=$(wc -l < "$TEMP_FILE")
    # Assuming the first row is headers, adjust condition if API includes headers in every response
    if (( ROW_COUNT <= 1 + 1 )); then
        if (( OFFSET == 0 )); then
            # If this is the first request and no data is returned, keep the headers
            cat "$TEMP_FILE" >> "$OUTPUT_FILE"
        fi
        # Exit the loop if this is the last page
        break
    else
        if (( OFFSET == 0 )); then
            # If this is the first page, include headers
            cat "$TEMP_FILE" >> "$OUTPUT_FILE"
        else
            # If not the first page, skip the header row
            tail -n +2 "$TEMP_FILE" >> "$OUTPUT_FILE"
        fi
    fi
    
    # Prepare for the next iteration
    (( OFFSET += LIMIT ))
done

# Clean up
rm "$TEMP_FILE"

echo "All results have been pulled into $OUTPUT_FILE."