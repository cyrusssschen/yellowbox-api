import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LockerController } from './features/v1/locker.controller';
import { FirebaseService } from 'shared/src/firebase';
import { LockerService } from './features/v1/locker.service';
import { FirebaseAuthStrategy } from 'shared/src/firebase/auth';
import configs from 'shared/src/configs';
import {
  HttpContextMiddleware,
  HttpLoggerMiddleware,
} from 'shared/src/middlewares';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: configs.rateLimit.ttl,
        limit: configs.rateLimit.limit,
      },
    ]),
  ],
  controllers: [LockerController],
  providers: [
    FirebaseService,
    LockerService,
    FirebaseAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpContextMiddleware, HttpLoggerMiddleware).forRoutes('*');
  }
}
