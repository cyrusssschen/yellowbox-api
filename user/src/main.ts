import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import configs from 'shared/src/configs';
import { ErrorHandlerFilter } from 'shared/src/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const port = configs.port || 3366;

  const config = new DocumentBuilder()
    .setTitle(`${configs.serviceName}`)
    .setDescription(`${configs.serviceName} api description`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new ErrorHandlerFilter());

  await app.listen(port);
  Logger.log(
    `🚀 ${configs.serviceName} is running on: http://localhost:${port}`,
  );
}
bootstrap();
