import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SolarWindsApiClient } from '../api-client.js';
import { searchParamsSchema, histogramOptionsSchema } from '../utils/types.js';
import { searchLogs } from './search-logs.js';
import { visualizeLogs } from './visualize-logs.js';

/**
 * Register tools with the MCP server
 * @param server MCP server instance
 * @param apiClient SolarWinds Observability API client
 */
export function registerTools(server: McpServer, apiClient: SolarWindsApiClient) {
  // Register search_logs tool
  server.tool(
    'search_logs',
    'Search SolarWinds Observability logs with optional filtering',
    searchParamsSchema,
    async (args) => {
      try {
        const result = await searchLogs(apiClient, args);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error searching logs: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register visualize_logs tool
  server.tool(
    'visualize_logs',
    'Generate a histogram visualization of log events',
    histogramOptionsSchema,
    async (args) => {
      try {
        const result = await visualizeLogs(apiClient, args);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error visualizing logs: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
