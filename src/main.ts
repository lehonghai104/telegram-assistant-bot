import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpLoggingInterceptor } from './core/logging';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('NestApplication');

  if (configService.get('SWAGGER_ENABLE')?.toLowerCase() === 'true' && configService.get('APP_ENV')?.toLowerCase() != 'production') {
    const config = new DocumentBuilder()
      .setTitle(process.env.npm_package_name)
      .setDescription(process.env.npm_package_description)
      .setVersion(process.env.npm_package_version)
      .addBearerAuth()
      .addTag('public')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: process.env.npm_package_name,
    };
    SwaggerModule.setup('/docs', app, document, customOptions);
  }

  app.useGlobalInterceptors(new HttpLoggingInterceptor);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = +configService.get('APP_PORT', 3000);
  await app.listen(port, () => logger.log(`Application is running on port ${port}`));
}
bootstrap();
