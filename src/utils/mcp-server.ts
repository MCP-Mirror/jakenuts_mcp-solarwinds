/**
 * Mock implementation of the MCP SDK server
 */

import { McpError } from './mcp-types.js';

export interface ServerInfo {
  name: string;
  version: string;
}

export interface ServerOptions {
  capabilities: {
    resources: Record<string, unknown>;
    tools: Record<string, unknown>;
  };
}

export interface Request<T> {
  id: string;
  method: string;
  params: T;
}

export interface Response<T> {
  id: string;
  result: T;
}

export interface ErrorResponse {
  id: string;
  error: {
    code: number;
    message: string;
  };
}

export type RequestHandler<T, U> = (request: Request<T>) => Promise<U>;

export class Server {
  private readonly info: ServerInfo;
  private readonly options: ServerOptions;
  private readonly handlers: Map<string, RequestHandler<any, any>> = new Map();
  public onerror: (error: Error) => void = console.error;

  constructor(info: ServerInfo, options: ServerOptions) {
    this.info = info;
    this.options = options;
  }

  setRequestHandler<T, U>(method: string, handler: RequestHandler<T, U>): void {
    this.handlers.set(method, handler);
  }

  async handleRequest(request: Request<any>): Promise<Response<any> | ErrorResponse> {
    try {
      const handler = this.handlers.get(request.method);
      if (!handler) {
        return {
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`,
          },
        };
      }

      const result = await handler(request);
      return {
        id: request.id,
        result,
      };
    } catch (error) {
      if (error instanceof McpError) {
        return {
          id: request.id,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      this.onerror(error instanceof Error ? error : new Error(String(error)));
      return {
        id: request.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async connect(transport: any): Promise<void> {
    console.log('Server connected to transport');
  }

  async close(): Promise<void> {
    console.log('Server closed');
  }
}

export class StdioServerTransport {
  constructor() {
    console.log('StdioServerTransport created');
  }
}
