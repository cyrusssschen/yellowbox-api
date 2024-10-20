import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { BookingsController } from './features/v1/booking.controller';
import { BookingService } from './features/v1/booking.service';
import {
  configs,
  FirebaseService,
  FirebaseAuthStrategy,
  HttpContextMiddleware,
  HttpLoggerMiddleware,
} from '@yellowbox-api/shared';

@Module({
  imports: [
    PassportModule,
    HttpModule,
    ThrottlerModule.forRoot([
      {
        ttl: configs.rateLimit.ttl,
        limit: configs.rateLimit.limit,
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [
    FirebaseService,
    BookingService,
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
