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
    
    // Test different search queries
    const searchQueries = [
      // Try with just "SpinGeneration" to see if we get any results
      'SpinGeneration',
      // Try with partial ID
      'SpinGeneration-19be7485',
      // Try searching for "correlationId" field
      'correlationId',
      // Try searching for "Context" field
      'Context',
      // Try searching for "SpinGeneration" in different fields
      'Context:SpinGeneration',
      'correlationId:SpinGeneration'
    ];
    
    for (const query of searchQueries) {
      console.log(`\n\n========== Testing query: "${query}" ==========`);
      
      // Set up search parameters
      const searchParams = {
        filter: query,
        pageSize: 5,
        direction: 'backward'
      };
      
      console.log('Parameters:', searchParams);
      
      try {
        // Search for logs
        const response = await apiClient.searchEvents(searchParams);
        
        // Display the results
        console.log(`\nFound ${response.logs.length} logs:`);
        
        if (response.logs.length > 0) {
          console.log('-----------------------------------');
          for (const log of response.logs) {
            console.log(`[${log.time}] ${log.hostname} ${log.program || ''}: ${log.message}`);
          }
        }
        
        console.log('\nPagination info:');
        console.log(response.pageInfo);
      } catch (error) {
        console.error(`Error with query "${query}":`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
