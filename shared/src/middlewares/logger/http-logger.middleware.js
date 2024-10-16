"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const configs_1 = __importDefault(require("../../configs"));
let HttpLoggerMiddleware = class HttpLoggerMiddleware {
    constructor() {
        var _a;
        this.logger = new common_1.Logger((_a = configs_1.default.serviceName) !== null && _a !== void 0 ? _a : 'Nest Application');
    }
    use(request, response, next) {
        const { method, query: queryParams, baseUrl: path } = request;
        setImmediate(() => {
            const requestLog = {
                method,
                path,
                queryParams,
                body: request.body,
            };
            this.logger.log(`Request: ${JSON.stringify(requestLog)}`);
        });
        let body = {};
        const chunks = [];
        const oldEnd = response.end;
        response.end = (chunk) => {
            if (chunk) {
                chunks.push(Buffer.from(chunk));
            }
            body = Buffer.concat(chunks).toString('utf8');
            return oldEnd.call(response, body);
        };
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
};
exports.HttpLoggerMiddleware = HttpLoggerMiddleware;
exports.HttpLoggerMiddleware = HttpLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], HttpLoggerMiddleware);
//# sourceMappingURL=http-logger.middleware.js.map