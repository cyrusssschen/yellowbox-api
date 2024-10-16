import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

// Load the appropriate .env file based on the environment
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ override: true });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().required(),
    SERVICE_NAME: Joi.string(),
    PORT: Joi.number().default(3003),
    JWT_SECRET: Joi.string()
      .default('thisisafakesecretchangeit')
      .required()
      .description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.string()
      .default('1 days')
      .description('days after which refresh tokens expire'),
    RATE_LIMITING_CONFIG_TTL: Joi.number()
      .default(60000)
      .description('ttl of rate limiting'),
    RATE_LIMITING_CONFIG_LIMIT: Joi.number()
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

export default configs;
