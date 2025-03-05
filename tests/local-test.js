/**
 * Example script to test the SolarWinds Observability API client locally
 * 
 * This script demonstrates how to use the API client with a local .env file
 * for testing purposes.
 * 
 * Usage:
 * 1. Copy .env.example to .env and add your API token
 * 2. Run this script with: node examples/local-test.js
 */

// Import the API client
const { SolarWindsApiClient } = require('../build/api-client.js');
const fs = require('fs');
const path = require('path');

// Load the API token from .env file
function loadEnvToken() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const match = line.match(/^SOLARWINDS_API_TOKEN=(.+)$/);
        if (match) {
          return match[1].trim();
        }
      }
    }
  } catch (error) {
    console.error('Error reading .env file:', error);
  }
  
  return null;
}

// Main function
async function main() {
  try {
    // Get the API token
    const apiToken = loadEnvToken();
    if (!apiToken) {
      console.error('API token not found. Please create a .env file with SOLARWINDS_API_TOKEN=your-token');
      process.exit(1);
    }
    
    // Create the API client
    const apiClient = new SolarWindsApiClient(apiToken);
    
    // Set up search parameters
    const searchParams = {
      filter: 'error', // Search for logs containing "error"
      pageSize: 5,     // Limit to 5 results
      direction: 'backward' // Sort from oldest to newest
    };
    
    console.log('Searching for logs...');
    console.log('Parameters:', searchParams);
    
    // Search for logs
    const response = await apiClient.searchEvents(searchParams);
    
    // Display the results
    console.log(`\nFound ${response.logs.length} logs:`);
    console.log('-----------------------------------');
    
    for (const log of response.logs) {
      console.log(`[${log.time}] ${log.hostname} ${log.program || ''}: ${log.message}`);
    }
    
    console.log('\nPagination info:');
    console.log(response.pageInfo);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
