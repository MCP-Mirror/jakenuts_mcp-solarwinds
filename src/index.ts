#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getConfig } from './utils/config.js';
import { SolarWindsApiClient } from './api-client.js';
import { registerTools } from './tools/index.js';

/**
 * Main entry point for the SolarWinds Observability MCP server
 */
async function main() {
  try {
    console.error('Starting SolarWinds Observability MCP server...');
    
    // Create server
    const server = new McpServer(
      {
        name: 'solarwinds-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    
    // Get configuration
    const config = getConfig();
    
    // Create API client
    const apiClient = new SolarWindsApiClient(config.apiToken);
    
    // Register tools
    registerTools(server, apiClient);
    
    // Handle process signals
    process.on('SIGINT', async () => {
      console.error('Received SIGINT, shutting down...');
      await server.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.error('Received SIGTERM, shutting down...');
      await server.close();
      process.exit(0);
    });
    
    // Connect server to transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('SolarWinds Observability MCP server running on stdio');
  } catch (error) {
    console.error('Error starting SolarWinds Observability MCP server:', error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
