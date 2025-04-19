import { Injectable, PipeTransform, ExecutionContext } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AbstractResponse } from './abstract-response';

@Injectable()
export class ExecutionContextToAbstractResponsePipe implements PipeTransform {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  transform(ctx: ExecutionContext): AbstractResponse {
    return new AbstractResponse(this.httpAdapterHost.httpAdapter, ctx);
  }
}
