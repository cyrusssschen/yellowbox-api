import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ErrorHandlerFilter implements ExceptionFilter {
    catch(err: any, host: ArgumentsHost): any;
}
