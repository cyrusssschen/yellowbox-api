"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
dotenv_1.default.config({ override: true });
const envVarsSchema = joi_1.default.object()
    .keys({
    NODE_ENV: joi_1.default.string().required(),
    SERVICE_NAME: joi_1.default.string(),
    PORT: joi_1.default.number().default(3003),
    JWT_SECRET: joi_1.default.string()
        .default('thisisafakesecretchangeit')
        .required()
        .description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: joi_1.default.number()
        .default(30)
        .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: joi_1.default.string()
        .default('1 days')
        .description('days after which refresh tokens expire'),
    RATE_LIMITING_CONFIG_TTL: joi_1.default.number()
        .default(60000)
        .description('ttl of rate limiting'),
    RATE_LIMITING_CONFIG_LIMIT: joi_1.default.number()
        .default(100)
        .description('limit of rate limiting'),
})
    .unknown();
const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
const configs = {
    env: envVars.NODE_ENV,
    serviceName: envVars.SERVICE_NAME,
    port: envVars.PORT,
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    },
    rateLimit: {
        ttl: envVars.RATE_LIMITING_CONFIG_TTL,
        limit: envVars.RATE_LIMITING_CONFIG_LIMIT,
    },
};
exports.default = configs;
//# sourceMappingURL=index.js.map