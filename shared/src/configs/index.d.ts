declare const configs: {
    env: any;
    serviceName: any;
    port: any;
    jwt: {
        secret: any;
        accessExpirationMinutes: any;
        refreshExpirationDays: any;
    };
    rateLimit: {
        ttl: any;
        limit: any;
    };
};
export default configs;
