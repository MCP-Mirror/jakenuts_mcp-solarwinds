import { SolarWindsApiClient } from '../api-client.js';
import { SolarWindsSearchParams } from '../utils/types.js';

/**
 * Search SolarWinds Observability logs
 * @param apiClient SolarWinds Observability API client
 * @param args Search parameters
 * @returns Search results as formatted text
 */
export async function searchLogs(
  apiClient: SolarWindsApiClient,
  args: Record<string, any>
): Promise<string> {
  try {
    // Get current date/time
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Validate and convert arguments to search parameters
    const params: SolarWindsSearchParams = {
      // Default to searching the last 24 hours if no time range is specified
      startTime: args.startTime !== undefined ? args.startTime : oneDayAgo.toISOString(),
      endTime: args.endTime !== undefined ? args.endTime : now.toISOString(),
      // Default limit to 50 results
      pageSize: args.pageSize !== undefined ? args.pageSize : 50,
      // Default direction to backward (oldest to newest)
      direction: args.direction || 'backward'
    };

    // Add optional parameters if provided
    if (args.filter !== undefined) params.filter = args.filter;
    if (args.group !== undefined) params.group = args.group;
    if (args.entityId !== undefined) params.entityId = args.entityId;
    if (args.skipToken !== undefined) params.skipToken = args.skipToken;

    // Perform the search
    const response = await apiClient.searchEvents(params);

    // Format the response
    let result = '';

    // Add search parameters
    result += 'Search Parameters:\n';
    if (params.filter) result += `Query: ${params.filter}\n`;
    if (params.entityId) result += `Entity ID: ${params.entityId}\n`;
    if (params.group) result += `Group: ${params.group}\n`;
    if (params.startTime) result += `Start Time: ${params.startTime}\n`;
    if (params.endTime) result += `End Time: ${params.endTime}\n`;
    if (params.direction) result += `Direction: ${params.direction}\n`;
    if (params.pageSize) result += `Page Size: ${params.pageSize}\n`;
    result += '\n';

    // Add search metadata
    result += `Found ${response.logs.length} logs\n`;
    if (response.pageInfo.nextPage) result += 'More logs available. Use skipToken to get the next page.\n';
    result += '\n';

    // Add events
    if (response.logs.length === 0) {
      result += 'No logs found matching the search criteria.\n';
    } else {
      result += 'Logs:\n';
      for (const log of response.logs) {
        result += `[${log.time}] ${log.hostname} ${log.program || ''}: ${log.message}\n`;
      }
    }

    return result;
  } catch (error) {
    throw error;
  }
}
