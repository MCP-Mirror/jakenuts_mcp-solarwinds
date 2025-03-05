import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SolarWindsApiClient } from '../api-client.js';
import { z } from 'zod';
import { parseLogResourceUri, readLogResource } from './log-resources.js';

/**
 * Register resources with the MCP server
 * @param server MCP server instance
 * @param apiClient SolarWinds Observability API client
 */
export function registerResources(server: McpServer, apiClient: SolarWindsApiClient) {
  // Currently, the MCP SDK doesn't support resource templates directly
  // This function is kept as a placeholder for future implementation
  console.error('Resource registration is not supported in the current MCP SDK version');
}
