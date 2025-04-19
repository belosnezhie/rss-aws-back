import type { ExecutionContext } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AbstractHttpAdapter } from '@nestjs/core';

export class AbstractResponse { // Note that this isn't a provider
  httpCtx: HttpArgumentsHost;

  constructor(
    private readonly httpAdapter: AbstractHttpAdapter,
    readonly executionContext: ExecutionContext,
  ) {
    this.httpCtx = executionContext.switchToHttp();
  }

  /** Define the HTTP header on the supplied response object. */
  setHeader(name: string, value: string): this {
    this.httpAdapter.setHeader(this.httpCtx.getResponse(), name, value);
    return this;
  }

  /** Define the HTTP status code on the supplied response object. */
  setStatus(statusCode: number): this {
    this.httpAdapter.status(this.httpCtx.getResponse(), statusCode);
    return this;
  }
}
