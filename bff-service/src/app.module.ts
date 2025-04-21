import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ReverseProxyProductMiddleware } from './reverse-proxy-product-middleware';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
  })],
  controllers: [],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ReverseProxyProductMiddleware)
      .forRoutes('*');
  }
} {}
