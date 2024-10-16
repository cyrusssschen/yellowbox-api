# yellowbox-api

**yellowbox-api is built on top of [NestJS](https://nestjs.com/) in [microservices](https://microservices.io/) pattern. It can be easily scaled up/down by restruturing to Event Driven Architecture with Apache Kafka, CQRS, Postgres, RabbitMQ etc.**

> # Module Structure
>
> | Module Name     | Feature            |
> | --------------- | ------------------ |
> | Locker Service  | Locker Operations  |
> | User Service    | User management    |
> | Booking Service | Booking Operations |
> | Shared          | Shared Library     |

# Prerequisites

Recommend the following installation:

- Install the latest version of Node/NPM ([NVM recommended](https://github.com/nvm-sh/nvm))
- Install [YARN](https://classic.yarnpkg.com/lang/en/)
- Install Prettier formatter and ESLint lint VSCode extensions

```
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

> # Run
>
> To `run` each microservice, run this command in the root of the microservice where `package.json` is located:

> ## Env variable

Please refer to `.env.example` file located in root folder

> ## Build
>
> build each microservice in its folder:
> Please note that if code of `shared` module is changed, we would need to run `yarn build` to generate new shared library and then run `yarn install` again in service folder to make it work.

```bash
yarn install
yarn build
```

```bash
yarn start
```

> Once each service is up and running locally, open the following url to give a try:

> | Module Name     | URL                           |
> | --------------- | ----------------------------- |
> | Locker Service  | http://localhost:3355/swagger |
> | User Service    | http://localhost:3366/swagger |
> | Booking Service | http://localhost:3333/swagger |

> # Test

> > ## Unit Tests
> >
> > To `test` each microservice, run this command in the root directory of the microservice where the `package.json` file is located:

```bash
yarn test
```

> > ## E2E Tests
> >
> > Due to the time limitation, the e2e tests are not implemented

> # Documentation Apis

> > ## API endpoints

> > > Booking service

| Method | URL                 | Description          |
| ------ | ------------------- | -------------------- |
| `POST` | `/v1/booking/start` | Start a new booking. |
| `PUT`  | `/v1/booking/end`   | End a booking.       |

> > > Locker service

| Method  | URL                            | Description           |
| ------- | ------------------------------ | --------------------- |
| `GET`   | `/v1/locker/{lockerId}/status` | Get locker status.    |
| `PATCH` | `/v1/locker/{lockerId}/status` | Update locker status. |
| `PATCH` | `/v1/locker/open/{lockerId}`   | Open a locker.        |

> > > User service

| Method | URL                 | Description                     |
| ------ | ------------------- | ------------------------------- |
| `GET`  | `/v1/user/{userId}` | Create new user info by userID. |
| `POST` | `/v1/user/create`   | Create new user.                |
| `POST` | `/v1/user/login`    | Generate user token.            |

Each microservice has a `Swagger OpenAPI`. Browse to `http://localhost:<port>/swagger` for the details of each API endpoint.

## User/Locker/Booking Services API Documentation

This documentation provides an overview of the User, Locker, and Booking services, detailing authentication, endpoints, error handling, usage examples, rate limiting, and versioning strategies.

### Authentication Process

The API uses **JWT (JSON Web Tokens)** for authentication. Users must obtain a JWT token by successfully authenticating via the user service. This token should be included in the `Authorization` header for all subsequent requests.

The following `Authentication Guard` provided by nestjs and `Passport Strategy` are being used:

     - [Guard](https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard)
     - [Passport Strategy](https://www.passportjs.org/concepts/authentication/strategies/)

### Endpoint descriptions (methods, parameters, responses)

Please refer to swagger API

### Error Codes and Handling

The `ErrorHandlerFilter` filter is being used in all services.
The following error codes may be encountered:

- 400 Bad Request: Request cannot be fulfilled due to bad syntax.
- 401 Unauthorized: Authentication failed or user does not have permissions.
- 403 Forbidden: Authentication succeeded, but authenticated user does not have access to the resource.
- 404 Not Found: The requested resource could not be found.
- 409 Conflict: Request could not be processed due to conflict with the current state of the resource.
- 500 Internal Server Error: An unexpected error occurred on the server.

Each error response includes a JSON object containing a descriptive message.

### Rate Limiting Information

To ensure fair use of the API and prevent abuse, rate limiting is enforced on certain endpoints. Each user can make a limited number of requests to the API within a specified time window.

When a user exceeds the limit, they will receive a 429 Too Many Requests response. Please implement proper error handling to manage rate limiting responses.

The current implementation is using the `ThrottlerModule` provided in the following link.
https://docs.nestjs.com/security/rate-limiting

### Versioning Strategy

The API follows a versioning strategy using URL path segments. Each version is indicated in the URL, allowing clients to transition between versions smoothly without breaking existing functionality.

Current version: v1

To access a specific version, prepend the version to the endpoint:

```
/v1/user
/v1/locker
/v1/booking
```

When a new version is released, clients should update their API calls to include the new version in the URL.

### Data Model

```
Bookings (Collection)
  ├── booking_123 (Document)
       ├── lockerId: locker_456
       ├── userId: user_789
       ├── startedAt: <timestamp>
       ├── endedAt: <timestamp>
       ├── status: 'active' | 'completed'

Lockers (Collection)
  ├── locker_456 (Document)
       ├── id
       ├── status

User (Collection)
  ├── user_123 (Document)
       └── id
       └── email
       └── password
```
