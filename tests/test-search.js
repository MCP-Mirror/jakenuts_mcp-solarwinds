/**
 * Test script to test the SolarWinds search functionality with specific queries
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
    const queries = [
      'SpinGeneration-19be7485-c506-4c52-8a03-7122ef130391 AND error',
      'SpinGeneration-19be7485-c506-4c52-8a03-7122ef130391',
      'SpinGeneration',
      'error',
      '"SpinGeneration-19be7485-c506-4c52-8a03-7122ef130391" AND "error"',
      'SpinGeneration-19be7485-c506-4c52-8a03-7122ef130391 OR error',
      'SpinGeneration-19be7485*',
      'SpinGeneration* AND error',
      'Context.CorrelationId:SpinGeneration-19be7485-c506-4c52-8a03-7122ef130391',
      'CorrelationId:SpinGeneration-19be7485-c506-4c52-8a03-7122ef130391',
      'Context:"SpinGeneration-19be7485-c506-4c52-8a03-7122ef130391"'
    ];
    
    for (const query of queries) {
      console.log(`\n\n========== Testing query: "${query}" ==========`);
      
      // Set up search parameters - without time constraints
      const searchParams = {
        filter: query,
        pageSize: 5,
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
            
            // Check if the log contains the specific ID
            if (log.message.includes('19be7485-c506-4c52-8a03-7122ef130391') || 
                (log.program && log.program.includes('19be7485-c506-4c52-8a03-7122ef130391'))) {
              console.log('*** This log contains the specific ID ***');
            }
            
            // Check if the log contains "error"
            if (log.message.toLowerCase().includes('error') || 
                (log.program && log.program.toLowerCase().includes('error'))) {
              console.log('*** This log contains "error" ***');
            }
          }
        }
        
        console.log('\nPagination info:');
        console.log(response.pageInfo);
      } catch (error) {
        console.error(`Error with query "${query}":`, error.message);
      }
    }
    
    // Now try to get logs with the specific ID by using a more targeted approach
    console.log('\n\n========== Searching for logs containing the specific ID ==========');
    
    // Get all logs with "SpinGeneration" and then filter client-side
    const searchParams2 = {
      filter: 'SpinGeneration',
      pageSize: 20,
      direction: 'backward'
    };
    
    console.log('Search parameters:', searchParams2);
    
    try {
      // Search for logs
      const response2 = await apiClient.searchEvents(searchParams2);
      
      // Filter logs that contain the specific ID
      const logsWithSpecificId = response2.logs.filter(log => 
        log.message.includes('19be7485-c506-4c52-8a03-7122ef130391') || 
        (log.program && log.program.includes('19be7485-c506-4c52-8a03-7122ef130391'))
      );
      
      // Display the results
      console.log(`\nFound ${logsWithSpecificId.length} logs containing the specific ID:`);
      
      if (logsWithSpecificId.length > 0) {
        console.log('-----------------------------------');
        for (const log of logsWithSpecificId) {
          console.log(`[${log.time}] ${log.hostname} ${log.program || ''}: ${log.message}`);
          
          // Check if the log contains "error"
          if (log.message.toLowerCase().includes('error') || 
              (log.program && log.program.toLowerCase().includes('error'))) {
            console.log('*** This log contains "error" ***');
          }
        }
      }
    } catch (error) {
      console.error('Error searching for logs with specific ID:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
