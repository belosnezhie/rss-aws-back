import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });
  await app.listen(process.env.PORT ?? 3000);

  app.use(
    `/product/*`,
    createProxyMiddleware({
      target: process.env.PRODUCT,
      pathRewrite: {
        '/product': '/',
      },
      secure: false,
      // onProxyReq: (proxyReq, req, res) => {
      //   console.log(proxyReq);
      //   console.log(
      //     `[NestMiddleware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
      //   );
      // },
    })
  )

  app.use(
    `/cart/*`,
    createProxyMiddleware({
      target: process.env.CART,
      pathRewrite: {
        '/cart': '/',
      },
      secure: false,
      // onProxyReq: (proxyReq, req, res) => {
      //   console.log(proxyReq);
      //   console.log(
      //     `[NestMiddleware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
      //   );
      // },
    }),
  );
}
bootstrap();
