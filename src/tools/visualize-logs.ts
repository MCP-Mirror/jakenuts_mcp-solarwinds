import { SolarWindsApiClient } from '../api-client.js';
import { generateHistogram, generateAsciiChart } from '../utils/histogram.js';
import { HistogramOptions } from '../utils/types.js';

/**
 * Visualize SolarWinds Observability logs as a histogram
 * @param apiClient SolarWinds Observability API client
 * @param args Visualization parameters
 * @returns Histogram visualization as formatted text or JSON for Claude visualization
 */
export async function visualizeLogs(
  apiClient: SolarWindsApiClient,
  args: Record<string, any>
): Promise<string> {
  try {
    // Get current date/time
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Set up search parameters
    const searchParams = {
      filter: args.filter,
      entityId: args.entityId,
      group: args.group,
      // Default to searching the last 24 hours if no time range is specified
      startTime: args.startTime !== undefined ? args.startTime : oneDayAgo.toISOString(),
      endTime: args.endTime !== undefined ? args.endTime : now.toISOString(),
      pageSize: args.pageSize || 1000,
      direction: 'backward' as const // Always use backward for visualization to get oldest to newest
    };

    // Set up histogram options
    const histogramOptions: HistogramOptions = {
      interval: (args.interval as 'minute' | 'hour' | 'day') || 'hour',
      useUtc: args.use_utc || false,
    };

    // Perform the search
    const response = await apiClient.searchEvents(searchParams);

    // Convert the logs to a format compatible with the histogram generator
    const events = response.logs.map(log => ({
      id: log.id,
      received_at: log.time,
      display_received_at: log.time,
      hostname: log.hostname,
      program: log.program,
      message: log.message,
      // Add other required fields with placeholder values
      generated_at: log.time,
      source_name: log.hostname,
      source_id: 0,
      source_ip: '',
      facility: '',
      severity: log.severity
    }));

    // Generate histogram data
    const histogramData = generateHistogram(events, histogramOptions);

    // Check if the user wants JSON output for Claude visualization
    if (args.format === 'json') {
      // Format the data for Claude visualization
      const timeRanges = histogramData.data.map(point => point.time);
      const counts = histogramData.data.map(point => point.count);
      
      const claudeVisualizationData = {
        timeRanges,
        counts,
        total: histogramData.total,
        queryParams: {
          query: searchParams.filter || '',
          startTime: searchParams.startTime,
          endTime: searchParams.endTime
        }
      };
      
      return JSON.stringify(claudeVisualizationData, null, 2);
    }

    // Generate ASCII chart for text output
    const chart = generateAsciiChart(histogramData);

    // Format the response
    let result = '';

    // Add search parameters
    result += 'Visualization Parameters:\n';
    if (searchParams.filter) result += `Query: ${searchParams.filter}\n`;
    if (searchParams.entityId) result += `Entity ID: ${searchParams.entityId}\n`;
    if (searchParams.group) result += `Group: ${searchParams.group}\n`;
    result += `Start Time: ${searchParams.startTime}\n`;
    result += `End Time: ${searchParams.endTime}\n`;
    result += `Interval: ${histogramOptions.interval}\n`;
    result += `Timezone: ${histogramOptions.useUtc ? 'UTC' : 'Local'}\n`;
    result += `Page Size: ${searchParams.pageSize}\n`;
    result += '\n';

    // Add search metadata
    result += `Analyzed ${response.logs.length} logs\n`;
    if (response.pageInfo.nextPage) result += 'Note: More logs available. Results may be incomplete.\n';
    result += '\n';

    // Add chart
    result += chart;

    // Add note about JSON format
    result += '\n\nTip: Add "format": "json" to get data in a format that Claude can visualize as a chart.\n';

    return result;
  } catch (error) {
    throw error;
  }
}
