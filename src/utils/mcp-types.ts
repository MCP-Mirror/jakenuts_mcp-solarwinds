/**
 * Mock implementation of the MCP SDK types
 */

export enum ErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  Unauthorized = -32000,
  RateLimited = -32001,
}

export class McpError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'McpError';
  }
}

export const ListToolsRequestSchema = 'list_tools';
export const CallToolRequestSchema = 'call_tool';
export const ListResourcesRequestSchema = 'list_resources';
export const ListResourceTemplatesRequestSchema = 'list_resource_templates';
export const ReadResourceRequestSchema = 'read_resource';
