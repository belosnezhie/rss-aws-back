import { NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export class ProxyProductMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyProductMiddleware.name);

  private proxy = createProxyMiddleware({
    target: process.env.PRODUCT,
    pathRewrite: {
      '^/product': '',
    },
    secure: false,
    // onProxyReq: (proxyReq, req, res) => {
    //   //console.log(proxyReq);
    //   // console.log(
    //   //   `[NestMiddleware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
    //   // );
    // },
  });
  use(req: Request, res: Response, next: () => void) {
    console.log(res);
    this.logger.log(`Got invoked: '${req.originalUrl}'`);
    this.proxy(req, res, next);
  }
}
