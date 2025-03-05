/**
 * Type definitions for the SolarWinds Observability MCP server
 */

import { z } from 'zod';

/**
 * SolarWinds Observability API client configuration
 */
export interface SolarWindsConfig {
  /** SolarWinds Observability API token */
  apiToken: string;
}

/**
 * SolarWinds Observability logs search parameters schema
 */
export const searchParamsSchema = {
  filter: z.string().optional().describe('A search query string'),
  group: z.string().optional().describe('Filter logs by a specific group name'),
  entityId: z.string().optional().describe('Filter logs by a specific entity ID'),
  startTime: z.string().optional().describe('UTC start time (ISO 8601 format), defaults to 24 hours ago'),
  endTime: z.string().optional().describe('UTC end time (ISO 8601 format), defaults to current time'),
  direction: z.enum(['backward', 'forward', 'tail']).default('backward').describe('Sort order: backward (oldest to newest), forward (newest to oldest), or tail (oldest to newest)'),
  pageSize: z.number().optional().default(50).describe('Maximum messages to return per page'),
  skipToken: z.string().optional().describe('Token to skip to the next page of results')
} as const;

/**
 * SolarWinds Observability logs search parameters
 */
export interface SolarWindsSearchParams {
  /** A search query string */
  filter?: string;
  /** Filter logs by a specific group name */
  group?: string;
  /** Filter logs by a specific entity ID */
  entityId?: string;
  /** UTC start time (ISO 8601 format) */
  startTime?: string;
  /** UTC end time (ISO 8601 format) */
  endTime?: string;
  /** Sort order: backward (oldest to newest), forward (newest to oldest), or tail (oldest to newest) */
  direction?: 'backward' | 'forward' | 'tail';
  /** Maximum messages to return per page */
  pageSize?: number;
  /** Token to skip to the next page of results */
  skipToken?: string;
}

/**
 * SolarWinds Observability log event
 */
export interface LogsEvent {
  /** Unique log event ID */
  id: string;
  /** Time of the log event (ISO 8601 timestamp) */
  time: string;
  /** Log message */
  message: string;
  /** Hostname of the message */
  hostname: string;
  /** Severity level */
  severity: string;
  /** Program or source of the log */
  program: string;
}

/**
 * SolarWinds Observability page info
 */
export interface PageInfo {
  /** URL for the previous page */
  prevPage: string;
  /** URL for the next page */
  nextPage: string;
}

/**
 * SolarWinds Observability logs search response
 */
export interface SolarWindsSearchResponse {
  /** An array of log events */
  logs: LogsEvent[];
  /** Pagination information */
  pageInfo: PageInfo;
}

/**
 * SolarWinds Observability log archive
 */
export interface LogsArchive {
  /** Unique identifier of the log archive */
  id: string;
  /** Name of the log archive */
  name: string;
  /** Download URL of the log archive */
  downloadUrl: string;
  /** Timestamp of when the log archive was created */
  archivedTimestamp: string;
  /** Size of the archive in bytes */
  archiveSize: number;
}

/**
 * SolarWinds Observability log archives response
 */
export interface LogsArchivesResponse {
  /** An array of log archives */
  logArchives: LogsArchive[];
  /** Pagination information */
  pageInfo: PageInfo;
}

/**
 * Histogram data point
 */
export interface HistogramDataPoint {
  /** Time bucket (formatted according to interval) */
  time: string;
  /** Number of events in this time bucket */
  count: number;
}

/**
 * Histogram visualization options schema
 */
export const histogramOptionsSchema = {
  interval: z.enum(['minute', 'hour', 'day']).default('hour').describe('Time interval for histogram buckets'),
  startTime: z.string().optional().describe('UTC start time (ISO 8601 format), defaults to 24 hours ago'),
  endTime: z.string().optional().describe('UTC end time (ISO 8601 format), defaults to current time'),
  filter: z.string().optional().describe('A search query string'),
  group: z.string().optional().describe('Filter logs by a specific group name'),
  entityId: z.string().optional().describe('Filter logs by a specific entity ID'),
  pageSize: z.number().optional().default(1000).describe('Maximum messages to analyze'),
  use_utc: z.boolean().optional().default(false).describe('Use UTC time instead of local time'),
  format: z.enum(['text', 'json']).optional().default('text').describe('Output format: text for ASCII chart, json for Claude visualization')
} as const;

/**
 * Histogram visualization options
 */
export interface HistogramOptions {
  /** Time interval for histogram buckets (minute, hour, day) */
  interval: 'minute' | 'hour' | 'day';
  /** Whether to use UTC time (default: false, use local time) */
  useUtc?: boolean;
}

/**
 * Histogram visualization data
 */
export interface HistogramData {
  /** Array of data points */
  data: HistogramDataPoint[];
  /** Total number of events */
  total: number;
  /** Start time of the histogram */
  startTime: string;
  /** End time of the histogram */
  endTime: string;
  /** Options used to generate the histogram */
  options: HistogramOptions;
}
