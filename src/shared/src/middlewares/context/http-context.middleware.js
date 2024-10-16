"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpContextMiddleware = exports.HttpContext = void 0;
class HttpContext {
}
exports.HttpContext = HttpContext;
class HttpContextMiddleware {
    use(req, res, next) {
        HttpContext.request = req;
        HttpContext.response = res;
        HttpContext.headers = req.headers;
        next();
    }
}
exports.HttpContextMiddleware = HttpContextMiddleware;
//# sourceMappingURL=http-context.middleware.js.map