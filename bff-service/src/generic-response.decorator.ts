import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AbstractResponse } from './abstract-response';
import { ExecutionContextToAbstractResponsePipe } from './ctx-to-abstract-response.pipe';

const GetExecutionContext = createParamDecorator(
  (
    _: never,
    ctx: ExecutionContext,
  ): ExecutionContext => ctx,
);

export const GenericResponse = (): ParameterDecorator =>
  GetExecutionContext(ExecutionContextToAbstractResponsePipe);

export type GenericResponse = AbstractResponse;
