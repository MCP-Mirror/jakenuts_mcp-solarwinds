import { SolarWindsApiClient } from '../api-client.js';
import { McpError, ErrorCode } from '../utils/mcp-types.js';

/**
 * Resource template for SolarWinds Observability logs
 */
export const logResourceTemplate = {
  uriTemplate: 'solarwinds://{query}/search',
  name: 'SolarWinds Observability log search',
  description: 'Search SolarWinds Observability logs by query',
  mimeType: 'application/json',
};

/**
 * Parse a SolarWinds Observability resource URI
 * @param uri Resource URI
 * @returns Parsed query
 * @throws {McpError} If the URI is invalid
 */
export function parseLogResourceUri(uri: string): { query: string } {
  const match = uri.match(/^solarwinds:\/\/([^/]+)\/search$/);
  if (!match) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Invalid URI format: ${uri}. Expected format: solarwinds://{query}/search`
    );
  }

  return {
    query: decodeURIComponent(match[1]),
  };
}

/**
 * Read a SolarWinds Observability log resource
 * @param apiClient SolarWinds Observability API client
 * @param uri Resource URI
 * @returns Resource content
 */
export async function readLogResource(
  apiClient: SolarWindsApiClient,
  uri: string
): Promise<{ uri: string; mimeType: string; text: string }> {
  try {
    const { query } = parseLogResourceUri(uri);

    // Perform the search
    const response = await apiClient.searchEvents({ filter: query });

    // Format the response as JSON
    const formattedResponse = {
      query,
      logs: response.logs,
      metadata: {
        pageInfo: response.pageInfo,
      },
    };

    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(formattedResponse, null, 2),
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Error reading log resource: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
