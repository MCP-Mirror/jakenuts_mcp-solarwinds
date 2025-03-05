import { format, parseISO, startOfMinute, startOfHour, startOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { LogsEvent, HistogramData, HistogramOptions } from './types.js';

/**
 * Generate histogram data from SolarWinds Observability logs
 * @param events Array of log events
 * @param options Histogram options
 * @returns Histogram data
 */
export function generateHistogram(
  events: any[], // Accept any array type for backward compatibility
  options: HistogramOptions
): HistogramData {
  if (events.length === 0) {
    return {
      data: [],
      total: 0,
      startTime: '',
      endTime: '',
      options,
    };
  }

  // Sort events by time
  // Handle both old PapertrailEvent (received_at) and new LogsEvent (time) formats
  const sortedEvents = [...events].sort(
    (a, b) => {
      const timeA = a.time || a.received_at;
      const timeB = b.time || b.received_at;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    }
  );

  // Get the time field based on the event format
  const getEventTime = (event: any): string => event.time || event.received_at;

  const startTime = parseISO(getEventTime(sortedEvents[0]));
  const endTime = parseISO(getEventTime(sortedEvents[sortedEvents.length - 1]));

  // Group events by time bucket
  const buckets = new Map<string, number>();
  
  for (const event of sortedEvents) {
    const date = parseISO(getEventTime(event));
    let bucketDate: Date;
    
    // Determine the start of the time bucket based on the interval
    switch (options.interval) {
      case 'minute':
        bucketDate = startOfMinute(date);
        break;
      case 'hour':
        bucketDate = startOfHour(date);
        break;
      case 'day':
        bucketDate = startOfDay(date);
        break;
      default:
        bucketDate = startOfHour(date);
    }
    
    // Format the bucket key based on the interval and timezone preference
    let bucketKey: string;
    if (options.useUtc) {
      // For UTC, use formatInTimeZone instead of format with timeZone option
      bucketKey = formatInTimeZone(bucketDate, 'UTC', getFormatPattern(options.interval));
    } else {
      bucketKey = formatInTimeZone(bucketDate, Intl.DateTimeFormat().resolvedOptions().timeZone, 
        getFormatPattern(options.interval));
    }
    
    // Increment the count for this bucket
    buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1);
  }
  
  // Convert the buckets map to an array of data points
  const data = Array.from(buckets.entries())
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time));
  
  // Format the start and end times
  const timeFormat = 'yyyy-MM-dd HH:mm:ss';
  const timeZone = options.useUtc 
    ? 'UTC'
    : Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const formattedStartTime = formatInTimeZone(startTime, timeZone, 
    options.useUtc ? `${timeFormat} 'UTC'` : `${timeFormat} z`);
  
  const formattedEndTime = formatInTimeZone(endTime, timeZone, 
    options.useUtc ? `${timeFormat} 'UTC'` : `${timeFormat} z`);
  
  return {
    data,
    total: events.length,
    startTime: formattedStartTime,
    endTime: formattedEndTime,
    options,
  };
}

/**
 * Get the format pattern for a given interval
 * @param interval Time interval
 * @returns Format pattern
 */
function getFormatPattern(interval: string): string {
  switch (interval) {
    case 'minute':
      return 'yyyy-MM-dd HH:mm';
    case 'hour':
      return 'yyyy-MM-dd HH:00';
    case 'day':
      return 'yyyy-MM-dd';
    default:
      return 'yyyy-MM-dd HH:mm';
  }
}

/**
 * Generate an ASCII chart from histogram data
 * @param histogramData Histogram data
 * @returns ASCII chart as a string
 */
export function generateAsciiChart(histogramData: HistogramData): string {
  if (histogramData.data.length === 0) {
    return 'No data available for histogram';
  }
  
  const { data, total, startTime, endTime, options } = histogramData;
  
  // Find the maximum count to scale the chart
  const maxCount = Math.max(...data.map(d => d.count));
  const chartWidth = 50; // Width of the chart in characters
  
  let chart = `Histogram of log events (${options.interval} intervals, ${options.useUtc ? 'UTC' : 'local time'})\n`;
  chart += `Time range: ${startTime} to ${endTime}\n`;
  chart += `Total events: ${total}\n\n`;
  
  // Generate the chart
  for (const point of data) {
    const barLength = Math.max(1, Math.round((point.count / maxCount) * chartWidth));
    const bar = '█'.repeat(barLength);
    chart += `${point.time.padEnd(20)} | ${bar} ${point.count}\n`;
  }
  
  return chart;
}
