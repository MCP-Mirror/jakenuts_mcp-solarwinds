/**
 * Test script to test searching for IDs in the Context.CorrelationId field
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
    
    // The specific ID we're looking for
    const specificId = '19be7485-c506-4c52-8a03-7122ef130391';
    
    // Test searching for the specific ID
    console.log(`\n\n========== Testing search for ID: "${specificId}" ==========`);
    
    // Set up search parameters - without time constraints
    // We're just searching for the ID directly
    const searchParams = {
      filter: specificId,
      pageSize: 10,
      direction: 'backward'
    };
    
    console.log('Search parameters:', searchParams);
    
    try {
      // Search for logs
      const response = await apiClient.searchEvents(searchParams);
      
      // Display the results
      console.log(`\nFound ${response.logs.length} logs:`);
      
      if (response.logs.length > 0) {
        console.log('-----------------------------------');
        for (const log of response.logs) {
          console.log(`[${log.time}] ${log.hostname} ${log.program || ''}: ${log.message}`);
          
          // Check if the message contains the specific ID
          if (log.message.includes(specificId)) {
            console.log('*** This log contains the specific ID in the message ***');
          }
        }
      }
      
      console.log('\nPagination info:');
      console.log(response.pageInfo);
    } catch (error) {
      console.error(`Error with search:`, error.message);
    }
    
    // Now try with a time range that includes March 3, 2025
    console.log(`\n\n========== Testing search with time range ==========`);
    
    // Set up search parameters with a time range
    const searchParamsWithTime = {
      filter: specificId,
      startTime: '2025-03-03T00:00:00Z',
      endTime: '2025-03-04T00:00:00Z',
      pageSize: 10,
      direction: 'backward'
    };
    
    console.log('Search parameters:', searchParamsWithTime);
    
    try {
      // Search for logs
      const response = await apiClient.searchEvents(searchParamsWithTime);
      
      // Display the results
      console.log(`\nFound ${response.logs.length} logs:`);
      
      if (response.logs.length > 0) {
        console.log('-----------------------------------');
        for (const log of response.logs) {
          console.log(`[${log.time}] ${log.hostname} ${log.program || ''}: ${log.message}`);
          
          // Check if the message contains the specific ID
          if (log.message.includes(specificId)) {
            console.log('*** This log contains the specific ID in the message ***');
          }
        }
      }
      
      console.log('\nPagination info:');
      console.log(response.pageInfo);
    } catch (error) {
      console.error(`Error with time-range search:`, error.message);
    }
    
    // Try with a broader search for "SpinGeneration" and then filter client-side
    console.log(`\n\n========== Testing broader search for "SpinGeneration" ==========`);
    
    // Set up search parameters
    const searchParamsBroad = {
      filter: 'SpinGeneration',
      startTime: '2025-03-03T00:00:00Z',
      endTime: '2025-03-04T00:00:00Z',
      pageSize: 20,
      direction: 'backward'
    };
    
    console.log('Search parameters:', searchParamsBroad);
    
    try {
      // Search for logs
      const response = await apiClient.searchEvents(searchParamsBroad);
      
      // Display the results
      console.log(`\nFound ${response.logs.length} logs:`);
      
      // Count logs that contain the specific ID
      const logsWithId = response.logs.filter(log => log.message.includes(specificId));
      console.log(`Of these, ${logsWithId.length} logs contain the specific ID.`);
      
      if (logsWithId.length > 0) {
        console.log('-----------------------------------');
        for (const log of logsWithId) {
          console.log(`[${log.time}] ${log.hostname} ${log.program || ''}: ${log.message}`);
        }
      }
      
      console.log('\nPagination info:');
      console.log(response.pageInfo);
    } catch (error) {
      console.error(`Error with broad search:`, error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
