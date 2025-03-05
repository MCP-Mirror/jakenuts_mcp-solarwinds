import { SolarWindsConfig } from './types.js';
import fs from 'fs';
import path from 'path';

/**
 * Get the SolarWinds Observability configuration
 * 
 * Configuration is loaded from the following sources, in order of precedence:
 * 1. SOLARWINDS_API_TOKEN environment variable
 * 2. Local .env file in the current directory (for testing)
 * 3. MCP configuration file (handled by the MCP framework)
 * 
 * @returns The SolarWinds Observability configuration
 * @throws {Error} If the API token is not provided
 */
export function getConfig(): SolarWindsConfig {
  // First, try to get the token from the environment variable
  let apiToken = process.env.SOLARWINDS_API_TOKEN;

  // If not found, try to load from a local .env file (for testing)
  if (!apiToken) {
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n');
        
        for (const line of envLines) {
          const match = line.match(/^SOLARWINDS_API_TOKEN=(.+)$/);
          if (match) {
            apiToken = match[1].trim();
            break;
          }
        }
      }
    } catch (error) {
      // Ignore errors reading the .env file
      console.error('Error reading .env file:', error);
    }
  }

  // If still not found, the MCP framework should have provided it
  if (!apiToken) {
    throw new Error('SOLARWINDS_API_TOKEN environment variable is required. ' +
      'Please provide it in your MCP configuration or create a .env file for testing.');
  }

  return {
    apiToken,
  };
}
