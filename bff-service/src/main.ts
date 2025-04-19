import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });
  await app.listen(process.env.PORT ?? 3000);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });

  // app.use(cors());
}
bootstrap();
