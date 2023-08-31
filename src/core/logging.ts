import { CallHandler, createParamDecorator, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

const HEADER_KEY_LOG_ID = 'X-Trace-Id';

export const GetLogId = (request: Request) => {
  if (!request.headers[HEADER_KEY_LOG_ID]) {
    request.headers[HEADER_KEY_LOG_ID] = createId().toUpperCase();
  }
  return request.headers[HEADER_KEY_LOG_ID] as string;
}

export const LogId = createParamDecorator(
  (_: any, ctx: ExecutionContext): string => {
    const request: Request = ctx.switchToHttp().getRequest();
    return GetLogId(request);
  },
);


@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private logger = new Logger(this.constructor.name);

  public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const logId = GetLogId(request);
    this.logger.debug(`[${logId}]: Request: ${request.method} ${request.url} ${request.body ? JSON.stringify(request.body) : ''}`);
    return next.handle().pipe(
      tap((responseBody: any) => {
        this.logger.debug(`[${logId}]: Response: ${JSON.stringify(responseBody)}`);
      })
    );
  }
}
