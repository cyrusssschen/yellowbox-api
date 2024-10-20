import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { configs } from '../../configs';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger: Logger = new Logger(
    configs.serviceName ?? 'Nest Application',
  );

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, query: queryParams, baseUrl: path } = request;

    // logging request
    setImmediate(() => {
      const requestLog = {
        method,
        path,
        queryParams,
        body: request.body,
      };
      this.logger.log(`Request: ${JSON.stringify(requestLog)}`);
    });

    // extracting response's body
    let body = {};
    // @ts-ignore
    const chunks = [];
    const oldEnd = response.end;
    response.end = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }

      // @ts-ignore
      body = Buffer.concat(chunks).toString('utf8');
      // @ts-ignore
      return oldEnd.call(response, body);
    };

    // logging response
    response.on('finish', () => {
      return setTimeout(() => {
        const responseLog = {
          method,
          path,
          statusCode: response.statusCode,
          body,
        };
        this.logger.log(`Response: ${JSON.stringify(responseLog)}`);
      }, 0);
    });

    next();
  }
}
