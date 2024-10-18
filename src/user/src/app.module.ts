import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UserController } from './features/v1/user.controller';
import { UserService } from './features/v1/user.service';
import configs from 'shared/src/configs';
import { FirebaseService } from 'shared/src/firebase/firebase.service';
import { FirebaseAuthStrategy } from 'shared/src/firebase/auth';
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
    JwtModule.register({
      global: true,
      secret: configs.jwt.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserController],
  providers: [
    FirebaseService,
    UserService,
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
