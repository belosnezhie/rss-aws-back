import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProxyProductMiddleware } from './proxy-product-middleware';
import { ProxyCartMiddleware } from './proxy-cart-middleware';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProxyProductMiddleware)
      .forRoutes({ path: 'product/*', method: RequestMethod.ALL });
    consumer
      .apply(ProxyCartMiddleware)
      .forRoutes({ path: 'cart/*', method: RequestMethod.ALL });
  }
}
