import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configs, ErrorHandlerFilter } from '@yellowbox-api/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = configs.port || 3333;

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle(`${configs.serviceName}`)
    .setDescription(`${configs.serviceName} api description`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalFilters(new ErrorHandlerFilter());

  await app.listen(port);
  Logger.log(
    `🚀 ${configs.serviceName} is running on: http://localhost:${port}`,
  );
}
bootstrap();
