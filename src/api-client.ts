import axios, { AxiosInstance } from 'axios';
import { SolarWindsSearchParams, SolarWindsSearchResponse, LogsArchivesResponse } from './utils/types.js';

/**
 * SolarWinds Observability API client
 */
export class SolarWindsApiClient {
  private readonly apiToken: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl = 'https://api.na-01.cloud.solarwinds.com/v1';

  /**
   * Create a new SolarWinds Observability API client
   * @param apiToken SolarWinds Observability API token
   */
  constructor(apiToken: string) {
    this.apiToken = apiToken;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Search for logs in SolarWinds Observability
   * @param params Search parameters
   * @returns Search response
   * @throws {Error} If the API request fails
   */
  async searchEvents(params: SolarWindsSearchParams = {}): Promise<SolarWindsSearchResponse> {
    try {
      const response = await this.axiosInstance.get<SolarWindsSearchResponse>('/logs', {
        params,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          throw new Error('Invalid API token. Please check your SOLARWINDS_API_TOKEN environment variable.');
        } else if (status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API error: ${message} (${status})`);
        }
      }

      throw new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Perform a live tail search
   * This is a convenience method that sets the direction parameter to 'tail'
   * @param params Search parameters
   * @returns Search response
   */
  async liveTail(params: Omit<SolarWindsSearchParams, 'direction'> = {}): Promise<SolarWindsSearchResponse> {
    return this.searchEvents({ ...params, direction: 'tail' });
  }

  /**
   * Search for logs in a specific time range
   * @param startTime The oldest timestamp to examine (ISO 8601 format)
   * @param endTime The newest timestamp to examine (ISO 8601 format)
   * @param params Additional search parameters
   * @returns Search response
   */
  async searchTimeRange(
    startTime: string,
    endTime: string,
    params: Omit<SolarWindsSearchParams, 'startTime' | 'endTime'> = {}
  ): Promise<SolarWindsSearchResponse> {
    return this.searchEvents({ ...params, startTime, endTime });
  }

  /**
   * Retrieve log archives
   * @param startTime The oldest timestamp to examine (ISO 8601 format)
   * @param endTime The newest timestamp to examine (ISO 8601 format)
   * @param pageSize Maximum number of archives to return
   * @param skipToken Token for pagination
   * @returns Log archives response
   */
  async getLogArchives(
    startTime?: string,
    endTime?: string,
    pageSize?: number,
    skipToken?: string
  ): Promise<LogsArchivesResponse> {
    try {
      const response = await this.axiosInstance.get<LogsArchivesResponse>('/logs/archives', {
        params: {
          startTime,
          endTime,
          pageSize,
          skipToken,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          throw new Error('Invalid API token. Please check your SOLARWINDS_API_TOKEN environment variable.');
        } else if (status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API error: ${message} (${status})`);
        }
      }

      throw new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
