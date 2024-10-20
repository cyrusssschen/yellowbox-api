import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
export declare class HttpLoggerMiddleware implements NestMiddleware {
    private logger;
    use(request: Request, response: Response, next: NextFunction): void;
}
